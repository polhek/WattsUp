import { HeartRateMonitor } from "./devices/hr-monitor";
import { SmartTrainer } from "./devices/smart-trainer";

export const DEVICE_MAP = {
  hearthRate: {
    class: HeartRateMonitor,
    service: "heart_rate",
  },
  smartTrainer: {
    class: SmartTrainer,
    service: "fitness_machine",
  },
} as const;

export type DeviceCategory = keyof typeof DEVICE_MAP;
