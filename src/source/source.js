const Connectable = require('../connectable/connectable.js')
const { genId } = require('../utils/numberUtils.js')

const id = () => `src-${genId()}`

class Source extends Connectable {
  constructor({ outFlow=0, name=id(), parent } = {}) {
    super()
    this.outFlow = outFlow
    this.name = name
    this.parent = parent
  }

  flow(results, time) {
    if(results.nodes[this.name]) {
      return results;
    } else if (this.parent) {
      this.parent.flow(results, time)
      results.nodes[this.name] = results.nodes[this.parent.name]
    } else {
      const flowResult = { flow: Math.min(this.outFlow * time, this.output.inFlow * time)}
      results.nodes[this.name] = flowResult
      results.inputs[this.name] = flowResult
    }

    return results
  }

  suck(results, time) {
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

  connect(other) {
    this.output = other
    other.input = this
    return true
  }
}

module.exports = Source