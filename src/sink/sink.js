const Connectable = require('../connectable/connectable.js')
const { genId } = require('../utils/numberUtils.js')

const id = () => `snk-${genId()}`

class Sink extends Connectable {
  constructor({ inFlow=0, name=id(), parent } = {}) {
    super()
    this.inFlow = inFlow
    this.name = name
    this.parent = parent
  }

  flow(results, time) {
    let flowVal = 0

    if(results.nodes[this.name]) {
      return results;
    } else if (this.input) {
      this.input.flow(results, time)
      const inputFlow = results.nodes[this.input.name].flow
      flowVal = Math.min(this.inFlow * time, inputFlow)
    }

    if(!this.parent) {
      results.outputs[this.name] = { flow: flowVal }
    }

    results.nodes[this.name] = { flow: flowVal }

    return results
  }

  connect(other) {
    this.input = other
    other.output = this
    return true
  }
}

module.exports = Sink