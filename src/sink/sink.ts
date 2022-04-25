import { Connectable } from '../connectable/connectable'
import { Device } from '../device/device';
import { FlowResults } from '../engine/engine';
import { Part } from '../part/part';
import { Source } from '../source/source';
import { SuckResults } from '../tank/tank';
import { genId } from '../utils/numberUtils'

export interface SinkOptions {
  inFlow?: number;
  name?: string;
  parent?: Part;
}

const id = () => `snk-${genId()}`

export class Sink extends Connectable {
  public inFlow: number;
  public name: string;

  constructor({ inFlow=0, name=id(), parent }: SinkOptions = {}) {
    super({ parent })
    this.inFlow = inFlow
    this.name = name
  }

  public flow (results: FlowResults, time: number): FlowResults {
    let flowVal = 0

    if(results.nodes[this.name]) {
      return results;
    } else if (this.input) {
      this.input.flow(results, time)
      console.log(`Looking for flow from ${this.input.parent?.name} ${this.input.name} to ${this.parent?.name} ${this.name}`)
      console.log(results)
      const inputFlow = results.nodes[this.input.name].flow
      flowVal = Math.min(this.inFlow * time, inputFlow)
    }

    if(!this.parent) {
      results.outputs[this.name] = { flow: flowVal }
    }

    results.nodes[this.name] = { flow: flowVal }

    return results
  }

  public suck (results: SuckResults, time: number): SuckResults {
    let suckResult = { suck: 0 }

    if(results.nodes[this.name]) {
      return results
    } else if (this.parent) {
      this.parent.suck(results, time)
      suckResult = results.nodes[this.parent.name]
    } else if (this.input) {
      suckResult.suck = this.inFlow * time // Math.min(this.inFlow * time, this.input.outFlow * time)
    }

    results.nodes[this.name] = suckResult

    return results
  }

  public connect (other: Connectable): boolean {
    this.input = other as Source
    other.output = this
    return true
  }
}