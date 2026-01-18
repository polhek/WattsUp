import type { BikeData } from '../devices/parsers/ftms-parser';
import type {
  ActivityEvent,
  ActivitySnapshot,
  ActivitySummary,
  FinalizedActivity,
} from './activity-types';

export class Activity {
  private startTime: number;
  private snapshots: ActivitySnapshot[] = [];
  private events: ActivityEvent[] = [];
  private isPaused = false;
  private totalPausedTime = 0;
  private pauseStartTime: number | null = null;

  constructor() {
    this.startTime = Date.now();
  }

  addSnapshot(data: BikeData) {
    if (this.isPaused) {
      return;
    }

    const now = Date.now();
    const elapsedTime = (now - this.startTime - this.totalPausedTime) / 1000;

    const snapshot: ActivitySnapshot = {
      timestamp: now,
      elapsedTime,
      ...data,
    };
    this.snapshots.push(snapshot);
  }

  pause() {
    if (this.isPaused) {
      return;
    }
    this.isPaused = true;
    this.pauseStartTime = Date.now();
    this.events.push({
      type: 'timer',
      value: 'pause',
      timestamp: this.pauseStartTime,
    });
  }

  resume() {
    if (!this.isPaused) {
      return;
    }
    this.isPaused = false;
    this.totalPausedTime += Date.now() - this.pauseStartTime!;
    this.events.push({
      type: 'timer',
      value: 'resume',
      timestamp: Date.now(),
    });
    this.pauseStartTime = null;
  }

  finalize(): FinalizedActivity {
    return {
      startTime: new Date(this.startTime),
      endTime: new Date(),
      events: this.events,
      records: this.snapshots,
      summary: this.calculateSummary(),
    };
  }

  private calculateSummary(): ActivitySummary {
    const totalDuration =
      (this.snapshots[this.snapshots.length - 1].timestamp - this.startTime) / 1000;
    const avgPower =
      this.snapshots.reduce((sum, snap) => sum + (snap.power || 0), 0) / this.snapshots.length;
    const avgCadence =
      this.snapshots.reduce((sum, snap) => sum + (snap.cadence || 0), 0) / this.snapshots.length;
    const maxCadence = Math.max(...this.snapshots.map((snap) => snap.cadence || 0));
    const avgSpeed =
      this.snapshots.reduce((sum, snap) => sum + (snap.speed || 0), 0) / this.snapshots.length;
    const totalDistance = avgSpeed * (totalDuration / 3600);
    const avgHeartRate =
      this.snapshots.reduce((sum, snap) => sum + (snap.heartRate || 0), 0) / this.snapshots.length;
    const maxPower = Math.max(...this.snapshots.map((snap) => snap.power || 0));

    // TODO: Calculate calories and normalized power
    const normalizedPower = 0;

    return {
      totalDuration,
      avgCadence: isNaN(avgCadence) ? undefined : avgCadence,
      maxCadence: isNaN(maxCadence) ? undefined : maxCadence,
      avgHeartRate: isNaN(avgHeartRate) ? undefined : avgHeartRate,
      maxPower: isNaN(maxPower) ? undefined : maxPower,
      avgPower: isNaN(avgPower) ? 0 : avgPower,
      totalDistance: isNaN(totalDistance) ? undefined : totalDistance,
      calories: undefined,
      normalizedPower: undefined,
    };
  }
}
