import { FlowResults } from "../engine/engine";
import { Part } from "../part/part";
import { Sink } from "../sink/sink";
import { Source } from "../source/source";
import { SuckResults } from "../tank/tank";
import { clamp, transform, genId } from '../utils/numberUtils'

const id = () => `valve-${genId()}`

export interface ValveOptions {
  maxFlow?: number;
  controlMax?: number;
  controlMin?: number;
  name?: string;
}

export class Valve extends Part {
  private _maxFlow: number
  private _controlMax: number
  private _controlMin: number

  public output: Source
  public input: Sink
  public control: Sink

  set maxFlow(flow: number) {
    this._maxFlow = flow
  }

  set controlMax(max: number) {
    this._controlMax = max
  }

  set controlMin(min: number) {
    this._controlMin = min
  }

  constructor({ maxFlow=0, controlMax=0, controlMin=0, name=id() }: ValveOptions = {}) {
    super(name)
    this.output = new Source({ parent: this })
    this.input = new Sink({ parent: this })
    this.control = new Sink({ parent: this })

    this._maxFlow = maxFlow
    this._controlMax = controlMax
    this._controlMin = controlMin
  }

  private updateControl () {
    this.control.inFlow = Math.max(this._controlMax, this._controlMin)
  }

  private updateIO (results: FlowResults, time: number) {
    if (!this.output || !this.output.output) return;

    const vFlow = Math.min(this.valveFlow(results, time), this.output.output.inFlow * time)
    this.output.outFlow = vFlow
    this.input.inFlow = vFlow
  }

  private valveFlow (results: FlowResults, time: number) {
    this.control.flow(results, time)
    const controlFlow = results.nodes[this.control.name].flow
    const controlValue = transform(controlFlow, this._controlMin * time, this._controlMax * time, 0, 1, true)
    return this._maxFlow * controlValue;
  }

  public flow (results: FlowResults, time: number): FlowResults {
    this.updateControl()
    this.updateIO(results, time)

    this.input.flow(results, time)
    const flowVal = results.nodes[this.input.name].flow
    results.nodes[this.name] = { flow: flowVal }
    results.nodes[this.output.name]  = { flow: flowVal }

    return results
  }

  public suck (results: SuckResults, time: number): SuckResults {
    this.updateControl()
    const valveFlowResults = { nodes: {}, inputs: {}, outputs: {} }
    this.updateIO(valveFlowResults, time)

    this.output.suck(results, time)
    results.nodes[this.name] = results.nodes[this.output.name]

    return results
  }

  public disconnectAll () {
    this.input?.disconnectAll()
    this.control?.disconnectAll()
    this.output?.disconnectAll()
  }
}