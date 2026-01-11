import { BaseDevice } from "./base-device";

export class HeartRateMonitor extends BaseDevice {
  async init() {
    const server = await this.device.gatt?.connect();
    const service = await server?.getPrimaryService("heart_rate");
    this.characteristic = await service?.getCharacteristic(
      "heart_rate_measurement"
    )!;

    await this.characteristic.startNotifications();
    this.characteristic.addEventListener(
      "characteristicvaluechanged",
      (e: any) => {
        this.dispatchEvent(
          new CustomEvent("data", { detail: { bpm: 90 /* parse logic */ } })
        );
      }
    );
  }
}
