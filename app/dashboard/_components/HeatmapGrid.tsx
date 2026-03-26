"use client";

import { useMemo, useState } from "react";
import type { HeatmapCell } from "@/lib/dashboard/queries";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type HeatmapGridProps = {
  data: HeatmapCell[];
  compact?: boolean;
};

type HoveredCell = {
  day: number;
  hour: number;
  count: number;
} | null;

function formatHourLabel(hour: number) {
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:00 ${suffix}`;
}

export function HeatmapGrid({ data, compact = false }: HeatmapGridProps) {
  const [hoveredCell, setHoveredCell] = useState<HoveredCell>(null);

  const { cells, maxCount } = useMemo(() => {
    const map = new Map(data.map((cell) => [`${cell.day}-${cell.hour}`, cell.count]));
    const normalized = Array.from({ length: 24 * 7 }, (_, index) => {
      const day = index % 7;
      const hour = Math.floor(index / 7);
      return {
        day,
        hour,
        count: map.get(`${day}-${hour}`) ?? 0,
      };
    });

    return {
      cells: normalized,
      maxCount: Math.max(...normalized.map((cell) => cell.count), 0),
    };
  }, [data]);

  return (
    <div className="relative">
      {!compact && hoveredCell ? (
        <div className="mb-4 inline-flex rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-4 py-2 text-sm text-[var(--color-text)]">
          {DAY_LABELS[hoveredCell.day]} at {formatHourLabel(hoveredCell.hour)}: {hoveredCell.count} plays
        </div>
      ) : null}

      <div className={`grid ${compact ? "gap-1.5" : "gap-2"}`}>
        {!compact ? (
          <div className="grid grid-cols-[56px_repeat(7,minmax(0,1fr))] gap-2 text-xs uppercase tracking-[0.26em] text-[var(--color-muted)]">
            <span />
            {DAY_LABELS.map((label) => (
              <span key={label} className="text-center">
                {label}
              </span>
            ))}
          </div>
        ) : null}

        <div className={`grid ${compact ? "grid-cols-7" : "grid-cols-[56px_repeat(7,minmax(0,1fr))]"} ${compact ? "gap-1.5" : "gap-2"}`}>
          {cells.map((cell, index) => {
            const opacity =
              cell.count === 0 || maxCount === 0
                ? compact
                  ? 0.08
                  : 0.06
                : 0.15 + (cell.count / maxCount) * 0.85;

            const showHourLabel = !compact && index % 7 === 0;

            return (
              <div key={`${cell.day}-${cell.hour}`} className="contents">
                {showHourLabel ? (
                  <div className="flex items-center justify-end pr-2 text-xs text-[var(--color-muted)]">
                    {String(cell.hour).padStart(2, "0")}
                  </div>
                ) : null}
                <button
                  type="button"
                  title={`${DAY_LABELS[cell.day]} ${formatHourLabel(cell.hour)}: ${cell.count} plays`}
                  onMouseEnter={() => setHoveredCell(cell)}
                  onFocus={() => setHoveredCell(cell)}
                  onMouseLeave={() => setHoveredCell(null)}
                  onBlur={() => setHoveredCell(null)}
                  className={`${compact ? "h-2.5 rounded-[3px]" : "aspect-square min-h-5 rounded-md"} border border-[rgba(255,255,255,0.04)] transition hover:scale-105`}
                  style={{
                    backgroundColor: `rgba(var(--color-accent-rgb), ${opacity})`,
                  }}
                  aria-label={`${DAY_LABELS[cell.day]} ${formatHourLabel(cell.hour)}: ${cell.count} plays`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
