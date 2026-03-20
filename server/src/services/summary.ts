import * as fs from 'fs';
import * as path from 'path';

interface Issue {
  issue: string;
  suggestion: string;
  explanation: string;
}

interface LineError {
  error: string;
  suggestion: string;
  explanation: string;
  type?: 'grammar' | 'lexical';
}

interface GradingResult {
  taskResponse: {
    score: number;
    feedback: string;
    issues: Issue[];
  };
  coherence: {
    score: number;
    feedback: string;
    issues: Issue[];
  };
  lexical: {
    score: number;
    feedback: string;
    lineErrors: LineError[];
  };
  grammar: {
    score: number;
    feedback: string;
    lineErrors: LineError[];
  };
}

interface SummaryRequest {
  topic: string;
  content: string;
  gradingResult: GradingResult;
}

function deduplicateErrors(errors: LineError[]): LineError[] {
  const seen = new Set<string>();
  return errors.filter((err) => {
    const key = `${err.error.trim()}-${err.suggestion.trim()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function deduplicateIssues(issues: Issue[]): Issue[] {
  const seen = new Set<string>();
  return issues.filter((iss) => {
    const key = `${iss.issue.trim()}-${iss.suggestion.trim()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function generateSummaryDocument(data: SummaryRequest): string {
  const { topic, content, gradingResult } = data;
  const timestamp = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });

  const taskResponseIssues = deduplicateIssues(gradingResult.taskResponse?.issues || []);
  const coherenceIssues = deduplicateIssues(gradingResult.coherence?.issues || []);
  const lexicalErrors = deduplicateErrors(gradingResult.lexical?.lineErrors || []);
  const grammarErrors = deduplicateErrors(gradingResult.grammar?.lineErrors || []);

  const totalScore = (
    gradingResult.taskResponse.score +
    gradingResult.coherence.score +
    gradingResult.lexical.score +
    gradingResult.grammar.score
  ) / 4;

  let md = `# 雅思作文批改总结

## 基本信息
- **题目**: ${topic}
- **批改时间**: ${timestamp}
- **总分**: ${totalScore.toFixed(1)} / 9.0

## 原文
${content}

## 评分概览
| 维度 | 分数 | 评语 |
|------|------|------|
| Task Response (写作任务回应) | ${gradingResult.taskResponse.score} | ${gradingResult.taskResponse.feedback} |
| Coherence and Cohesion (连贯与衔接) | ${gradingResult.coherence.score} | ${gradingResult.coherence.feedback} |
| Lexical Resource (词汇丰富程度) | ${gradingResult.lexical.score} | ${gradingResult.lexical.feedback} |
| Grammatical Range and Accuracy (语法多样性及准确性) | ${gradingResult.grammar.score} | ${gradingResult.grammar.feedback} |

`;

  if (grammarErrors.length > 0) {
    md += `## 语法错误（共 ${grammarErrors.length} 处）
| 错误位置 | 错误内容 | 修改建议 | 说明 |
|----------|----------|----------|------|
`;
    grammarErrors.forEach((err) => {
      md += `| - | ${err.error} | ${err.suggestion} | ${err.explanation} |\n`;
    });
    md += `\n`;
  }

  if (lexicalErrors.length > 0) {
    md += `## 词汇错误（共 ${lexicalErrors.length} 处）
| 错误位置 | 错误内容 | 修改建议 | 说明 |
|----------|----------|----------|------|
`;
    lexicalErrors.forEach((err) => {
      md += `| - | ${err.error} | ${err.suggestion} | ${err.explanation} |\n`;
    });
    md += `\n`;
  }

  if (taskResponseIssues.length > 0) {
    md += `## 写作任务回应问题（共 ${taskResponseIssues.length} 处）
| 问题 | 修改建议 | 说明 |
|------|----------|------|
`;
    taskResponseIssues.forEach((iss) => {
      md += `| ${iss.issue} | ${iss.suggestion} | ${iss.explanation} |\n`;
    });
    md += `\n`;
  }

  if (coherenceIssues.length > 0) {
    md += `## 连贯与衔接问题（共 ${coherenceIssues.length} 处）
| 问题 | 修改建议 | 说明 |
|------|----------|------|
`;
    coherenceIssues.forEach((iss) => {
      md += `| ${iss.issue} | ${iss.suggestion} | ${iss.explanation} |\n`;
    });
    md += `\n`;
  }

  md += `## 总评
${gradingResult.taskResponse.feedback}

${gradingResult.coherence.feedback}

${gradingResult.lexical.feedback}

${gradingResult.grammar.feedback}
`;

  return md;
}

const SUMMARY_DIR = path.join(process.cwd(), 'summaries');

export async function saveSummaryToFile(content: string, filename: string): Promise<string> {
  if (!fs.existsSync(SUMMARY_DIR)) {
    fs.mkdirSync(SUMMARY_DIR, { recursive: true });
  }

  const filePath = path.join(SUMMARY_DIR, filename);
  fs.writeFileSync(filePath, content, 'utf-8');
  return filePath;
}

export function generateFilename(topic: string): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const shortTopic = topic.slice(0, 20).replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '');
  return `IELTS_总结_${date}_${shortTopic}.md`;
}
