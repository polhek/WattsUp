export class HRParser {
  static parse(data: DataView) {
    if (!data) return 0;
    const flags = data.getUint8(0);
    const is16Bit = flags & 0x01;
    return is16Bit ? data.getUint16(1, true) : data.getUint8(1);
  }
}
