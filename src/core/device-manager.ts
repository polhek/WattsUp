import { DeviceState } from "./device-state.ts";
import type { DeviceCategory, DeviceTypeMap } from "./device-registry.ts";
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
    this.devices.set(category, instance);

    try {
      instance.status = DeviceState.Connecting;
      instance.dispatchEvent(new CustomEvent("statuschange", { detail: instance.status }));

      await instance.init();

      instance.status = DeviceState.Connected;
      instance.dispatchEvent(new CustomEvent("statuschange", { detail: instance.status }));
    } catch (e) {
      instance.status = DeviceState.Disconnected;
      instance.dispatchEvent(new CustomEvent("statuschange", { detail: instance.status }));
      this.devices.delete(category);
      throw e;
    }

    return instance;
  }

  get<K extends DeviceCategory>(category: K): DeviceTypeMap[K] | undefined {
    return this.devices.get(category) as DeviceTypeMap[K] | undefined;
  }

  disconnect(category: DeviceCategory) {
    const device = this.devices.get(category);
    if (device) {
      device.disconnect();
      this.devices.delete(category);
    }
  }

  disconnectAll() {
    for (const device of this.devices.values()) {
      device.disconnect();
    }
    this.devices.clear();
  }
}
