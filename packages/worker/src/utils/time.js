export const hrToMs = (hrtime) => {
  const nanoseconds = (hrtime[0] * 1e9) + hrtime[1]
  const milliseconds = nanoseconds / 1e6
  return Math.round(milliseconds * 100) / 100
}
