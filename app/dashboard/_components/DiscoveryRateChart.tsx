"use client";

import { useMemo, useState } from "react";
import type { DiscoveryRatePoint } from "@/lib/dashboard/queries";

type DiscoveryRateChartProps = {
  data: DiscoveryRatePoint[];
};

function formatWeek(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
  }).format(new Date(`${value}T00:00:00`));
}

export function DiscoveryRateChart({ data }: DiscoveryRateChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const chart = useMemo(() => {
    const width = 680;
    const height = 240;
    const padding = 24;
    const innerWidth = width - padding * 2;
    const innerHeight = height - padding * 2;
    const max = Math.max(100, ...data.map((point) => point.percentage));

    const points = data.map((point, index) => {
      const x = padding + (innerWidth * index) / Math.max(data.length - 1, 1);
      const y = padding + innerHeight - (point.percentage / max) * innerHeight;
      return { x, y, point };
    });

    const path = points
      .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
      .join(" ");

    return { height, path, points };
  }, [data]);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">
            Discovery Rate
          </p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Percentage of weekly plays that were first-ever listens.
          </p>
        </div>
        {activeIndex !== null ? (
          <div className="rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-4 py-2 text-sm text-[var(--color-text)]">
            {data[activeIndex].percentage.toFixed(1)}% on {formatWeek(data[activeIndex].weekStart)}
          </div>
        ) : null}
      </div>

      <svg viewBox="0 0 680 240" className="w-full overflow-visible">
        {[0, 25, 50, 75, 100].map((value) => {
          const y = 24 + (192 * (100 - value)) / 100;
          return (
            <g key={value}>
              <line
                x1="24"
                y1={y}
                x2="656"
                y2={y}
                stroke="rgba(255,255,255,0.08)"
                strokeDasharray="4 8"
              />
              <text x="8" y={y + 4} className="fill-[var(--color-muted)] text-[10px]">
                {value}%
              </text>
            </g>
          );
        })}

        <path d={chart.path} fill="none" stroke="rgba(167,139,250,0.9)" strokeWidth="3" />
        <path
          d={`${chart.path} L 656 216 L 24 216 Z`}
          fill="url(#discovery-fill)"
          opacity="0.28"
        />
        <defs>
          <linearGradient id="discovery-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(167,139,250,0.55)" />
            <stop offset="100%" stopColor="rgba(167,139,250,0.02)" />
          </linearGradient>
        </defs>

        {chart.points.map((entry, index) => (
          <g key={entry.point.weekStart}>
            <circle
              cx={entry.x}
              cy={entry.y}
              r={activeIndex === index ? 6 : 4}
              fill="rgba(52,211,153,0.95)"
              onMouseEnter={() => setActiveIndex(index)}
              onFocus={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              onBlur={() => setActiveIndex(null)}
            />
            <text
              x={entry.x}
              y="234"
              textAnchor="middle"
              className="fill-[var(--color-muted)] text-[10px]"
            >
              {formatWeek(entry.point.weekStart)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
