import EventEmitter from 'events';
import { Part } from '../part/part';
import { Sink } from '../sink/sink';
import { Source } from '../source/source';

export class Connectable extends EventEmitter {
  private _input?: Source;
  private _output?: Sink;
  public parent?: Part;
  public error: string;

  set input(value: Source | undefined) {
    const oldVal = this._input
    this._input = value
    if (oldVal !== this._input) {
      this.emit('inputChanged', this._input, oldVal)
    }
  }

  get input(): Source | undefined {
    return this._input
  }

  set output(value: Sink | undefined) {
    const oldVal = this._output
    this._output = value
    if (oldVal !== this._output) {
      this.emit('outputChanged', this._output, oldVal)
    }
  }

  get output(): Sink | undefined {
    return this._output
  }

  constructor({ parent }: { parent?: Part } = {}) {
    super()
    this.parent = parent
    this.error = ""
  }

  connect(other?: Connectable) {
      this.error = "Can not use connectable.connect directly."
      return false
  }

  disconnectAll()
  {
    if (this.output) {
      this.output.input = undefined
    }

    if (this.input) {
      this.input.output = undefined
    }
  }
}