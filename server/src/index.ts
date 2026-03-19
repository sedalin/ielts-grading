import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import gradeRouter from './routes/grade.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/grade', gradeRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
