import { DeviceState } from "../device-state";

export abstract class BaseDevice extends EventTarget {
  protected device: BluetoothDevice;
  protected characteristic: BluetoothRemoteGATTCharacteristic | null = null;
  public status: DeviceState = DeviceState.Disconnected;

  constructor(device: BluetoothDevice) {
    super();
    this.device = device;
    this.device.addEventListener("gattserverdisconnected", () => {
      this.status = DeviceState.Disconnected;
      this.dispatchEvent(new CustomEvent("statuschange", { detail: this.status }));
    });
  }

  abstract init(): Promise<void>;

  public get name(): string {
    return this.device.name || "Unknown Device";
  }

  public disconnect() {
    this.status = DeviceState.Disconnecting;
    this.dispatchEvent(new CustomEvent("statuschange", { detail: this.status }));
    this.device.gatt?.disconnect();
  }
}
