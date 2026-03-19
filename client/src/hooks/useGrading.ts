import { useState } from 'react';
import type { EssayInput, GradingResult } from '../types/essay';

export function useGrading() {
  const [result, setResult] = useState<GradingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gradeEssay = async (input: EssayInput) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/grade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error('批改请求失败，请稍后重试');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '发生错误');
    } finally {
      setLoading(false);
    }
  };

  return { result, loading, error, gradeEssay };
}
