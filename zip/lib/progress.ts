// Percent is never capped, so a campaign that raised 115% of its target says
// 115%. Only the width of the bar is limited to 100.
export function progress(raisedKobo: number, targetKobo: number) {
  if (targetKobo <= 0) return { percent: 0, bar: 0, reached: false };

  const ratio = raisedKobo / targetKobo;
  // Below the target, round down so "100%" is only shown once it is reached
  const percent =
    ratio >= 1 ? Math.round(ratio * 100) : Math.floor(ratio * 100);

  return {
    percent,
    bar: Math.min(100, percent),
    reached: raisedKobo >= targetKobo,
  };
}
