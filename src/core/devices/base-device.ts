export abstract class BaseDevice extends EventTarget {
  protected device: BluetoothDevice;
  protected characteristic: BluetoothRemoteGATTCharacteristic | null = null;

  constructor(device: BluetoothDevice) {
    super();
    this.device = device;
  }

  abstract init(): Promise<void>;

  public get name(): string {
    return this.device.name || "Unknown Device";
  }
}
