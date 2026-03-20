import { useState } from 'react';
import type { GradingResult, LineError, Issue, SummaryResult } from '../types/essay';
import { ScoreCard } from './ScoreCard';

interface GradingResultProps {
  result: GradingResult;
  originalContent: string;
  topic: string;
}

type ErrorType = 'taskResponse' | 'coherence' | 'lexical' | 'grammar' | 'all';

// Remove duplicate errors based on error + suggestion
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

function getHighlightStyles(type?: string) {
  switch (type) {
    case 'taskResponse':
      return 'bg-purple-200 border-b-2 border-purple-500 text-purple-800';
    case 'coherence':
      return 'bg-orange-200 border-b-2 border-orange-500 text-orange-800';
    case 'lexical':
      return 'bg-red-200 border-b-2 border-red-500 text-red-800';
    case 'grammar':
      return 'bg-blue-200 border-b-2 border-blue-500 text-blue-800';
    default:
      return 'bg-gray-200 border-b-2 border-gray-500 text-gray-800';
  }
}

function getButtonStyles(type: ErrorType, isActive: boolean) {
  switch (type) {
    case 'taskResponse':
      return isActive ? 'bg-purple-600 text-white shadow-lg' : 'bg-purple-100 text-purple-700 hover:bg-purple-200';
    case 'coherence':
      return isActive ? 'bg-orange-600 text-white shadow-lg' : 'bg-orange-100 text-orange-700 hover:bg-orange-200';
    case 'lexical':
      return isActive ? 'bg-red-600 text-white shadow-lg' : 'bg-red-100 text-red-700 hover:bg-red-200';
    case 'grammar':
      return isActive ? 'bg-blue-600 text-white shadow-lg' : 'bg-blue-100 text-blue-700 hover:bg-blue-200';
    case 'all':
      return isActive ? 'bg-gray-800 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

// Full-text matching across entire content
function HighlightedContent({ content, errors }: { content: string; errors: LineError[] }) {
  const dedupedErrors = deduplicateErrors(errors);

  if (dedupedErrors.length === 0) {
    return <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">{content}</div>;
  }

  // Find all error positions in the entire content
  interface ErrorPos { start: number; end: number; error: LineError; }
  const errorPositions: ErrorPos[] = [];

  dedupedErrors.forEach((err) => {
    const errorText = err.error.trim();
    if (!errorText) return;

    // Case-insensitive search for all occurrences
    let searchStart = 0;
    let idx = content.toLowerCase().indexOf(errorText.toLowerCase(), searchStart);
    while (idx !== -1) {
      errorPositions.push({
        start: idx,
        end: idx + errorText.length,
        error: err,
      });
      searchStart = idx + 1;
      idx = content.toLowerCase().indexOf(errorText.toLowerCase(), searchStart);
    }
  });

  // Sort by position
  errorPositions.sort((a, b) => a.start - b.start);

  // Remove overlapping errors (keep first one)
  const filtered: ErrorPos[] = [];
  let lastEnd = 0;
  errorPositions.forEach((pos) => {
    if (pos.start >= lastEnd) {
      filtered.push(pos);
      lastEnd = pos.end;
    }
  });

  if (filtered.length === 0) {
    return <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">{content}</div>;
  }

  // Build highlighted content
  const parts: React.ReactNode[] = [];
  let currentPos = 0;

  filtered.forEach((pos, idx) => {
    if (pos.start > currentPos) {
      parts.push(<span key={`text-${currentPos}`} className="text-gray-800">{content.slice(currentPos, pos.start)}</span>);
    }

    const highlightClass = getHighlightStyles(pos.error.type);
    parts.push(
      <span key={`error-${idx}`} className={`${highlightClass} px-1 rounded cursor-help`} title={`类型: ${pos.error.type}\n建议: ${pos.error.suggestion}`}>
        {content.slice(pos.start, pos.end)}
      </span>
    );
    currentPos = pos.end;
  });

  if (currentPos < content.length) {
    parts.push(<span key={`text-${currentPos}`} className="text-gray-800">{content.slice(currentPos)}</span>);
  }

  return <div className="whitespace-pre-wrap leading-relaxed">{parts}</div>;
}

// Table for issues (taskResponse, coherence)
function IssueTable({ title, issues, type }: { title: string; issues: Issue[]; type: string }) {
  const dedupedIssues = deduplicateIssues(issues);
  if (dedupedIssues.length === 0) return null;

  const colors = {
    taskResponse: { bg: 'bg-purple-100', text: 'text-purple-700', label: '任务回应' },
    coherence: { bg: 'bg-orange-100', text: 'text-orange-700', label: '连贯与衔接' }
  }[type] || { bg: 'bg-gray-100', text: 'text-gray-700', label: '问题' };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4 text-gray-800">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left text-gray-700">问题</th>
              <th className="border border-gray-300 px-4 py-2 text-left text-gray-700">修改建议</th>
              <th className="border border-gray-300 px-4 py-2 text-left text-gray-700">说明</th>
            </tr>
          </thead>
          <tbody>
            {dedupedIssues.map((iss, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border border-gray-300 px-4 py-2">
                  <span className={`px-2 py-1 rounded text-sm ${colors.bg} ${colors.text}`}>{colors.label}</span>
                </td>
                <td className="border border-gray-300 px-4 py-2 text-green-600 font-medium">{iss.suggestion}</td>
                <td className="border border-gray-300 px-4 py-2 text-gray-600 text-sm">{iss.explanation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Table for lineErrors (lexical, grammar)
function ErrorTable({ title, errors, type }: { title: string; errors: LineError[]; type: string }) {
  const dedupedErrors = deduplicateErrors(errors);
  if (dedupedErrors.length === 0) return null;

  const colors = {
    lexical: { text: 'text-red-600', label: '词汇', bg: 'bg-red-100', labelText: 'text-red-700' },
    grammar: { text: 'text-blue-600', label: '语法', bg: 'bg-blue-100', labelText: 'text-blue-700' }
  }[type] || { text: 'text-gray-600', label: '错误', bg: 'bg-gray-100', labelText: 'text-gray-700' };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4 text-gray-800">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left text-gray-700">问题类型</th>
              <th className="border border-gray-300 px-4 py-2 text-left text-gray-700 w-1/4">原文问题</th>
              <th className="border border-gray-300 px-4 py-2 text-left text-gray-700 w-1/4">修改建议</th>
              <th className="border border-gray-300 px-4 py-2 text-left text-gray-700">说明</th>
            </tr>
          </thead>
          <tbody>
            {dedupedErrors.map((err, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border border-gray-300 px-4 py-2">
                  <span className={`px-2 py-1 rounded text-sm ${colors.bg} ${colors.labelText}`}>{colors.label}</span>
                </td>
                <td className="border border-gray-300 px-4 py-2"><span className={colors.text}>{err.error}</span></td>
                <td className="border border-gray-300 px-4 py-2 text-green-600">{err.suggestion}</td>
                <td className="border border-gray-300 px-4 py-2 text-gray-600 text-sm">{err.explanation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function GradingResult({ result, originalContent, topic }: GradingResultProps) {
  const [activeTab, setActiveTab] = useState<ErrorType>('all');
  const [downloading, setDownloading] = useState(false);

  const handleDownloadSummary = async () => {
    try {
      setDownloading(true);
      const response = await fetch('/api/grade/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, content: originalContent, gradingResult: result }),
      });
      const data: SummaryResult = await response.json();
      if (data.success) {
        const blob = new Blob([data.markdown], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = data.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloading(false);
    }
  };

  const taskResponseIssues = result.taskResponse?.issues || [];
  const coherenceIssues = result.coherence?.issues || [];
  const lexicalErrors = result.lexical?.lineErrors || [];
  const grammarErrors = result.grammar?.lineErrors || [];

  const getFilteredErrors = () => {
    switch (activeTab) {
      case 'lexical':
        return lexicalErrors;
      case 'grammar':
        return grammarErrors;
      default:
        return [...lexicalErrors, ...grammarErrors];
    }
  };

  const filteredErrors = getFilteredErrors();

  return (
    <div className="max-w-5xl mx-auto mt-8 space-y-6">
      {/* Download Summary Button */}
      <div className="flex justify-end">
        <button
          onClick={handleDownloadSummary}
          disabled={downloading}
          className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 transition-all shadow-md flex items-center gap-2"
        >
          {downloading ? (
            <>
              <span className="animate-spin">⏳</span>
              生成中...
            </>
          ) : (
            <>
              📥 下载总结文档
            </>
          )}
        </button>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ScoreCard title="Task Response" chineseTitle="写作任务回应" score={result.taskResponse.score} feedback={result.taskResponse.feedback} />
        <ScoreCard title="Coherence and Cohesion" chineseTitle="连贯与衔接" score={result.coherence.score} feedback={result.coherence.feedback} />
        <ScoreCard title="Lexical Resource" chineseTitle="词汇丰富程度" score={result.lexical.score} feedback={result.lexical.feedback} />
        <ScoreCard title="Grammatical Range and Accuracy" chineseTitle="语法多样性及准确性" score={result.grammar.score} feedback={result.grammar.feedback} />
      </div>

      {/* Original Essay Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col gap-4 mb-4">
          <h3 className="text-xl font-bold text-gray-800">原文（点击下方按钮查看不同类型错误）</h3>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setActiveTab('all')} className={`px-4 py-2 rounded-lg font-medium transition-all ${getButtonStyles('all', activeTab === 'all')}`}>显示全部</button>
            <button onClick={() => setActiveTab('lexical')} className={`px-4 py-2 rounded-lg font-medium transition-all ${getButtonStyles('lexical', activeTab === 'lexical')}`}>词汇 ({lexicalErrors.length})</button>
            <button onClick={() => setActiveTab('grammar')} className={`px-4 py-2 rounded-lg font-medium transition-all ${getButtonStyles('grammar', activeTab === 'grammar')}`}>语法 ({grammarErrors.length})</button>
          </div>
        </div>
        <HighlightedContent content={originalContent} errors={filteredErrors} />
      </div>

      {/* Tables */}
      <IssueTable title="写作任务回应改进建议" issues={taskResponseIssues} type="taskResponse" />
      <IssueTable title="连贯与衔接改进建议" issues={coherenceIssues} type="coherence" />
      <ErrorTable title="词汇错误修改对照表" errors={lexicalErrors} type="lexical" />
      <ErrorTable title="语法错误修改对照表" errors={grammarErrors} type="grammar" />
    </div>
  );
}
