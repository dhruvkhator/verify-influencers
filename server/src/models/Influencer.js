import mongoose from "mongoose";

const influencerSchema = new mongoose.Schema({
    screen_name: String,
    handle: String,
    bio: String,
    followers: Number,
    blue_verified: Boolean,
    avatar: String,
    trust_score: Number
});

export default mongoose.model('Influencer', influencerSchema, 'influencers');