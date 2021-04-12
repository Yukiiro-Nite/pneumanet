const Device = require("../device/device")
const Tank = require("../tank/tank")

class Engine {
  devices = {}

  createDevice({ name, deviceConfig }) {
    const device = new Device(deviceConfig)

    this.devices[name] = device
  }

  getDevice(name) {
    return this.devices[name]
  }

  iterateDevice(name, time) {
    const results = { inputs: {}, outputs: {}, nodes: {} }
    const device = this.devices[name]

    if(!device) return results;

    const outputs = Object.values(device.outputs)
    const tanks = Object.values(device.nodes).filter((node) => node instanceof Tank)
    
    outputs.forEach((output) => output.flow(results, time))
    tanks.forEach((tank) => tank.flow(results, time))

    return results
  }
}

module.exports = Engine