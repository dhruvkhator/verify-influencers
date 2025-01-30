import { Queue, Worker } from "bullmq";
import axios from 'axios';
import dotenv from 'dotenv';
import Influencer from "../models/Influencer.js";
import Claim from "../models/Claim.js";
import Verification from "../models/Verification.js";
import { claimVerification } from "../utils/verifyClaims.js";
import { sanitizeText } from "../utils/cleaner.js";
import { extractClaims } from "../utils/extractClaims.js";
import { deduplicateClaims } from "../utils/filterDuplicates.js";
import Tweet from "../models/Tweet.js";
import mongoose from "mongoose";
import { emitEvent } from "../socket.js";

dotenv.config();

const apify_api = process.env.APIFY_API;


const redisConnection = {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : undefined, // Convert to number
    username: "default",
    password: process.env.REDIS_PASSWORD
};

const influencerQueue = new Queue('influencerQueue', {
    connection: redisConnection
});

async function fetchTweets(x_handle, influencerId) {
    try {
        const response = await axios.post(
            apify_api,
            { max_posts: 100, username: x_handle },
            { params: { fields: "tweet_id,created_at,text,lang,author" } }
        );

        const tweets = response.data;
        if (tweets.length <= 0) throw new Error("Failed to fetch tweets");

        for (const tweet of tweets) {
            await Tweet.create({
                tweet_id: tweet.tweet_id,
                lang: tweet.lang,
                text: tweet.text,
                created_at: tweet.created_at,
                influencer_id: new mongoose.Types.ObjectId(influencerId)
            })
        }
        return tweets;
    } catch (error) {
        console.error("Error while fetching tweets:", error);
        throw new Error("Failed to fetch tweets");
    }
}

// Extract and deduplicate claims from tweets
async function extractAndDeduplicateClaims(tweets) {
    const allClaims = [];
    let unqiueClaims = [];

    for (const tweet of tweets) {
        if (tweet.text) {
            const claims = await extractClaims(tweet.text);
            if (claims.length > 0) {
                for (const claim of claims) {
                    if (claim.claimText && claim.category) {
                        allClaims.push({
                            source_id: tweet.tweet_id,
                            category: claim.category,
                            claim: claim.claimText,
                            created_at: tweet.created_at
                        });
                    }
                }
            }
        }
    }
    console.log(allClaims.length)
    if(allClaims.length > 0){
        unqiueClaims = await deduplicateClaims(allClaims);
    }
    return unqiueClaims;
}

async function saveClaims(claims, influencerId) {
    const sanitizedClaims = claims.map(claim => ({
        claim_text: sanitizeText(claim.claim),
        source_type: "X",
        source_id: claim.source_id,
        created_at: new Date(claim.created_at),
        category: sanitizeText(claim.category),
        influencer_id: new mongoose.Types.ObjectId(influencerId)
    }));
    return await Claim.insertMany(sanitizedClaims);
}

async function verifyRecentClaims(influencerId, apiKey, count) {
    //Getting the recent 10 claims to verify. 
    //This can also be done by just running a loop on unqiueClaims from start to get the recent claims but this is much better way of doing stuff
    const recentClaims = await Claim.find({ influencer_id: influencerId })
        .sort({ created_at: -1 })
        .limit(count);
    const verifiedClaims = [];

    for (const claim of recentClaims) {
        if (claim.claim_text) {
            const verifiedClaim = await claimVerification(claim.claim_text, apiKey);
            if (verifiedClaim === "Unauthorized") {
                throw new Error("Invalid API KEY - Unauthorized");

            }
            const verification = await Verification.create({
                status: verifiedClaim.status,
                confidence: verifiedClaim.confidenceScore,
                claim_id: new mongoose.Types.ObjectId(claim._id),
                reason: verifiedClaim.reason
            });
            verifiedClaims.push(verification);
        }
    }
    return verifiedClaims;
}


function calculateTrustScore(verifiedClaims) {
    let trustScore = 0;
    verifiedClaims.forEach(vc => {
        trustScore += parseInt(vc.confidence);
    });

    return trustScore;
}

const influencerWorker = new Worker('influencerQueue', async (job) => {
    try {

        console.log(`Job started: ${job.id}`);

        // Record the start time
        const startTime = Date.now();

        const { x_handle, apiKey, count } = job.data;

        const addedInfluencer = await Influencer.create({ handle: x_handle });

        const tweets = await fetchTweets(x_handle, addedInfluencer._id);
        if (!tweets || tweets.length === 0) {
            throw new Error("No tweets found for the influencer");
        }

        // Extract and deduplicate claims from tweets
        const allClaims = await extractAndDeduplicateClaims(tweets);
        if (!allClaims || allClaims.length === 0) {
            throw new Error("No valid claims found in the tweets");
        }

        // Bulk insert claims into the database
        const savedClaims = await saveClaims(allClaims, addedInfluencer._id);
        if (!savedClaims || savedClaims.length === 0) {
            throw new Error("Failed to save claims to the database");
        }

        // Verify the recent claims
        const verifiedClaims = await verifyRecentClaims(addedInfluencer._id, apiKey, count);
        if (!verifiedClaims || verifiedClaims.length === 0) {
            throw new Error("No claims were verified");
        }

        const trustScore = 100 * (calculateTrustScore(verifiedClaims) / (verifiedClaims.length * 10));

        await Influencer.findByIdAndUpdate(addedInfluencer._id, {
            trust_score: trustScore
        })

        // Calculate the time taken
        const endTime = Date.now();
        const elapsedTime = endTime - startTime;


        console.log(`Influencer @${x_handle} analyzed successfully`, { verifiedClaims });
        console.log(`Job completed: ${job.id} in ${elapsedTime / 1000} seconds`);


    } catch (error) {
        console.error(`Error processing influencer @${job.data.x_handle}:`, error.message);
        throw error;
    }
}, {
    connection: redisConnection
})

influencerWorker.on('completed', async (job) => {

    try {
        const { x_handle } = job.data;

        const influencer = await Influencer.findOne({ handle: x_handle });
        if (!influencer) throw new Error(`@${x_handle} not found in DB`);

        console.log(`Job ${job.id} for @${x_handle} has been completed`);

        emitEvent("analysisComplete", {
            jobId: job.id,
            influencerId: influencer._id.toString(),
            influencerXHandle: x_handle
        })
    } catch (error) {
        console.log("Error after completing the job: ", error);
    }

});

influencerWorker.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed:`, err);

    emitEvent("analysisFailed", {
        jobId: job.id,
        error: err.message
    })
});

export default influencerQueue;