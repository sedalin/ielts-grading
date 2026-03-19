interface ScoreCardProps {
  title: string;
  chineseTitle: string;
  score: number;
  feedback: string;
}

function getScoreColor(score: number): string {
  if (score >= 7) return 'text-green-600';
  if (score >= 5) return 'text-yellow-600';
  return 'text-red-600';
}

function getScoreBgColor(score: number): string {
  if (score >= 7) return 'bg-green-50 border-green-200';
  if (score >= 5) return 'bg-yellow-50 border-yellow-200';
  return 'bg-red-50 border-red-200';
}

export function ScoreCard({ title, chineseTitle, score, feedback }: ScoreCardProps) {
  return (
    <div className={`p-4 rounded-lg border ${getScoreBgColor(score)}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-gray-800">{chineseTitle}</h3>
          <p className="text-xs text-gray-500">{title}</p>
        </div>
        <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
          {score.toFixed(1)}
        </div>
      </div>
      <p className="text-sm text-gray-600">{feedback}</p>
    </div>
  );
}
