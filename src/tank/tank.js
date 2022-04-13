const Source = require("../source/source")
const Sink = require("../sink/sink")
const { genId } = require("../utils/numberUtils")

const id = () => `tank-${genId()}`

class Tank {
  inputs = {}
  outputs = {}

  constructor({ capacity=0, amount=0, name=id() } = {}) {
    this.capacity = capacity
    this.amount = amount
    this.name = name
  }

  add(amount) {
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

  take(amount) {
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

  getFree() {
    return this.capacity - this.amount
  }

  fillRatio() {
    return this.amount / this.capacity
  }

  isEmpty() {
    return this.amount === 0
  }

  addPort(details) {
    if(details.type === "input") {
      return this.addInput(details)
    } else if(details.type = "output") {
      return this.addOutput(details)
    }
  }

  addInput(details) {
    const input = new Sink({ parent: this })
    const id = details.name || input.name
    this.inputs[id] = input
    return input
  }

  addOutput(details) {
    const output = new Source({ parent: this })
    const id = details.name || output.name
    this.outputs[id] = output
    return output
  }

  removePort(name) {
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

  updateInputs() {
    const inputCount = Object.keys(this.inputs).length
    if (inputCount <= 0) return;

    const inputs = Object.values(this.inputs)
    const available = this.capacity - this.amount
    const totalPush = inputs.reduce((sum, sink) => sum + sink.input.outFlow, 0)
    const nearFull = totalPush > available

    inputs.forEach(sink => {
      sink.inFlow = nearFull
        ? (sink.input.outFlow / totalPush) * available
        : sink.input.outFlow
    })
  }

  updateOutputs() {
    const outputCount = Object.keys(this.outputs).length
    if (outputCount <= 0) return;

    const outputs = Object.values(this.outputs)
    const totalPull = outputs.reduce((sum, source) => sum + source.output.inFlow, 0)
    const nearEmpty = totalPull > this.amount

    outputs.forEach(source => {
      source.outFlow = nearEmpty
        ? (source.output.inFlow / totalPull) * this.amount
        : source.output.inFlow
    })
  }

  updateIO() {
    this.updateOutputs()
    this.updateInputs()
  }

  flow(results, time) {
    // backtrace other outputs with src.suck
    // get the total potential suck
    // 
    const suckResults = { nodes: {} }
    const outputs = Object.values(this.outputs);
    const outputSucks = outputs.map(output => {
      output.suck(suckResults, time)
      return { node: output, suckVal: suckResults.nodes[output.name].suck }
    })
    const totalSuck = outputSucks.reduce((sum, output) => sum + output.suckVal, 0)
    this.updateOutputs()
    outputs.forEach(output => {
      results.nodes[output.name] = { flow: suckResults.nodes[output.name].suck }
    })

    console.log(outputSucks)

    return results
  }
}

module.exports = Tank