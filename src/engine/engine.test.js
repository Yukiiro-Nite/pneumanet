const Engine = require('./engine')

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
  }
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
  }
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
      [ { name: 'src_main' }, { name: 'tank', port: { type: 'input' } } ],
      [ { name: 'tank', port: { type: 'output' } }, { name: 'valve', port: 'input' } ],
      [ { name: 'valve', port: 'output' }, { name: 'output' } ],
      [ { name: 'src_ctrl' }, { name: 'valve', port: 'control' } ]
    ]
  }
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
    expect(device.nodes['tank'].amount).toBe(3)
    expect(io.outputs['output'].flow).toBe(0)
    expect(io.inputs['src_main'].flow).toBe(3)

    device.inputs['src_ctrl'].outFlow = 0
    io = engine.iterateDevice(BUFFER_DEVICE, 1)
    expect(device.nodes['tank'].amount).toBe(2)
    expect(io.outputs['output'].flow).toBe(2)
    expect(io.inputs['src_main'].flow).toBe(2)
  })
})