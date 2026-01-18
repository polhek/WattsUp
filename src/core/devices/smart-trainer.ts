import { FTMSParser } from '../parsers/ftms-parser';
import { BaseDevice } from './base-device';

export class SmartTrainer extends BaseDevice {
  private isListening = false;
  private dataToListenTo = {
    cadence: false,
    power: false,
    speed: false,
  };

  async init() {
    const server = await this.device.gatt?.connect();
    const service = await server?.getPrimaryService('fitness_machine');
    this.characteristic = await service?.getCharacteristic('indoor_bike_data')!;
  }

  async startNotifications() {
    if (this.isListening || !this.characteristic) {
      return;
    }

    await this.characteristic.startNotifications();
    this.characteristic.addEventListener('characteristicvaluechanged', this.handleDataChange);
    this.isListening = true;
  }

  async stopNotifications() {
    if (!this.characteristic || !this.isListening) return;

    await this.characteristic.stopNotifications();
    this.characteristic.removeEventListener('characteristicvaluechanged', this.handleDataChange);
    this.isListening = false;
  }

  private async syncNotificationState() {
    const needsToListen = Object.values(this.dataToListenTo).some((val) => val === true);

    if (needsToListen && !this.isListening) {
      await this.startNotifications();
    } else if (!needsToListen && this.isListening) {
      await this.stopNotifications();
    }
  }

  handleDataChange(handleDataChange: Event) {
    const target = handleDataChange.target as BluetoothRemoteGATTCharacteristic;
    if (!target) {
      return;
    }
    const dataView = target.value;
    const stats = FTMSParser.parse(dataView);
  }

  async setPowerDataListening(shouldListen: boolean) {
    this.dataToListenTo.power = shouldListen;
    await this.syncNotificationState();
  }

  async setCadenceDataListening(shouldListen: boolean) {
    this.dataToListenTo.cadence = shouldListen;
    await this.syncNotificationState();
  }

  async setSpeedDataListening(shouldListen: boolean) {
    this.dataToListenTo.speed = shouldListen;
    await this.syncNotificationState();
  }
}
