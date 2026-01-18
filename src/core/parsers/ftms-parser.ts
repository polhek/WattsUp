export interface BikeData {
  speed?: number; // in km/h
  cadence?: number; // in RPM
  power?: number; // in Watts
  heartRate?: number; // in BPM
}

export class FTMSParser {
  static parse(data: DataView<ArrayBufferLike> | undefined): BikeData {
    if (!data || data.byteLength < 2) {
      return {};
    }

    const stats: BikeData = {};
    const flags = data.getUint16(0, true);
    let offset = 2; // Start after the Flags

    // Bit 0: More Data (0 = Speed is present)
    // Note: In FTMS, if Bit 0 is 0, Speed is present.
    if (!(flags & 0x01)) {
      if (data.byteLength >= offset + 2) {
        stats.speed = data.getUint16(offset, true) / 100;
        offset += 2;
      }
    }

    // Bit 1: Average Speed
    if (flags & 0x02) offset += 2;

    // Bit 2: Instantaneous Cadence
    if (flags & 0x04) {
      if (data.byteLength >= offset + 2) {
        stats.cadence = data.getUint16(offset, true) / 2;
        offset += 2;
      }
    }

    // Bit 3: Average Cadence
    if (flags & 0x08) offset += 2;

    // Bit 4: Total Distance (3 bytes)
    if (flags & 0x10) offset += 3;

    // Bit 5: Resistance Level
    if (flags & 0x20) offset += 2;

    // Bit 6: Instantaneous Power
    if (flags & 0x40) {
      if (data.byteLength >= offset + 2) {
        stats.power = data.getInt16(offset, true);
        offset += 2;
      }
    }

    // Bit 9: Heart Rate
    if (flags & 0x200) {
      if (data.byteLength >= offset + 1) {
        stats.heartRate = data.getUint8(offset);
        offset += 1;
      }
    }
    console.log(stats);

    return stats;
  }
}
