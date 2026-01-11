import { HeartRateMonitor } from "./devices/hr-monitor";
import { SmartTrainer } from "./devices/smart-trainer";

export const DEVICE_MAP = {
  heartRate: {
    class: HeartRateMonitor,
    service: "heart_rate",
  },
  smartTrainer: {
    class: SmartTrainer,
    service: "fitness_machine",
  },
} as const;

export type DeviceTypeMap = {
  [K in keyof typeof DEVICE_MAP]: InstanceType<(typeof DEVICE_MAP)[K]["class"]>;
};

export type DeviceCategory = keyof typeof DEVICE_MAP;
