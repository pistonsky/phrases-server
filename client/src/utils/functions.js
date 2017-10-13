export function randomId() {
  return Math.random()
    .toString(36)
    .slice(2);
}

export function smartFontSize({ min, max, threshold, text }) {
  const length = text.length;
  if (length < threshold) return max;
  return Math.max(min, max * threshold / length);
}
