import { Connectable } from "../connectable/connectable"
import { Device } from "../device/device";
import { FlowResults } from "../engine/engine";
import { Part } from "../part/part";
import { Sink } from "../sink/sink";
import { SuckResults } from "../tank/tank";
import { genId } from "../utils/numberUtils"

export interface SourceOptions {
  outFlow?: number;
  name?: string;
  parent?: Part;
}

const id = () => `src-${genId()}`

export class Source extends Connectable {
  public outFlow: number;
  public name: string;

  constructor({ outFlow=0, name=id(), parent }: SourceOptions = {}) {
    super({ parent })
    this.outFlow = outFlow
    this.name = name
  }

  public flow (results: FlowResults, time: number): FlowResults {
    if(results.nodes[this.name]) {
      console.log(`Already calculated flow for ${this.name}: ${results.nodes[this.name].flow}`)
      return results;
    } else if (this.parent) {
      console.log(`Getting parent flow ${this.parent.name} for ${this.name}`)
      this.parent.flow(results, time)
      // results.nodes[this.name] = results.nodes[this.parent.name]
    } else {
      const outputSuck = this.output?.inFlow ?? 0
      const flowResult = { flow: Math.min(this.outFlow * time, outputSuck * time)}
      results.nodes[this.name] = flowResult
      results.inputs[this.name] = flowResult
      console.log(`Calculating own flow for ${this.name}: ${flowResult.flow}`)
    }

    return results
  }

  public suck (results: SuckResults, time: number): SuckResults {
    let suckResult = { suck: 0 }

    if(results.nodes[this.name]) {
      return results
    } else if (this.output) {
      this.output.suck(results, time)
      const outSuck = results.nodes[this.output.name].suck
      suckResult.suck = Math.min(this.outFlow * time, outSuck)
    }

    results.nodes[this.name] = suckResult

    return results
  }

  public connect(other: Connectable): boolean {
    this.output = other as Sink
    other.input = this
    return true
  }
}