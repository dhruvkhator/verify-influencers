import mongoose from "mongoose";

const podcastSchema = new mongoose.Schema({
    podcast_id: String,
    title: String,
    url: String,
    influencer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Influencer' },
});

export default mongoose.model('Podcast', podcastSchema, 'podcasts');