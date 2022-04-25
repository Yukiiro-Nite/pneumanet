import { Source } from "../source/source"
import { Sink } from "../sink/sink"
import { genId } from "../utils/numberUtils"
import { Part } from "../part/part"
import { FlowResults } from "../engine/engine"
import { ConnectionConfig } from "../device/device"

const id = () => `tank-${genId()}`

export interface TankOptions {
  capacity?: number;
  amount?: number;
  name?: string;
}

export interface SuckResults {
  nodes: Record<string, SuckResult>;
}

export interface SuckResult {
  suck: number;
}

export class Tank extends Part {
  public capacity: number;
  public amount: number;
  public inputs: Record<string, Sink> = {}
  public outputs: Record<string, Source> = {}

  constructor ({ capacity=0, amount=0, name=id() }: TankOptions = {}) {
    super(name)
    this.capacity = capacity
    this.amount = amount
  }

  public add (amount: number): number {
    if(amount < 0) {
      throw new Error('Can not add a negative amount to tank, use take')
    }

    let newTotal = this.amount + amount
    let overflow = 0

    if(newTotal > this.capacity) {
      overflow = newTotal - this.capacity
      newTotal = this.capacity
    }

    this.amount = newTotal

    return overflow
  }

  public take (amount: number): number {
    if(amount < 0) {
      throw new Error('Can not take a negative amount from tank, use add')
    }

    let newTotal = this.amount - amount
    let taken = amount

    if(newTotal < 0) {
      taken = amount + newTotal
      newTotal = 0
    }

    this.amount = newTotal

    return taken
  }

  public getFree (): number {
    return this.capacity - this.amount
  }

  public fillRatio (): number {
    return this.amount / this.capacity
  }

  public isEmpty (): boolean {
    return this.amount === 0
  }

  public addPort (details: ConnectionConfig): Sink | Source | undefined {
    if(details.type === "input") {
      return this.addInput(details)
    } else if(details.type = "output") {
      return this.addOutput(details)
    }
  }

  private addInput (details: ConnectionConfig): Sink {
    const input = new Sink({ parent: this })
    const id = details.name || input.name
    this.inputs[id] = input
    return input
  }

  public addOutput (details: ConnectionConfig): Source {
    const output = new Source({ parent: this })
    const id = details.name || output.name
    this.outputs[id] = output
    return output
  }

  public removePort(name: string) {
    const input = this.inputs[name]
    const output = this.outputs[name]

    if (input) {
      input.disconnectAll()
      delete this.inputs[name]
    }

    if (output) {
      output.disconnectAll()
      delete this.outputs[name]
    }
  }

  public updateInputs () {
    const inputCount = Object.keys(this.inputs).length
    if (inputCount <= 0) return;

    const inputs = Object.values(this.inputs)
    const available = this.capacity - this.amount
    const totalPush = inputs.reduce((sum, sink) => {
      if (sink && sink.input) {
        sum = sum + sink.input.outFlow
      }
      return sum
    }, 0)
    const nearFull = totalPush > available

    inputs.forEach(sink => {
      if (sink.input) {
        sink.inFlow = nearFull
          ? (sink.input.outFlow / totalPush) * available
          : sink.input.outFlow
      } else {
        sink.inFlow = 0
      }
    })
  }

  public updateOutputs () {
    const outputCount = Object.keys(this.outputs).length
    if (outputCount <= 0) return;

    const outputs = Object.values(this.outputs)
    const totalPull = outputs.reduce((sum, source) => {
      if (source && source.output) {
        sum + source.output.inFlow
      }
      return sum
    }, 0)
    const nearEmpty = totalPull > this.amount

    outputs.forEach(source => {
      if (source.output) {
        source.outFlow = nearEmpty
          ? (source.output.inFlow / totalPull) * this.amount
          : source.output.inFlow
      } else {
        source.outFlow = 0
      }
    })
  }

  public updateIO() {
    this.updateOutputs()
    this.updateInputs()
  }

  public updateOutputFlows (outflow: number, results: FlowResults, time: number) {
    const outputCount = Object.keys(this.outputs).length
    if (outputCount <= 0) return;

    const outputs = Object.values(this.outputs)
    const totalPull = outputs.reduce((sum, source) => {
      if (source && source.output) {
        sum + (source.output.inFlow * time)
      }
      return sum
    }, 0)
    const nearEmpty = totalPull > outflow

    outputs.forEach(source => {
      if (source.output) {
        source.outFlow = nearEmpty
          ? (((source.output.inFlow * time) / totalPull) * outflow) / time
          : source.output.inFlow
      } else {
        source.outFlow = 0
      }

      results.nodes[source.name] = { flow: source.outFlow * time }
    })
  }

  public updateInputFlows (inflow: number, results: FlowResults, time: number) {
    const inputCount = Object.keys(this.inputs).length
    if (inputCount <= 0) return;

    const inputs = Object.values(this.inputs)
    const totalPush = inputs.reduce((sum, sink) => {
      if (sink && sink.input) {
        sum = sum + (sink.input.outFlow * time)
      }
      return sum
    }, 0)
    const nearFull = totalPush > inflow

    inputs.forEach(sink => {
      if (sink.input) {
        sink.inFlow = nearFull
          ? (((sink.input.outFlow * time) / totalPush) * inflow) / time
          : sink.input.outFlow
      } else {
        sink.inFlow = 0
      }

      results.nodes[sink.name] = { flow: sink.inFlow * time }
    })
  }

  public updateIOFlows (inflow: number, outflow: number, results: FlowResults, time: number) {
    const available = this.getFree()
    const actualOutflow = Math.min(outflow, this.amount + inflow)
    const actualInflow = Math.min(inflow, available + outflow)
    this.updateOutputFlows(actualOutflow, results, time)
    this.updateInputFlows(actualInflow, results, time)

    results.nodes[this.name] = { flow: Math.min(actualOutflow, actualInflow) }
  }

  public updateAmount (inflow: number, outflow: number) {
    const flowDelta = inflow - outflow
    if (flowDelta >= 0) {
      this.add(flowDelta)
    } else {
      this.take(Math.abs(flowDelta))
    }
  }

  public flow(results: FlowResults, time: number): FlowResults {
    this.updateIO()

    // backtrace other outputs with src.suck
    // get the total potential suck
    const suckResults = { nodes: {} } as SuckResults;
    const outputs = Object.values(this.outputs);
    const outputSucks = outputs.map(output => {
      output.suck(suckResults, time)
      return { node: output, suckVal: suckResults.nodes[output.name].suck }
    })
    const totalSuck = outputSucks.reduce((sum, output) => sum + output.suckVal, 0)

    // Get the total potential in flow
    const flowResults = { nodes: {}, inputs: {}, outputs: {} } as FlowResults;
    const inputs = Object.values(this.inputs);
    const inputFlows = inputs.map(input => {
      const externalInput = input.input
      if (!externalInput) {
        return { flow: 0 }
      }

      externalInput.flow(flowResults, time)
      return { node: externalInput, flow: flowResults.nodes[externalInput.name].flow }
    })
    const totalInflow = inputFlows.reduce((sum, input) => sum + input.flow, 0)

    this.updateIOFlows(totalInflow, totalSuck, results, time)
    this.updateAmount(totalInflow, totalSuck)

    // propogate flow to the inputs
    inputs.forEach(input => {
      const externalInput = input.input
      if (!externalInput) return;

      externalInput.flow(results, time)
    })

    return results
  }

  public suck (results: SuckResults, time: number): SuckResults {
    console.error('Implement tank.suck!')
    return results
  }

  public disconnectAll () {
    Object.values(this.inputs).forEach(src => src.disconnectAll())
    Object.values(this.outputs).forEach(snk => snk.disconnectAll())
  }
}