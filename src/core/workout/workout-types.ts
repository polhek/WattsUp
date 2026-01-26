export interface WorkoutStep {
  duration: number; // seconds
  targetPower: number; // watts
  cadence?: number; // rpm
  label?: string;
}
