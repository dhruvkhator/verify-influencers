import mongoose from "mongoose";

const tweetSchema = new mongoose.Schema({
    tweet_id: String,
    created_at: Date,
    text: String,
    lang: String,
    pmid: [String],
    influencer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Influencer' },
});

export default mongoose.model('Tweet', tweetSchema, 'tweets')