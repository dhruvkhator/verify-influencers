import { Router } from 'express';
import { addAnalyzeInfluencer, getAllInfluencers, getInfluencerDetailsByHandle } from '../controllers/influencerController.js';


const router = Router();

router.post('/add', addAnalyzeInfluencer);
router.get('/profile/:handle', getInfluencerDetailsByHandle);
router.get('/all', getAllInfluencers)

export default router;