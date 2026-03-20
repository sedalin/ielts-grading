import { Router } from 'express';
import { gradeEssay } from '../services/minimax.js';
import { generateSummaryDocument, saveSummaryToFile, generateFilename } from '../services/summary.js';

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

router.post('/summary', async (req, res) => {
  try {
    const { topic, content, gradingResult } = req.body;

    if (!topic || !content || !gradingResult) {
      res.status(400).json({ error: 'Topic, content and gradingResult are required' });
      return;
    }

    const markdown = generateSummaryDocument({ topic, content, gradingResult });
    const filename = generateFilename(topic);
    const filePath = await saveSummaryToFile(markdown, filename);

    res.json({ success: true, markdown, filename, filePath });
  } catch (error) {
    console.error('Summary generation error:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

export default router;
