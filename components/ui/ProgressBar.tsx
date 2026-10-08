import { progress } from "@/lib/progress";

export function ProgressBar({
  raisedKobo,
  targetKobo,
  animated = false,
}: {
  raisedKobo: number;
  targetKobo: number;
  animated?: boolean;
}) {
  const { percent, bar, reached } = progress(raisedKobo, targetKobo);

  return (
    <div>
      <div
        role="progressbar"
        aria-label="Campaign progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={bar}
        aria-valuetext={`${percent}% of target`}
        className="h-3 w-full overflow-hidden bg-gold-soft"
      >
        <div
          className={`h-full bg-navy ${animated ? "animate-progress" : ""}`}
          style={{ width: `${bar}%` }}
        />
      </div>
      <p className="mt-2 text-sm text-muted">
        {percent}% of target{reached ? " · Target reached" : ""}
      </p>
    </div>
  );
}
