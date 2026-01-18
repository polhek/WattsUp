import type { DeviceManager } from '../core/device-manager';

export class WorkoutManager extends EventTarget {
  constructor(private deviceManager: DeviceManager) {
    super();
  }
}
