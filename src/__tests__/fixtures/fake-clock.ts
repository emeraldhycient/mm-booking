import { FIXED_NOW } from './payloads.js';

export class FakeClock {
  private ms: number;

  constructor(start: Date = FIXED_NOW) {
    this.ms = start.getTime();
  }

  readonly now = (): Date => new Date(this.ms);

  advance(ms: number): void {
    this.ms += ms;
  }
}
