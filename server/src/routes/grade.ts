import { Router } from 'express';
import { gradeEssay } from '../services/minimax.js';

const router = Router();

interface GradeRequest {
  topic: string;
  content: string;
}

router.post('/', async (req, res) => {
  try {
    const { topic, content } = req.body as GradeRequest;

    if (!topic || !content) {
      res.status(400).json({ error: 'Topic and content are required' });
      return;
    }

    const result = await gradeEssay(topic, content);
    res.json(result);
  } catch (error) {
    console.error('Grading error:', error);
    res.status(500).json({ error: 'Failed to grade essay' });
  }
});

export default router;
