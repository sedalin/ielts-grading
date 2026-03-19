import { useState } from 'react';
import type { EssayInput } from '../types/essay';

interface EssayInputProps {
  onSubmit: (input: EssayInput) => void;
  loading: boolean;
}

export function EssayInput({ onSubmit, loading }: EssayInputProps) {
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && content.trim()) {
      onSubmit({ topic: topic.trim(), content: content.trim() });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">雅思作文批改</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
            作文题目
          </label>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="请输入作文题目"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            作文内容
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="请输入您的作文内容"
            rows={12}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !topic.trim() || !content.trim()}
          className="w-full py-3 px-6 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '批改中...' : '提交批改'}
        </button>
      </form>
    </div>
  );
}
