import dotenv from 'dotenv';
import axios from 'axios';

import Influencer from '../models/Influencer.js'
import { AxiosError } from 'axios';
import Claim from '../models/Claim.js';
import Verification from '../models/Verification.js';
import { claimVerification } from '../utils/verifyClaims.js';
import { sanitizeText } from '../utils/cleaner.js';
import { extractClaims } from '../utils/extractClaims.js';
import influencerQueue from '../workers/addAnalyzeInfluencer.js';
import verifyClaimsQueue from '../workers/verifyInfluencerClaims.js';
import { emitEvent } from '../socket.js';

dotenv.config();

const apify_api = process.env.APIFY_API;

const ourApiKey = process.env.PERPLEXITY_API_KEY;


export const addAnalyzeInfluencer = async (req, res) => {
    try {
        const { x_handle, apiKey, claims_count } = req.body;
        let count = 10;
        if (claims_count && claims_count > 10) {
            count = claims_count
        }
        console.log(req.body)

        if (!x_handle) {
            return res.status(403).json({ error: "Username is required", code: "ERR" });
        }

        let job;
        // Check if influencer exists
        const influencer = await Influencer.findOne({ handle: x_handle });
        if (!influencer) {
            if (apiKey) {
                //console.log("apikey", count, apiKey)
                job = await influencerQueue.add("analyzeInfluencer", { x_handle, apiKey, count })
            }
            else {
                // console.log("no apikey", ourApiKey, count)
                job = await influencerQueue.add("analyzeInfluencer", { x_handle, apiKey: ourApiKey, count });
            }

            // Add task to the queue

            return res.status(200).json({ message: `Processing of tweets for @${x_handle} has started`, jobId: job.id, code: "PROCESSING" })
        }

        const hasVerifiedClaims = await Claim.aggregate([
            { $match: { influencer_id: influencer._id } },
            {
                $lookup: {
                    from: "verifications",
                    localField: "_id",
                    foreignField: "claim_id",
                    as: "verification"
                }
            },
            { $match: { verification: { $ne: [] } } },
            { $limit: 1 },  // Stop after finding one verified claim
            {
                $project: {
                    _id: 1  // Just return an ID, doesn't matter
                }
            }
        ]);

        //console.log(hasVerifiedClaims)
        
        const exists = hasVerifiedClaims.length > 0;

        //console.log(exists);

        if(exists){
            return res.status(203).json({ message: `@${x_handle} already exists in our DB`, handle: x_handle, code: "CLAIMS_PRESENT" });
        }

        let verifiedClaimsJob;

        if(apiKey){
            verifiedClaimsJob = await verifyClaimsQueue.add("verifyInfluencerClaim", {influencerId: influencer._id, apiKey, count})
        }else{
            verifiedClaimsJob = await verifyClaimsQueue.add("verifyInfluencerClaim", {influencerId: influencer._id, apiKey: ourApiKey, count})
        }

        res.status(200).json({ message: `Processing of tweets for @${x_handle} has started`, jobId: verifiedClaimsJob.id, code: "PROCESSING" })

        
    } catch (error) {
        console.log('Error while adding the influencer: ', error);
        res.status(500).json({ error: "Internal server error", code: "ERR" })
    }
};






export const getInfluencerDetailsByHandle = async (req, res) => {
    try {
        emitEvent("abcd", {abcd: "hiii"})
        const handle = req.params.handle;

        if (!handle) return res.status(403).json({ error: "Username is required", code: "ERR" });

        const influencer = await Influencer.findOne({ handle });

        if (!influencer) {
            return res.status(404).json({ error: "Influencer not found", code: "ERR" });
        }

        const verifiedClaims = await Claim.aggregate([
            { $match: { influencer_id: influencer._id } },
            {
                $lookup: {
                    from: "verifications",
                    localField: "_id",
                    foreignField: "claim_id",
                    as: "verification"
                }
            },
            { $match: { verification: { $ne: [] } } },
            {
                $project: {
                    _id: 1,
                    claim_text: 1,
                    influencer_id: 1,
                    verification: 1,
                    created_at: 1,
                    category: 1
                }
            }
        ]);


        if (verifiedClaims.length === 0) return res.status(400).json({ error: "No Verified claims found for this influencer", code: "ERR" });

        const influencerData = {
            ...influencer.toObject(), // Existing influencer properties
            verifiedClaims: verifiedClaims.map((claim) => ({
                _id: claim._id,
                claim_text: claim.claim_text,
                influencer_id: claim.influencer_id,
                created_at: claim.created_at,
                category: claim.category,
                verification: claim.verification || [], // Ensure it's always an array
            })),
        };

        res.status(200).json({ influencerData });

    } catch (error) {
        console.log("Error getting verified claims for an influencer: ", error);
        res.status(500).json({ error: "Internal Server Error", code: "ERR" })
    }
}

export const getAllInfluencers = async (req, res) => {
    try {
        
        const influencers = await Influencer.find()
            .sort({ trust_score: -1 });

        res.status(200).json({ influencers });


    } catch (error) {
        console.log("Error getting all the influencers: ", error);
        res.status(500).json({ error: "Internal Server Error", code: "ERR" })
    }
}