import { Queue, Worker } from "bullmq";
import dotenv from 'dotenv';
import Influencer from "../models/Influencer.js";
import Claim from "../models/Claim.js";
import Verification from "../models/Verification.js";
import { claimVerification } from "../utils/verifyClaims.js";

import mongoose from "mongoose";
import { emitEvent } from "../socket.js";

dotenv.config();

const redisConnection = {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : undefined, // Convert to number
    username: "default",
    password: process.env.REDIS_PASSWORD
};

const verifyClaimsQueue = new Queue('verifyClaimsQueue', {
    connection: redisConnection
});

function calculateTrustScore(verifiedClaims) {
    let trustScore = 0;
    verifiedClaims.forEach(vc => {
        trustScore += parseInt(vc.confidence);
    });

    return trustScore;
}

const verifyClaimsWorker = new Worker('verifyClaimsQueue', async (job) => {
    try {

        console.log("verfiyclaims worker started")
        const { influencerId, apiKey, count } = job.data;

        //console.log(count);

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

        const trustScore = 100 * (calculateTrustScore(verifiedClaims) / (verifiedClaims.length * 10));

        await Influencer.findByIdAndUpdate(influencerId, {
            trust_score: trustScore
        })

    } catch (error) {
        console.error(`Error verifying claims of influencer @${job.data.influencerId}:`, error.message);
        throw error;
    }
}, {
    connection: redisConnection
})


verifyClaimsWorker.on('completed', async(job) => {
    
    try {
        const {influencerId} = job.data;
        
        const influencer = await Influencer.findById(influencerId);
        if(!influencer) throw new Error(`${influencerId} not found in DB`);

        console.log(`Job ${job.id} for @${influencer.handle} has been completed`);
    
        emitEvent("analysisComplete", {
            jobId: job.id,
            influencerId: influencer._id.toString(),
            influencerXHandle: influencer.handle
        })
    } catch (error) {
        console.log("Error after completing the job: ", error);
    }

});

verifyClaimsWorker.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed:`, err);
    emitEvent("analysisFailed", {
        jobId: job.id,
        error: err.message
    })
});


export default verifyClaimsQueue;