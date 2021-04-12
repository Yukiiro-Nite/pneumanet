const Sink = require("../sink/sink")
const Source = require("../source/source")
const Valve = require("../valve/valve")
const Tank = require("../tank/tank")

const SOURCE_TYPE = "src";
const SINK_TYPE = "snk";
const VALVE_TYPE = "valve";
const TANK_TYPE = "tank";

const typeMap = {
  [SOURCE_TYPE]: (options) => new Source(options),
  [SINK_TYPE]: (options) => new Sink(options),
  [VALVE_TYPE]: (options) => new Valve(options),
  [TANK_TYPE]: (options) => new Tank(options),
}

class Device {
  nodes = {}
  inputs = {}
  outputs = {}

  constructor({ nodes = [], connections = []} = {}) {
    this.populateNodes(nodes)
    this.createConnections(connections)
  }

  populateNodes(nodes) {
    nodes.forEach(nodeConfig => {
      const node = this.createNode(nodeConfig)
      if (node) {
        this.addNode(node)
      }
    })
  }

  createNode({ type, name, options } = {}) {
    if (!type || !name) return;

    return { type, name, node: this.createNodeFromType(type, name, options) }
  }

  createNodeFromType(type, name, options) {
    const typeConstructor = typeMap[type]

    if (typeConstructor && typeConstructor instanceof Function) {
      options.name = name
      return typeConstructor(options)
    }
  }

  addNode({ type, name, node } = {}) {
    if (!type || !name || !node) return;

    this.removeNode(name)
    
    if (type === SOURCE_TYPE) {
      this.inputs[name] = node
    } else if (type === SINK_TYPE) {
      this.outputs[name] = node
    }

    this.nodes[name] = node
  }

  removeNode(name) {
    const existingNode = this.nodes[name]

    if (existingNode) {
      existingNode.disconnectAll()
      delete this.nodes[name]
      delete this.inputs[name]
      delete this.outputs[name]
    }
  }

  createConnections(connections) {
    connections.forEach(([a, b]) => {
      this.createConnection(a, b)
    })
  }

  createConnection(a, b) {
    const nodeA = this.nodes[a.name]
    const nodeB = this.nodes[b.name]

    if(nodeA && nodeB) {
      const conA = { node: nodeA, details: a }
      const conB = { node: nodeB, details: b }
      const connectableA = this.getConnectionNode(conA)
      const connectableB = this.getConnectionNode(conB)

      if (connectableA && connectableB) {
        connectableA.connect(connectableB)
      }
    }
  }

  getConnectionNode({ node, details } = {}) {
    if (node instanceof Source || node instanceof Sink) return node;
    if (node instanceof Valve) {
      return node[details.port]
    }
    if (node instanceof Tank) {
      return node.addPort(details.port)
    }
  }
}

module.exports = Device