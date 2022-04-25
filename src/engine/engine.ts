import { Connectable } from '../connectable/connectable'
import { Device, DeviceOptions } from '../device/device'
import { Sink } from '../sink/sink'
import { Source } from '../source/source'
import { Tank } from '../tank/tank'

export interface FlowResults {
  inputs: Record<string, FlowResult>,
  outputs: Record<string, FlowResult>,
  nodes: Record<string, FlowResult>
}

export interface FlowResult {
  flow: number;
}

export class Engine {
  public devices: Record<string, Device> = {}

  public createDevice ({ name, deviceConfig }: { name: string, deviceConfig: DeviceOptions }) {
    const device = new Device(deviceConfig)

    this.devices[name] = device
  }

  public getDevice (name: string): Device {
    return this.devices[name]
  }

  public iterateDevice (name: string, time: number) {
    const results: FlowResults = { inputs: {}, outputs: {}, nodes: {} }
    const device = this.devices[name]

    if(!device) return results;

    const outputs = Object.values(device.outputs)
    
    outputs.forEach((output) => {
      console.log(`Engine calculating flow for ${name} - ${output.name}`)
      output.flow(results, time)
    })

    return results
  }
}
