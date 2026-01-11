export const DeviceState = {
  Connecting: "connecting",
  Connected: "connected",
  Disconnecting: "disconnecting",
  Disconnected: "disconnected",
} as const;

export type DeviceState = (typeof DeviceState)[keyof typeof DeviceState];
