import { FTMSParser } from './parsers/ftms-parser';
import { BaseDevice } from './base-device';

export class SmartTrainer extends BaseDevice {
  private controlPointCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private isListening = false;
  private dataToListenTo = {
    cadence: false,
    power: false,
    speed: false,
  };
  private latestData = {
    cadence: 0,
    power: 0,
    speed: 0,
  };

  async init() {
    const server = await this.device.gatt?.connect();
    const service = await server?.getPrimaryService('fitness_machine');

    this.characteristic = await service?.getCharacteristic('indoor_bike_data')!;
    this.controlPointCharacteristic = await service?.getCharacteristic(
      'fitness_machine_control_point',
    )!;
  }

  async requestControl() {
    if (!this.controlPointCharacteristic) {
      throw new Error('Control Point Characteristic not initialized.');
    }
    await this.controlPointCharacteristic.startNotifications();
    this.controlPointCharacteristic.addEventListener('characteristicvaluechanged', (e) =>
      this.handleControlResponse(e),
    );

    const REQUEST_CONTROL_OP_CODE = 0x00;
    const REQUEST_CONTROL_VALUE = new Uint8Array([REQUEST_CONTROL_OP_CODE, 0x01]); // 0x01 for "Request Control"
    await this.controlPointCharacteristic.writeValue(REQUEST_CONTROL_VALUE);
  }

  async startNotifications() {
    if (this.isListening || !this.characteristic) {
      return;
    }

    await this.characteristic.startNotifications();
    this.characteristic.addEventListener(
      'characteristicvaluechanged',
      this.handleDataChange.bind(this),
    );
    this.isListening = true;
  }

  async stopNotifications() {
    if (!this.characteristic || !this.isListening) return;

    await this.characteristic.stopNotifications();
    this.characteristic.removeEventListener(
      'characteristicvaluechanged',
      this.handleDataChange.bind(this),
    );
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

  private handleDataChange(handleDataChange: Event) {
    const target = handleDataChange.target as BluetoothRemoteGATTCharacteristic;
    if (!target) {
      return;
    }
    const dataView = target.value;
    const stats = FTMSParser.parse(dataView);

    this.latestData = {
      cadence: this.dataToListenTo.cadence
        ? (stats.cadence ?? this.latestData.cadence)
        : this.latestData.cadence,
      power: this.dataToListenTo.power
        ? (stats.power ?? this.latestData.power)
        : this.latestData.power,
      speed: this.dataToListenTo.speed
        ? (stats.speed ?? this.latestData.speed)
        : this.latestData.speed,
    };

    this.dispatchEvent(
      new CustomEvent('data', {
        detail: this.latestData,
      }),
    );
  }

  private handleControlResponse(event: Event) {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    const value = target.value;

    if (value && value.getUint8(0) === 0x80) {
      const responseToOpCode = value.getUint8(1);
      const resultCode = value.getUint8(2);

      if (resultCode === 0x01) {
        console.log(`Success: Command ${responseToOpCode} executed.`);
      } else {
        console.error(`Error: Command ${responseToOpCode} failed with code ${resultCode}`);
      }
    }
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

  async setPower(targetPower: number) {
    if (!this.controlPointCharacteristic) {
      throw new Error('Control Point Characteristic not initialized.');
    }

    const SET_TARGET_POWER_OP_CODE = 0x05;
    const powerValue = new Uint8Array([
      SET_TARGET_POWER_OP_CODE,
      targetPower & 0xff,
      (targetPower >> 8) & 0xff,
    ]);
    await this.controlPointCharacteristic.writeValue(powerValue);
  }

  async setResistanceLevel(level: number) {
    if (!this.controlPointCharacteristic) {
      throw new Error('Control Point Characteristic not initialized.');
    }

    const SET_RESISTANCE_LEVEL_OP_CODE = 0x06;
    const levelValue = new Uint8Array([
      SET_RESISTANCE_LEVEL_OP_CODE,
      level & 0xff,
      (level >> 8) & 0xff,
    ]);
    await this.controlPointCharacteristic.writeValue(levelValue);
  }

  getLatestData() {
    return this.latestData;
  }
}
