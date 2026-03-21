import { useState } from 'react';
import type { EssayInput as EssayInputType } from '../types/essay';

interface EssayInputProps {
  onSubmit: (input: EssayInputType) => void;
  loading: boolean;
  elapsedSeconds: number;
}

export function EssayInput({ onSubmit, loading, elapsedSeconds }: EssayInputProps) {
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && content.trim()) {
      onSubmit({ topic: topic.trim(), content: content.trim() });
    }
  };

  const isValid = topic.trim() && content.trim();

  // Estimated total time is ~50 seconds, show remaining time
  const estimatedTotal = 50;
  const remainingSeconds = Math.max(0, estimatedTotal - elapsedSeconds);
  const progress = Math.min(100, (elapsedSeconds / estimatedTotal) * 100);

  return (
    <div
      className="rounded-2xl p-8 md:p-10 card-hover"
      style={{
        background: 'var(--color-surface)',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* Header */}
      <div className="mb-8">
        <h2
          className="text-3xl font-bold mb-3"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            color: 'var(--color-primary)',
          }}
        >
          提交您的作文
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>
          输入作文题目和内容，我们将为您提供专业的AI批改意见
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Topic Input */}
        <div>
          <label
            htmlFor="topic"
            className="block text-sm font-semibold mb-3"
            style={{ color: 'var(--color-text)' }}
          >
            <span className="inline-flex items-center gap-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: 'var(--color-accent)' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              作文题目
            </span>
          </label>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="例如：Some people believe that universities should focus on providing academic knowledge, while others think they should also teach practical skills."
            className="input-field"
            disabled={loading}
          />
        </div>

        {/* Content Textarea */}
        <div>
          <label
            htmlFor="content"
            className="block text-sm font-semibold mb-3"
            style={{ color: 'var(--color-text)' }}
          >
            <span className="inline-flex items-center gap-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: 'var(--color-accent)' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              作文内容
            </span>
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="请在此输入您的英文作文..."
            rows={14}
            className="input-field"
            disabled={loading}
          />
          <p className="mt-2 text-xs" style={{ color: 'var(--color-text-light)' }}>
            字数建议：250-300词（雅思大作文标准字数）
          </p>
        </div>

        {/* Timer Display */}
        {loading && (
          <div
            className="flex items-center justify-center gap-6 p-6 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(201, 162, 39, 0.08), rgba(201, 162, 39, 0.02))',
              border: '1px solid rgba(201, 162, 39, 0.2)',
            }}
          >
            {/* Circular Timer */}
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                {/* Background circle */}
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="var(--color-border)"
                  strokeWidth="3"
                />
                {/* Progress circle */}
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="var(--color-accent)"
                  strokeWidth="3"
                  strokeDasharray={`${progress}, 100`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 0.3s ease' }}
                />
              </svg>
              {/* Center text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className="text-xl font-bold"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    color: 'var(--color-accent)',
                  }}
                >
                  {remainingSeconds}
                </span>
              </div>
            </div>

            {/* Timer Info */}
            <div className="flex flex-col">
              <span
                className="text-lg font-semibold"
                style={{ color: 'var(--color-primary)' }}
              >
                AI 正在分析中...
              </span>
              <span className="text-sm" style={{ color: 'var(--color-text-light)' }}>
                预计还需约 {remainingSeconds} 秒
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ background: 'var(--color-accent)' }}
                />
                <span className="text-xs" style={{ color: 'var(--color-text-light)' }}>
                  正在分析词汇、语法、连贯性
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading || !isValid}
            className="w-full py-4 px-8 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3"
            style={{
              background:
                isValid && !loading
                  ? 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))'
                  : 'var(--color-border)',
              color: isValid && !loading ? 'white' : 'var(--color-text-light)',
              boxShadow: isValid && !loading ? 'var(--shadow-md)' : 'none',
              transform: loading ? 'none' : undefined,
            }}
          >
            {loading ? (
              <>
                <span className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                <span>正在分析您的作文...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                <span>开始批改</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Decorative Quote */}
      {!loading && (
        <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--color-border)' }}>
          <blockquote
            className="text-sm italic"
            style={{
              color: 'var(--color-text-light)',
              fontFamily: "'Cormorant Garamond', serif",
            }}
          >
            "Practice is the best of all instructors, but experience is the school where we learn."
          </blockquote>
        </div>
      )}
    </div>
  );
}
