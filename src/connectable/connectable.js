const EventEmitter = require('events');

class Connectable extends EventEmitter {
  set input(value) {
    const oldVal = this._input
    this._input = value
    if (oldVal !== this._input) {
      this.emit('inputChanged', this._input, oldVal)
    }
  }

  get input() {
    return this._input
  }

  set output(value) {
    const oldVal = this._output
    this._output = value
    if (oldVal !== this._output) {
      this.emit('outputChanged', this._output, oldVal)
    }
  }

  get output() {
    return this._output
  }

  constructor({ device } = {}) {
    super()
    this.device = device
    this.error = ""
  }

  connect(other) {
      this.error = "Can only connect Sources to Sinks"
      return false
  }

  disconnectAll()
  {
    if (this.output) {
      this.output.input = null
    }

    if (this.input) {
      this.input.output = null
    }
  }
}

module.exports = Connectable