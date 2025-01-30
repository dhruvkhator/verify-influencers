import mongoose from "mongoose";

const verificationSchema = new mongoose.Schema({
    claim_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Claim' },
    status: String, // Verified, Questionable, Debunked
    confidence: Number, // AI-generated score (e.g., 1-10)
    research_paper: String, // Link to the research paper
    reason: String
});

verificationSchema.index({ claim_id: 1 });

export default mongoose.model('Verification', verificationSchema, 'verifications');