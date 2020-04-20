const { clamp } = require('../utils/numberUtils.js')

class Valve {
  constructor({ bandwidth, control }) {
    this.bandwidth = bandwidth
    this.control = control
  }

  transfer() {
    const controlValue = this.control()
    const clampedControlValue = clamp(controlValue, [0, 1])

    return this.bandwidth * clampedControlValue
  }
}

module.exports = Valve