import { FlowResults } from "../engine/engine";
import { SuckResults } from "../tank/tank";

export abstract class Part {
  public name: string;

  constructor (name: string) {
    this.name = name;
  }

  public abstract flow (results: FlowResults, time: number): FlowResults
  public abstract suck (results: SuckResults, time: number): SuckResults
}