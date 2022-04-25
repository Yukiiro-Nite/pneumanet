import { Sink, SinkOptions } from '../sink/sink';
import { Source, SourceOptions } from '../source/source';
import { Valve, ValveOptions } from '../valve/valve';
import { Tank, TankOptions } from '../tank/tank';
import { Connectable } from '../connectable/connectable';
import { Part } from '../part/part';

const SOURCE_TYPE = "src";
const SINK_TYPE = "snk";
const VALVE_TYPE = "valve";
const TANK_TYPE = "tank";

const typeMap = {
  [SOURCE_TYPE]: (options: SourceOptions) => new Source(options),
  [SINK_TYPE]: (options: SinkOptions) => new Sink(options),
  [VALVE_TYPE]: (options: ValveOptions) => new Valve(options),
  [TANK_TYPE]: (options: TankOptions) => new Tank(options),
} as {
  [SOURCE_TYPE]: (options: SourceOptions) => Source;
  [SINK_TYPE]: (options: SinkOptions) => Sink;
  [VALVE_TYPE]: (options: ValveOptions) => Valve;
  [TANK_TYPE]: (options: TankOptions) => Tank;
}

export interface NodeConfig {
  type: 'src' | 'snk' | 'valve' | 'tank',
  name: string,
  options: SourceOptions | SinkOptions | ValveOptions | TankOptions
}

export interface ConnectionConfig {
  name: string;
  port?: string;
  type?: 'input' | 'output'
}

export interface DeviceOptions {
  nodes: NodeConfig[],
  connections: [ConnectionConfig, ConnectionConfig][]
}

export interface CreatedNode {
  type: string;
  name: string;
  node?: Source | Sink | Valve | Tank;
}

export class Device {
  public nodes: Record<string, Source | Sink | Valve | Tank> = {}
  public inputs: Record<string, Source> = {}
  public outputs: Record<string, Sink> = {}

  constructor({ nodes, connections }: DeviceOptions = { nodes: [], connections: [] }) {
    this.populateNodes(nodes)
    this.createConnections(connections)
  }

  populateNodes(nodes: NodeConfig[]) {
    nodes.forEach(nodeConfig => {
      const node = this.createNode(nodeConfig)
      if (node) {
        this.addNode(node)
      }
    })
  }

  createNode({ type, name, options }: NodeConfig): CreatedNode | undefined {
    if (!type || !name) return;

    return { type, name, node: this.createNodeFromType({ type, name, options }) }
  }

  createNodeFromType({ type, name, options }: NodeConfig) {
    const typeConstructor = typeMap[type]

    if (typeConstructor && typeConstructor instanceof Function) {
      options.name = name
      return typeConstructor(options)
    }
  }

  addNode({ type, name, node }: CreatedNode) {
    if (!type || !name || !node) return;

    this.removeNode(name)
    
    if (type === SOURCE_TYPE) {
      this.inputs[name] = node as Source
    } else if (type === SINK_TYPE) {
      this.outputs[name] = node as Sink
    }

    this.nodes[name] = node
  }

  removeNode(name: string) {
    const existingNode = this.nodes[name]

    if (existingNode) {
      existingNode.disconnectAll()
      delete this.nodes[name]
      delete this.inputs[name]
      delete this.outputs[name]
    }
  }

  createConnections(connections: [ConnectionConfig, ConnectionConfig][]) {
    connections.forEach(([a, b]) => {
      this.createConnection(a, b)
    })
  }

  createConnection(a: ConnectionConfig, b: ConnectionConfig) {
    const nodeA = this.nodes[a.name]
    const nodeB = this.nodes[b.name]

    if(nodeA && nodeB) {
      const connectableA = this.getConnectionNode(nodeA, a)
      const connectableB = this.getConnectionNode(nodeB, b)

      if (connectableA && connectableB) {
        connectableA.connect(connectableB)
      }
    }
  }

  public getConnectionNode (node: Source | Sink | Valve | Tank, details: ConnectionConfig): Source | Sink | undefined {
    if (node instanceof Source || node instanceof Sink) return node;
    if (node instanceof Valve && details.port) {
      const port = details.port as 'input' | 'control' | 'output'
      return node[port] as Source | Sink
    }
    if (node instanceof Tank) {
      return node.addPort(details)
    }
  }
}