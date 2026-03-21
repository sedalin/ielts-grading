interface LineError {
  error: string;
  suggestion: string;
  explanation: string;
  type: 'grammar' | 'lexical';
}

interface Issue {
  issue: string;
  suggestion: string;
  explanation: string;
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

interface MiniMaxMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY || 'your-api-key';
const MINIMAX_BASE_URL = 'https://api.minimax.chat/v1';

async function callMiniMax(messages: MiniMaxMessage[]): Promise<string> {
  const response = await fetch(`${MINIMAX_BASE_URL}/text/chatcompletion_v2`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MINIMAX_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'MiniMax-M2.7',
      messages,
      temperature: 0,
    }),
  });

  const data = await response.json();
  console.log('MiniMax API response:', JSON.stringify(data, null, 2));

  if (!response.ok) {
    throw new Error(`MiniMax API error: ${response.statusText} - ${JSON.stringify(data)}`);
  }

  if (!data.choices || !data.choices[0]) {
    throw new Error(`Invalid API response: ${JSON.stringify(data)}`);
  }

  return data.choices[0].message.content;
}

export async function gradeEssay(topic: string, content: string): Promise<GradingResult> {
  const systemPrompt = `你是一位极其严格的雅思写作评分专家。请用挑剔的眼光对学生的作文进行严格批改。

请严格按照以下JSON格式返回结果，不要添加任何其他内容：

{
  "taskResponse": {
    "score": 分数(1-9),
    "feedback": "总体评语",
    "issues": [
      { "issue": "具体问题描述", "suggestion": "修改建议", "explanation": "详细解释" }
    ]
  },
  "coherence": {
    "score": 分数(1-9),
    "feedback": "总体评语",
    "issues": [
      { "issue": "具体问题描述", "suggestion": "修改建议", "explanation": "详细解释" }
    ]
  },
  "lexical": {
    "score": 分数(1-9),
    "feedback": "总体评语",
    "lineErrors": [
      { "error": "原文中的错误内容（必须是文章中实际存在的文本）", "suggestion": "修改建议", "explanation": "详细解释", "type": "lexical" }
    ]
  },
  "grammar": {
    "score": 分数(1-9),
    "feedback": "总体评语",
    "lineErrors": [
      { "error": "原文中的错误内容（必须是文章中实际存在的文本）", "suggestion": "修改建议", "explanation": "详细解释", "type": "grammar" }
    ]
  }
}

===== 详细评分标准 =====

1. Task Response (写作任务回应) - 请严格审查：
   - 是否完全回应题目要求
   - 观点是否清晰、具体、有深度
   - 问题举例："观点过于笼统"、"例子与观点脱节"

2. Coherence and Cohesion (连贯与衔接) - 请严格审查：
   - 逻辑是否连贯
   - 段落组织是否合理
   - 问题举例："缺少过渡词"、"逻辑跳转生硬"

3. Lexical Resource (词汇丰富程度) - 请严格审查：
   - 用词是否准确
   - 拼写是否正确
   - 问题举例："拼写错误"、"用词不当"

4. Grammatical Range and Accuracy (语法多样性及准确性) - 请严格审查：
   - 语法是否准确
   - 问题举例："主谓不一致"、"时态错误"

===== 重要说明 =====

1. 对于Lexical和Grammar的lineErrors，error字段必须是文章中实际存在的文本，我们将用这个文本在文章中进行匹配和高亮
2. 请用极其挑剔的眼光，尽可能多地找出问题
3. 每个维度至少列出3-5个具体问题

学生作文：
${content}

请进行严格批改。`;

  const userPrompt = `作文题目：${topic}

请根据以上标准进行严格批改。`;

  const messages: MiniMaxMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const result = await callMiniMax(messages);

  // Parse the JSON response
  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Failed to parse response:', result);
    return {
      taskResponse: { score: 5, feedback: '批改服务暂时不可用', issues: [] },
      coherence: { score: 5, feedback: '批改服务暂时不可用', issues: [] },
      lexical: { score: 5, feedback: '批改服务暂时不可用', lineErrors: [] },
      grammar: { score: 5, feedback: '批改服务暂时不可用', lineErrors: [] },
    };
  }
}
