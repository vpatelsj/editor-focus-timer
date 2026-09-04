export class SessionTimer {
  private totalMs = 0;
  private previousSampleMs: number | undefined;
  private counting = false;

  sample(nowMs: number, shouldCount: boolean): void {
    if (
      this.previousSampleMs !== undefined &&
      this.counting &&
      nowMs >= this.previousSampleMs
    ) {
      this.totalMs += nowMs - this.previousSampleMs;
    }

    this.previousSampleMs = nowMs;
    this.counting = shouldCount;
  }

  reset(): void {
    this.totalMs = 0;
    this.previousSampleMs = undefined;
  }

  get elapsedMs(): number {
    return this.totalMs;
  }

  get isCounting(): boolean {
    return this.counting;
  }
}

export function formatElapsed(elapsedMs: number): string {
  const totalSeconds = Math.floor(Math.max(0, elapsedMs) / 1_000);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / 3_600);

  return [hours, minutes, seconds]
    .map((value) => value.toString().padStart(2, '0'))
    .join(':');
}
