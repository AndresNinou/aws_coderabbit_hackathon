import { useEffect, useState } from "react";

interface ScoreDialProps {
  score: number;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

export function ScoreDial({
  score,
  size = "md",
  animated = true,
}: ScoreDialProps) {
  const [animatedScore, setAnimatedScore] = useState(animated ? 0 : score);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setAnimatedScore(score);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [score, animated]);

  const displayScore = animated ? animatedScore : score;

  // Determine color based on score
  const getScoreColor = (score: number) => {
    if (score >= 71) return "#6FFFD4"; // mint
    if (score >= 41) return "#FFC857"; // amber
    return "#FF4D4D"; // red
  };

  const getScoreColorClass = (score: number) => {
    if (score >= 71) return "text-accent-mint";
    if (score >= 41) return "text-accent-amber";
    return "text-accent-red";
  };

  const sizeClasses = {
    sm: { width: 120, height: 60, strokeWidth: 8, fontSize: "text-lg" },
    md: { width: 160, height: 80, strokeWidth: 10, fontSize: "text-2xl" },
    lg: { width: 200, height: 100, strokeWidth: 12, fontSize: "text-3xl" },
  };

  const { width, height, strokeWidth, fontSize } = sizeClasses[size];
  const radius = (width - strokeWidth) / 2 - strokeWidth;
  const circumference = Math.PI * radius; // Half circle
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width, height }}>
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="-rotate-90 transform"
        >
          {/* Background arc */}
          <path
            d={`M ${strokeWidth} ${height - strokeWidth} A ${radius} ${radius} 0 0 1 ${width - strokeWidth} ${height - strokeWidth}`}
            fill="none"
            stroke="#222834"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Score arc */}
          <path
            d={`M ${strokeWidth} ${height - strokeWidth} A ${radius} ${radius} 0 0 1 ${width - strokeWidth} ${height - strokeWidth}`}
            fill="none"
            stroke={getScoreColor(displayScore)}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={animated ? "transition-all duration-1000 ease-out" : ""}
            style={{
              filter: `drop-shadow(0 0 8px ${getScoreColor(displayScore)}40)`,
            }}
          />
        </svg>

        {/* Score text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="translate-y-2 transform text-center">
            <div
              className={`${fontSize} font-mono font-bold ${getScoreColorClass(displayScore)}`}
            >
              {Math.round(displayScore)}
            </div>
            <div className="text-xs font-medium text-text-muted">SCORE</div>
          </div>
        </div>
      </div>
    </div>
  );
}
