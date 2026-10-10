declare module 'open-location-code' {
  interface CodeArea {
    latitudeCenter: number;
    longitudeCenter: number;
  }
  class OpenLocationCode {
    isValid(code: string): boolean;
    isShort(code: string): boolean;
    isFull(code: string): boolean;
    recoverNearest(code: string, latitude: number, longitude: number): string;
    decode(code: string): CodeArea;
  }
  const library: { OpenLocationCode: typeof OpenLocationCode };
  export default library;
}
