const Sink = require('../sink/sink.js');
const Source = require('../source/source.js')
const { clamp, transform, genId } = require('../utils/numberUtils.js')

const id = () => `valve-${genId()}`

class Valve {
  set maxFlow(flow) {
    this._maxFlow = flow
  }

  set controlMax(max) {
    this._controlMax = max
  }

  set controlMin(min) {
    this._controlMin = min
  }

  constructor({ maxFlow=0, controlMax=0, controlMin=0, name=id() } = {}) {
    this.output = new Source({ parent: this })
    this.input = new Sink({ parent: this })
    this.control = new Sink({ parent: this })
    this.name = name

    this._maxFlow = maxFlow
    this._controlMax = controlMax
    this._controlMin = controlMin
  }

  updateControl() {
    this.control.inFlow = Math.max(this._controlMax, this._controlMin)
  }

  updateIO(results, time) {
    const vFlow = Math.min(this.valveFlow(results, time), this.output.output.inFlow * time)
    this.output.outFlow = vFlow
    this.input.inFlow = vFlow
  }

  valveFlow(results, time) {
    this.control.flow(results, time)
    const controlFlow = results.nodes[this.control.name].flow
    const controlValue = transform(controlFlow, this._controlMin * time, this._controlMax * time, 0, 1, true)
    return this._maxFlow * controlValue;
  }

  flow(results, time) {
    this.updateControl()
    this.updateIO(results, time)

    this.input.flow(results, time)
    const flowVal = results.nodes[this.input.name].flow
    results.nodes[this.name] = { flow: flowVal }

    return results
  }

  suck(results, time) {
    this.updateControl()
    const valveFlowResults = { nodes: {}, inputs: {}, outputs: {} }
    this.updateIO(valveFlowResults, time)

    this.output.suck(results, time)
    results.nodes[this.name] = results.nodes[this.output.name]

    return results
  }
}

module.exports = Valve