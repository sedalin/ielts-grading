export interface GradingResult {
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

export interface Issue {
  issue: string;
  suggestion: string;
  explanation: string;
}

export interface LineError {
  error: string;
  suggestion: string;
  explanation: string;
  type?: 'grammar' | 'lexical';
}

export interface EssayInput {
  topic: string;
  content: string;
}
