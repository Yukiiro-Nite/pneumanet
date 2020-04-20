const Valve = require('./valve.js')

describe('Valve', () => {
  let controlFn, controlValue, valve
  beforeEach(() => {
    controlValue = 0
    controlFn = jest.fn(() => controlValue)
    valve = new Valve({ bandwidth: 10, control: controlFn })
  })

  describe('.control', () => {
    it('Calls the control function passed in the constructor', () => {
      valve.control()
      expect(controlFn).toBeCalled()
    })
  })

  describe('.transfer', () => {
    it('returns the bandwidth multiplied by the control function', () => {
      expect(valve.transfer()).toBe(0)
      controlValue = 0.5
      expect(valve.transfer()).toBe(5)
      controlValue = 1
      expect(valve.transfer()).toBe(10)
    })

    it('clamps the control output between 0 and 1', () => {
      controlValue = -1
      expect(valve.transfer()).toBe(0)
      controlValue = 2
      expect(valve.transfer()).toBe(10)
    })
  })
})