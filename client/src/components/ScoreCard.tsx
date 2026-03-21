interface ScoreCardProps {
  title: string;
  chineseTitle: string;
  score: number;
  feedback: string;
}

function getScoreCategory(score: number): 'excellent' | 'good' | 'poor' {
  if (score >= 7) return 'excellent';
  if (score >= 5) return 'good';
  return 'poor';
}

function getScoreConfig(category: 'excellent' | 'good' | 'poor') {
  switch (category) {
    case 'excellent':
      return {
        bg: 'rgba(45, 106, 79, 0.08)',
        border: 'rgba(45, 106, 79, 0.25)',
        textColor: '#2d6a4f',
        gradient: 'linear-gradient(135deg, rgba(45, 106, 79, 0.15), rgba(45, 106, 79, 0.05))',
        label: 'Excellent',
        labelColor: '#2d6a4f',
      };
    case 'good':
      return {
        bg: 'rgba(201, 162, 39, 0.08)',
        border: 'rgba(201, 162, 39, 0.25)',
        textColor: '#c9a227',
        gradient: 'linear-gradient(135deg, rgba(201, 162, 39, 0.15), rgba(201, 162, 39, 0.05))',
        label: 'Good',
        labelColor: '#b5651d',
      };
    case 'poor':
      return {
        bg: 'rgba(139, 38, 53, 0.08)',
        border: 'rgba(139, 38, 53, 0.25)',
        textColor: '#8b2635',
        gradient: 'linear-gradient(135deg, rgba(139, 38, 53, 0.15), rgba(139, 38, 53, 0.05))',
        label: 'Needs Work',
        labelColor: '#8b2635',
      };
  }
}

export function ScoreCard({ title, chineseTitle, score, feedback }: ScoreCardProps) {
  const category = getScoreCategory(score);
  const config = getScoreConfig(category);

  return (
    <div
      className="rounded-2xl p-6 card-hover"
      style={{
        background: config.gradient,
        border: `1px solid ${config.border}`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative Corner Element */}
      <div
        style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '100px',
          height: '100px',
          background: config.gradient,
          borderRadius: '50%',
          opacity: 0.5,
        }}
      />

      <div className="relative">
        {/* Header Row */}
        <div className="flex justify-between items-start mb-4">
          <div>
            {/* Category Label */}
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2"
              style={{
                background: config.bg,
                color: config.labelColor,
                border: `1px solid ${config.border}`,
              }}
            >
              {config.label}
            </span>

            {/* Chinese Title */}
            <h3
              className="text-xl font-bold mb-1"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                color: 'var(--color-primary)',
              }}
            >
              {chineseTitle}
            </h3>

            {/* English Title */}
            <p className="text-xs" style={{ color: 'var(--color-text-light)' }}>
              {title}
            </p>
          </div>

          {/* Score Display */}
          <div
            className="flex flex-col items-center justify-center w-16 h-16 rounded-xl"
            style={{
              background: `linear-gradient(135deg, ${config.textColor}15, ${config.textColor}05)`,
              border: `2px solid ${config.border}`,
            }}
          >
            <span
              className="text-2xl font-bold"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                color: config.textColor,
                lineHeight: 1,
              }}
            >
              {score.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Feedback */}
        <div
          className="text-sm leading-relaxed"
          style={{ color: 'var(--color-text)' }}
        >
          {feedback}
        </div>

        {/* Score Bar */}
        <div className="mt-4">
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: 'var(--color-border)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${(score / 9) * 100}%`,
                background: `linear-gradient(90deg, ${config.textColor}, ${config.textColor}aa)`,
              }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs" style={{ color: 'var(--color-text-light)' }}>
              0
            </span>
            <span className="text-xs" style={{ color: 'var(--color-text-light)' }}>
              9
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
