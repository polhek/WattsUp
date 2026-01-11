import type { DeviceCategory } from "./device-registry.ts";
import { DEVICE_MAP } from "./device-registry.ts";
import type { BaseDevice } from "./devices/base-device";

export class DeviceManager extends EventTarget {
  protected devices = new Map<DeviceCategory, BaseDevice>();

  async connect(category: DeviceCategory) {
    const config = DEVICE_MAP[category];

    const webDevice = await navigator.bluetooth.requestDevice({
      filters: [{ services: [config.service] }],
    });

    const instance = new config.class(webDevice);

    await instance.init();
    this.devices.set(category, instance);

    return instance;
  }

  get<T extends BaseDevice>(category: DeviceCategory): T {
    return this.devices.get(category) as T;
  }
}
