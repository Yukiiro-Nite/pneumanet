import { DeviceOptions } from '../device/device'
import { Tank } from '../tank/tank'
import { Engine } from './engine'

const AND_DEVICE = 'AND'
const AND_DEVICE_CONFIG = {
  name: AND_DEVICE,
  deviceConfig: {
    nodes: [
      { type: 'src', name: 'src_main', options: { outFlow: 1 } },
      { type: 'src', name: 'src_ctrl', options: { outFlow: 0.1 } },
      { type: 'valve', name: 'valve', options: { maxFlow: 1, controlMax: 0.1 } },
      { type: 'snk', name: 'output', options: { inFlow: 1 } },
    ],
    connections: [
      [ { name: 'src_main'}, { name: 'valve', port: 'input' } ],
      [ { name: 'src_ctrl'}, { name: 'valve', port: 'control' } ],
      [ { name: 'valve', port: 'output' }, { name: 'output' } ],
    ]
  } as DeviceOptions
}

const NOR_DEVICE = 'NOR'
const NOR_DEVICE_CONFIG = {
  name: NOR_DEVICE,
  deviceConfig: {
    nodes: [
      { type: 'src', name: 'src_main', options: { outFlow: 1 } },
      { type: 'src', name: 'src_ctrl_1', options: { outFlow: 0.1 } },
      { type: 'src', name: 'src_ctrl_2', options: { outFlow: 0.1 } },
      { type: 'valve', name: 'valve_1', options: { maxFlow: 1, controlMin: 0.1 } },
      { type: 'valve', name: 'valve_2', options: { maxFlow: 1, controlMin: 0.1 } },
      { type: 'snk', name: 'output', options: { inFlow: 1 } }
    ],
    connections: [
      [ { name: 'src_main'}, { name: 'valve_1', port: 'input' } ],
      [ { name: 'src_ctrl_1'}, { name: 'valve_1', port: 'control' } ],
      [ { name: 'src_ctrl_2'}, { name: 'valve_2', port: 'control' } ],
      [ { name: 'valve_1', port: 'output' }, { name: 'valve_2', port: 'input' } ],
      [ { name: 'valve_2', port: 'output' }, { name: 'output' } ]
    ]
  } as DeviceOptions
}

const BUFFER_DEVICE = 'BUFFER'
const BUFFER_DEVICE_CONFIG = {
  name: BUFFER_DEVICE,
  deviceConfig: {
    nodes: [
      { type: 'src', name: 'src_main', options: { outFlow: 1 } },
      { type: 'src', name: 'src_ctrl', options: { outFlow: 0.1 } },
      { type: 'tank', name: 'tank', options: { capacity: 10 } },
      { type: 'valve', name: 'valve', options: { maxFlow: 2, controlMin: 0.1 } },
      { type: 'snk', name: 'output', options: { inFlow: 2  } }
    ],
    connections: [
      [ { name: 'src_main' }, { name: 'tank', type: 'input' } ],
      [ { name: 'tank', type: 'output' }, { name: 'valve', port: 'input' } ],
      [ { name: 'valve', port: 'output' }, { name: 'output' } ],
      [ { name: 'src_ctrl' }, { name: 'valve', port: 'control' } ]
    ]
  } as DeviceOptions
}

const SIMPLE_TANK_DEVICE = 'SIMPLE_TANK'
const SIMPLE_TANK_DEVICE_CONFIG = {
  name: SIMPLE_TANK_DEVICE,
  deviceConfig: {
    nodes: [
      { type: 'src', name: 'input', options: { outFlow: 2 } },
      { type: 'snk', name: 'output', options: { inFlow: 1 } },
      { type: 'tank', name: 'tank', options: { capacity: 10 } }
    ],
    connections: [
      [ { name: 'input' }, { name: 'tank', type: 'input' } ],
      [ { name: 'tank', type: 'output' }, { name: 'output' } ],
    ]
  } as DeviceOptions
}

const COMPLEX_TANK_DEVICE = 'COMPLEX_TANK'
const COMPLEX_TANK_DEVICE_CONFIG = {
  name: COMPLEX_TANK_DEVICE,
  deviceConfig: {
    nodes: [
      { type: 'src', name: 'input_1', options: { outFlow: 1 } },
      { type: 'src', name: 'input_2', options: { outFlow: 1 } },
      { type: 'snk', name: 'output_1', options: { inFlow: 1 } },
      { type: 'snk', name: 'output_2', options: { inFlow: 1 } },
      { type: 'tank', name: 'tank', options: { capacity: 10 } }
    ],
    connections: [
      [ { name: 'input_1' }, { name: 'tank', type: 'input' } ],
      [ { name: 'input_2' }, { name: 'tank', type: 'input' } ],
      [ { name: 'tank', type: 'output' }, { name: 'output_1' } ],
      [ { name: 'tank', type: 'output' }, { name: 'output_2' } ],
    ]
  } as DeviceOptions
}

describe('Engine', () => {
  it('Can create an AND gate device and display the correct output', () => {
    const engine = new Engine()
    engine.createDevice(AND_DEVICE_CONFIG)
    const device = engine.getDevice(AND_DEVICE)

    // default state is on
    let io = engine.iterateDevice(AND_DEVICE, 1)
    console.log(io)
    expect(io.outputs['output'].flow).toBe(1)
    expect(io.inputs['src_main'].flow).toBe(1)
    expect(io.inputs['src_ctrl'].flow).toBe(0.1)

    // output will be zero if main is off.
    device.inputs['src_main'].outFlow = 0
    io = engine.iterateDevice(AND_DEVICE, 1)
    expect(io.outputs['output'].flow).toBe(0)
    expect(io.inputs['src_main'].flow).toBe(0)
    expect(io.inputs['src_ctrl'].flow).toBe(0.1)

    // output will be zero if main and control are off.
    device.inputs['src_ctrl'].outFlow = 0
    io = engine.iterateDevice(AND_DEVICE, 1)
    expect(io.outputs['output'].flow).toBe(0)
    expect(io.inputs['src_main'].flow).toBe(0)
    expect(io.inputs['src_ctrl'].flow).toBe(0)

    // output will be zero if main is on and control is off.
    device.inputs['src_main'].outFlow = 1
    io = engine.iterateDevice(AND_DEVICE, 1)
    expect(io.outputs['output'].flow).toBe(0)
    expect(io.inputs['src_main'].flow).toBe(0)
    expect(io.inputs['src_ctrl'].flow).toBe(0)
  })

  it('Can create a NOR gate device and display the correct output', () => {
    const engine = new Engine()
    engine.createDevice(NOR_DEVICE_CONFIG)
    const device = engine.getDevice(NOR_DEVICE)


    // NOR 1 1 = 0
    let io = engine.iterateDevice(NOR_DEVICE, 1)
    expect(io.outputs['output'].flow).toBe(0)
    expect(io.inputs['src_main'].flow).toBe(0)

    // NOR 0 1 = 0
    device.inputs['src_ctrl_1'].outFlow = 0
    io = engine.iterateDevice(NOR_DEVICE, 1)
    expect(io.outputs['output'].flow).toBe(0)
    expect(io.inputs['src_main'].flow).toBe(0)

    // NOR 0 0 = 1
    device.inputs['src_ctrl_2'].outFlow = 0
    io = engine.iterateDevice(NOR_DEVICE, 1)
    expect(io.outputs['output'].flow).toBe(1)
    expect(io.inputs['src_main'].flow).toBe(1)
  })

  it('Can create a buffer device and display the correct output', () => {
    const engine = new Engine()
    engine.createDevice(BUFFER_DEVICE_CONFIG)
    const device = engine.getDevice(BUFFER_DEVICE)

    let io = engine.iterateDevice(BUFFER_DEVICE, 3)
    expect((device.nodes['tank'] as Tank).amount).toBe(3)
    expect(io.outputs['output'].flow).toBe(0)
    expect(io.inputs['src_main'].flow).toBe(3)

    device.inputs['src_ctrl'].outFlow = 0
    io = engine.iterateDevice(BUFFER_DEVICE, 1)
    expect((device.nodes['tank'] as Tank).amount).toBe(2)
    expect(io.outputs['output'].flow).toBe(2)
    expect(io.inputs['src_main'].flow).toBe(1)
  })

  it('Can create a simple tank with 1 input and output', () => {
    const engine = new Engine()
    engine.createDevice(SIMPLE_TANK_DEVICE_CONFIG)
    const device = engine.getDevice(SIMPLE_TANK_DEVICE)

    let io = engine.iterateDevice(SIMPLE_TANK_DEVICE, 1)
    expect(io.outputs['output'].flow).toBe(1)
    expect(io.inputs['input'].flow).toBe(2)
    expect((device.nodes['tank'] as Tank).amount).toBe(1)

    device.inputs['input'].outFlow = 0
    io = engine.iterateDevice(SIMPLE_TANK_DEVICE, 1)
    expect(io.outputs['output'].flow).toBe(1)
    expect(io.inputs['input'].flow).toBe(0)
    expect((device.nodes['tank'] as Tank).amount).toBe(0)
  })

  describe('Complex Tank', () => {
    it('Can create a complex tank with multiple inputs and outputs', () => {
      const engine = new Engine()
      engine.createDevice(COMPLEX_TANK_DEVICE_CONFIG)
      const device = engine.getDevice(COMPLEX_TANK_DEVICE)

      let io = engine.iterateDevice(COMPLEX_TANK_DEVICE, 10)
      expect(io.outputs['output_1'].flow).toBe(10)
      expect(io.outputs['output_2'].flow).toBe(10)
      expect(io.inputs['input_1'].flow).toBe(10)
      expect(io.inputs['input_2'].flow).toBe(10)
      expect((device.nodes['tank'] as Tank).amount).toBe(0)
    })
  })
})