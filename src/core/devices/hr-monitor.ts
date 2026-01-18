import { HRParser } from './parsers/hr-parser';
import { BaseDevice } from './base-device';

export class HeartRateMonitor extends BaseDevice {
  async init() {
    const server = await this.device.gatt?.connect();
    const service = await server?.getPrimaryService('heart_rate');
    this.characteristic = await service?.getCharacteristic('heart_rate_measurement')!;

    await this.characteristic.startNotifications();
    this.characteristic.addEventListener('characteristicvaluechanged', (e: any) => {
      console.log('Heart Rate Characteristic Value Changed');
      console.log('Heart Rate Data Received:', e.target.value);
      console.log('Parsed BPM:', HRParser.parse(e.target.value));

      this.dispatchEvent(
        new CustomEvent('data', {
          detail: { bpm: HRParser.parse(e.target.value) },
        }),
      );
    });
  }
}
