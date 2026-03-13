export const isWithinCutoff = (shiftStartTime: Date | string, cutoffHours: number = 48): boolean => {
  const now = new Date();
  const startTime = new Date(shiftStartTime);
  const cutoffTime = new Date(startTime);
  cutoffTime.setHours(cutoffTime.getHours() - cutoffHours);
  return now >= cutoffTime;
};

export const getHoursUntilShift = (shiftStartTime: Date | string): number => {
  const now = new Date();
  const startTime = new Date(shiftStartTime);
  const diffMs = startTime.getTime() - now.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60));
};
