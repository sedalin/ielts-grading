import { useState } from 'react';
import { EssayInput } from './components/EssayInput';
import { GradingResult } from './components/GradingResult';
import { useGrading } from './hooks/useGrading';

function App() {
  const { result, loading, error, gradeEssay } = useGrading();
  const [originalContent, setOriginalContent] = useState('');
  const [topic, setTopic] = useState('');

  const handleSubmit = (input: { topic: string; content: string }) => {
    setOriginalContent(input.content);
    setTopic(input.topic);
    gradeEssay(input);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
      {/* Decorative Elements */}
      <div
        className="decorative-circle"
        style={{
          width: '600px',
          height: '600px',
          background: 'linear-gradient(135deg, var(--color-accent), var(--color-primary))',
          top: '-200px',
          right: '-200px',
        }}
      />
      <div
        className="decorative-circle"
        style={{
          width: '400px',
          height: '400px',
          background: 'var(--color-accent)',
          bottom: '10%',
          left: '-150px',
        }}
      />

      {/* Hero Section */}
      <header className="relative pt-16 pb-24 overflow-hidden">
        <div className="container-custom relative z-10">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 animate-fade-in"
            style={{
              background: 'rgba(201, 162, 39, 0.1)',
              border: '1px solid rgba(201, 162, 39, 0.3)',
            }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: 'var(--color-accent)' }}
            />
            <span className="text-sm font-medium" style={{ color: 'var(--color-accent)' }}>
              AI-Powered IELTS Assessment
            </span>
          </div>

          {/* Main Title */}
          <h1
            className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up"
            style={{ color: 'var(--color-primary)' }}
          >
            雅思作文
            <br />
            <span style={{ color: 'var(--color-accent)' }}>智能批改</span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-lg md:text-xl max-w-xl mb-4 animate-fade-in-up stagger-1"
            style={{ color: 'var(--color-secondary)' }}
          >
            基于先进AI技术，为您的雅思作文提供专业的四维评分与详细改进建议
          </p>

          {/* Features */}
          <div className="flex flex-wrap gap-6 mt-8 animate-fade-in-up stagger-2">
            {['写作任务', '连贯衔接', '词汇丰富', '语法准确'].map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: 'var(--color-accent)' }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-light)' }}>
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Wave Decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path
              d="M0 60L60 54C120 48 240 36 360 42C480 48 600 72 720 78C840 84 960 72 1080 60C1200 48 1320 36 1380 30L1440 24V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V60Z"
              fill="var(--color-background)"
            />
          </svg>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative pb-32">
        <div className="container-custom">
          {/* Input Section */}
          <div className="max-w-3xl mx-auto animate-fade-in-up stagger-3">
            <EssayInput onSubmit={handleSubmit} loading={loading} />
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="max-w-3xl mx-auto mt-8 p-5 rounded-xl animate-fade-in"
              style={{
                background: 'rgba(139, 38, 53, 0.08)',
                border: '1px solid rgba(139, 38, 53, 0.2)',
              }}
            >
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: 'var(--color-error)' }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p style={{ color: 'var(--color-error)' }}>{error}</p>
              </div>
            </div>
          )}

          {/* Results Section */}
          {result && originalContent && topic && (
            <div className="mt-16">
              <div className="flex items-center gap-4 mb-8">
                <div className="divider" />
                <h2 className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>
                  批改结果
                </h2>
              </div>
              <GradingResult result={result} originalContent={originalContent} topic={topic} />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center" style={{ borderTop: '1px solid var(--color-border)' }}>
        <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>
          雅思作文智能批改系统 · 提供专业的AI辅助评分
        </p>
      </footer>
    </div>
  );
}

export default App;
