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
      return 'highlight-task-response';
    case 'coherence':
      return 'highlight-coherence';
    case 'lexical':
      return 'highlight-lexical';
    case 'grammar':
      return 'highlight-grammar';
    default:
      return 'bg-gray-200 border-b-2 border-gray-500 text-gray-800';
  }
}

function getTabButtonStyles(type: ErrorType, isActive: boolean) {
  if (!isActive) {
    return {
      bg: 'transparent',
      color: 'var(--color-text-light)',
      border: '1px solid var(--color-border)',
    };
  }

  switch (type) {
    case 'taskResponse':
      return { bg: '#7c3aed', color: 'white', border: '1px solid #7c3aed' };
    case 'coherence':
      return { bg: '#ea580c', color: 'white', border: '1px solid #ea580c' };
    case 'lexical':
      return { bg: '#dc2626', color: 'white', border: '1px solid #dc2626' };
    case 'grammar':
      return { bg: '#2563eb', color: 'white', border: '1px solid #2563eb' };
    case 'all':
    default:
      return { bg: 'var(--color-primary)', color: 'white', border: '1px solid var(--color-primary)' };
  }
}

// Full-text matching across entire content
function HighlightedContent({ content, errors }: { content: string; errors: LineError[] }) {
  const dedupedErrors = deduplicateErrors(errors);

  if (dedupedErrors.length === 0) {
    return (
      <div
        className="whitespace-pre-wrap text-lg leading-loose"
        style={{ color: 'var(--color-text)' }}
      >
        {content}
      </div>
    );
  }

  // Find all error positions in the entire content
  interface ErrorPos {
    start: number;
    end: number;
    error: LineError;
  }
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
    return (
      <div
        className="whitespace-pre-wrap text-lg leading-loose"
        style={{ color: 'var(--color-text)' }}
      >
        {content}
      </div>
    );
  }

  // Build highlighted content
  const parts: React.ReactNode[] = [];
  let currentPos = 0;

  filtered.forEach((pos, idx) => {
    if (pos.start > currentPos) {
      parts.push(
        <span key={`text-${currentPos}`} style={{ color: 'var(--color-text)' }}>
          {content.slice(currentPos, pos.start)}
        </span>
      );
    }

    const highlightClass = getHighlightStyles(pos.error.type);
    parts.push(
      <span
        key={`error-${idx}`}
        className={highlightClass}
        title={`类型: ${pos.error.type}\n建议: ${pos.error.suggestion}`}
        style={{ cursor: 'help' }}
      >
        {content.slice(pos.start, pos.end)}
      </span>
    );
    currentPos = pos.end;
  });

  if (currentPos < content.length) {
    parts.push(
      <span key={`text-${currentPos}`} style={{ color: 'var(--color-text)' }}>
        {content.slice(currentPos)}
      </span>
    );
  }

  return <div className="whitespace-pre-wrap text-lg leading-loose">{parts}</div>;
}

// Table for issues (taskResponse, coherence)
function IssueTable({
  title,
  issues,
  type,
  icon,
}: {
  title: string;
  issues: Issue[];
  type: string;
  icon: React.ReactNode;
}) {
  const dedupedIssues = deduplicateIssues(issues);
  if (dedupedIssues.length === 0) return null;

  const colors = {
    taskResponse: { bg: '#f3e8ff', text: '#7c3aed', label: '任务回应' },
    coherence: { bg: '#ffedd5', text: '#ea580c', label: '连贯与衔接' },
  }[type] || { bg: '#f3f4f6', text: '#6b7280', label: '问题' };

  return (
    <div
      className="rounded-2xl overflow-hidden card-hover"
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div className="p-6" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: colors.bg }}
          >
            {icon}
          </div>
          <h3
            className="text-xl font-bold"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: 'var(--color-primary)',
            }}
          >
            {title}
          </h3>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table-custom">
          <thead>
            <tr>
              <th className="w-32">类型</th>
              <th>修改建议</th>
              <th className="w-1/3">说明</th>
            </tr>
          </thead>
          <tbody>
            {dedupedIssues.map((iss, idx) => (
              <tr key={idx}>
                <td>
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ background: colors.bg, color: colors.text }}
                  >
                    {colors.label}
                  </span>
                </td>
                <td className="font-medium" style={{ color: 'var(--color-success)' }}>
                  {iss.suggestion}
                </td>
                <td className="text-sm" style={{ color: 'var(--color-text-light)' }}>
                  {iss.explanation}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Table for lineErrors (lexical, grammar)
function ErrorTable({
  title,
  errors,
  type,
  icon,
}: {
  title: string;
  errors: LineError[];
  type: string;
  icon: React.ReactNode;
}) {
  const dedupedErrors = deduplicateErrors(errors);
  if (dedupedErrors.length === 0) return null;

  const colors = {
    lexical: { bg: '#fef2f2', text: '#dc2626', label: '词汇', icon: '#dc2626' },
    grammar: { bg: '#eff6ff', text: '#2563eb', label: '语法', icon: '#2563eb' },
  }[type] || { bg: '#f3f4f6', text: '#6b7280', label: '错误', icon: '#6b7280' };

  return (
    <div
      className="rounded-2xl overflow-hidden card-hover"
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div className="p-6" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: colors.bg }}
          >
            {icon}
          </div>
          <h3
            className="text-xl font-bold"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: 'var(--color-primary)',
            }}
          >
            {title}
          </h3>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table-custom">
          <thead>
            <tr>
              <th className="w-24">类型</th>
              <th className="w-1/4">原文问题</th>
              <th className="w-1/4">修改建议</th>
              <th>说明</th>
            </tr>
          </thead>
          <tbody>
            {dedupedErrors.map((err, idx) => (
              <tr key={idx}>
                <td>
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ background: colors.bg, color: colors.text }}
                  >
                    {colors.label}
                  </span>
                </td>
                <td>
                  <span style={{ color: colors.icon }}>{err.error}</span>
                </td>
                <td className="font-medium" style={{ color: 'var(--color-success)' }}>
                  {err.suggestion}
                </td>
                <td className="text-sm" style={{ color: 'var(--color-text-light)' }}>
                  {err.explanation}
                </td>
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

  const tabs: { type: ErrorType; label: string; count: number }[] = [
    { type: 'all', label: '显示全部', count: lexicalErrors.length + grammarErrors.length },
    { type: 'lexical', label: '词汇', count: lexicalErrors.length },
    { type: 'grammar', label: '语法', count: grammarErrors.length },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Download Summary Button */}
      <div className="flex justify-end">
        <button
          onClick={handleDownloadSummary}
          disabled={downloading}
          className="flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all"
          style={{
            background: downloading ? 'var(--color-border)' : 'var(--color-accent)',
            color: downloading ? 'var(--color-text-light)' : 'var(--color-primary)',
            boxShadow: downloading ? 'none' : 'var(--shadow-sm)',
          }}
        >
          {downloading ? (
            <>
              <span
                className="spinner"
                style={{
                  borderColor: 'var(--color-text-light)',
                  borderTopColor: 'transparent',
                }}
              />
              <span>生成中...</span>
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              <span>下载总结文档</span>
            </>
          )}
        </button>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ScoreCard
          title="Task Response"
          chineseTitle="写作任务回应"
          score={result.taskResponse.score}
          feedback={result.taskResponse.feedback}
        />
        <ScoreCard
          title="Coherence and Cohesion"
          chineseTitle="连贯与衔接"
          score={result.coherence.score}
          feedback={result.coherence.feedback}
        />
        <ScoreCard
          title="Lexical Resource"
          chineseTitle="词汇丰富程度"
          score={result.lexical.score}
          feedback={result.lexical.feedback}
        />
        <ScoreCard
          title="Grammatical Range and Accuracy"
          chineseTitle="语法多样性及准确性"
          score={result.grammar.score}
          feedback={result.grammar.feedback}
        />
      </div>

      {/* Original Essay Content */}
      <div
        className="rounded-2xl p-8"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h3
            className="text-2xl font-bold"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: 'var(--color-primary)',
            }}
          >
            原文批改
          </h3>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const styles = getTabButtonStyles(tab.type, activeTab === tab.type);
              return (
                <button
                  key={tab.type}
                  onClick={() => setActiveTab(tab.type)}
                  className="tab-button"
                  style={{
                    background: styles.bg,
                    color: styles.color,
                    border: styles.border,
                  }}
                >
                  {tab.label} ({tab.count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Topic */}
        <div className="mb-6 pb-6" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-2"
            style={{ color: 'var(--color-text-light)' }}
          >
            题目
          </p>
          <p className="text-sm italic" style={{ color: 'var(--color-secondary)' }}>
            {topic}
          </p>
        </div>

        {/* Highlighted Content */}
        <HighlightedContent content={originalContent} errors={filteredErrors} />
      </div>

      {/* Tables */}
      <IssueTable
        title="写作任务回应改进建议"
        issues={taskResponseIssues}
        type="taskResponse"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="#7c3aed" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        }
      />
      <IssueTable
        title="连贯与衔接改进建议"
        issues={coherenceIssues}
        type="coherence"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="#ea580c" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
        }
      />
      <ErrorTable
        title="词汇错误修改对照表"
        errors={lexicalErrors}
        type="lexical"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="#dc2626" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        }
      />
      <ErrorTable
        title="语法错误修改对照表"
        errors={grammarErrors}
        type="grammar"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="#2563eb" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        }
      />
    </div>
  );
}
