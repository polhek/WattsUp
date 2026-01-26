import type { WorkoutStep } from './workout-types';

export class Workout {
  private steps: WorkoutStep[] = [];
  private currentStepIndex = 0;
  private eleapsedTimeInCurrentStepSecs = 0;

  constructor(steps: WorkoutStep[]) {
    this.steps = steps;
  }

  tick() {
    const currentStep = this.steps[this.currentStepIndex];

    if (!currentStep) {
      return;
    }

    this.eleapsedTimeInCurrentStepSecs++;

    if (this.eleapsedTimeInCurrentStepSecs >= currentStep.duration) {
      this.currentStepIndex++;
      this.eleapsedTimeInCurrentStepSecs = 0;
    }

    return this.steps[this.currentStepIndex];
  }
}
