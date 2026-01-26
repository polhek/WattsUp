export interface ActivitySnapshot {
  timestamp: number; // Unix ms
  elapsedTime: number; // Seconds from start (excluding pauses)
  power?: number; // Watts
  cadence?: number; // RPM
  heartRate?: number; // BPM
  speed?: number; // km/h (conversion to m/s happens in Encoder)
  distance?: number; // Cumulative meters
  targetPower?: number; // The ERG setpoint at this moment
}

export const ActivityEventType = {
  Timer: 'timer',
  Lap: 'lap',
  WorkoutStep: 'workout_step',
} as const;

export interface ActivityEvent {
  type: (typeof ActivityEventType)[keyof typeof ActivityEventType];
  value: 'start' | 'stop' | 'pause' | 'resume' | 'marker';
  timestamp: number;
  label?: string; // e.g., "Warmup", "Sprints"
}

export interface FinalizedActivity {
  startTime: Date;
  endTime: Date;
  records: ActivitySnapshot[];
  events: ActivityEvent[];
  summary: ActivitySummary;
}

export interface ActivitySummary {
  avgPower: number | undefined;
  maxPower: number | undefined;
  avgHeartRate: number | undefined;
  totalDistance: number | undefined; // Meters
  totalDuration: number | undefined; // Seconds (moving time)
  kiloJoules: number | undefined;
  avgCadence: number | undefined;
  maxCadence: number | undefined;
  normalizedPower: number | undefined;
  avgSpeed?: number | undefined; // km/h
  maxSpeed?: number | undefined; // km/h
}
