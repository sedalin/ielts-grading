import { useState } from 'react';
import { EssayInput } from './components/EssayInput';
import { GradingResult } from './components/GradingResult';
import { useGrading } from './hooks/useGrading';

function App() {
  const { result, loading, error, gradeEssay } = useGrading();
  const [originalContent, setOriginalContent] = useState('');

  const handleSubmit = (input: { topic: string; content: string }) => {
    setOriginalContent(input.content);
    gradeEssay(input);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">雅思作文智能批改系统</h1>
        <p className="text-gray-600 mt-2">基于AI的雅思作文四维评分</p>
      </header>

      <main>
        <EssayInput onSubmit={handleSubmit} loading={loading} />

        {error && (
          <div className="max-w-2xl mx-auto mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {result && originalContent && (
          <GradingResult result={result} originalContent={originalContent} />
        )}
      </main>
    </div>
  );
}

export default App;
