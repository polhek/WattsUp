import type { DeviceManager } from '../core/device-manager';

export class WorkoutManager extends EventTarget {
  private deviceManager: DeviceManager;

  constructor(deviceManager: DeviceManager) {
    super();
    this.deviceManager = deviceManager;
  }

  tick() {
    this.deviceManager.get('smartTrainer');

    throw new Error('Not yet implemented.');
  }
}
