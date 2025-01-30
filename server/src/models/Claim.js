import mongoose from "mongoose";

const claimSchema = new mongoose.Schema({
    claim_text: String,
    category: String, // e.g., Nutrition, Medicine, Mental Health
    source_type: String, // "tweet" or "podcast"
    source_id: String, // Dynamic reference
    created_at: Date,
    influencer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Influencer' },
});

claimSchema.index({ influencer_id: 1 });
claimSchema.index({ influencer_id: 1, created_at: -1 });

export default mongoose.model('Claim', claimSchema, 'claims');