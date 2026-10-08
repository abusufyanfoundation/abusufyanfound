export function progress(raisedKobo: number, targetKobo: number) {
  if (targetKobo <= 0) return { percent: 0, bar: 0 };
  const percent = Math.round((raisedKobo / targetKobo) * 100);
  return { percent, bar: Math.min(100, percent) }; // percent can be 115, the bar stops at 100
}
