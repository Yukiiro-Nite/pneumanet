const Tank = require('./tank.js')

describe('Tank', () => {
  let tank
  beforeEach(() => {
    tank = new Tank({ capacity: 10, amount: 5 })
  })

  describe('.add', () => {
    it('Adds amount to the amount in the tank', () => {
      tank.add(3)
      expect(tank.amount).toBe(8)
    })

    it('Returns the amount left over from adding', () => {
      expect(tank.add(3)).toBe(0)
      expect(tank.add(3)).toBe(1)
      expect(tank.add(5)).toBe(5)
    })

    it('Throws an error if one tries to add a negative number', () => {
      expect (() => {
        tank.add(-5)
      }).toThrowError(new Error('Can not add a negative amount to tank, use take'))
    })
  })

  describe('.take', () => {
    it('Takes amount from the amount in the tank', () => {
      tank.take(3)
      expect(tank.amount).toBe(2)
    })

    it('Returns the amount taken from the tank', () => {
      expect(tank.take(3)).toBe(3)
      expect(tank.take(3)).toBe(2)
      expect(tank.take(3)).toBe(0)
    })

    it('Throws an error if one tries to take a negative number', () => {
      expect (() => {
        tank.take(-5)
      }).toThrowError(new Error('Can not take a negative amount from tank, use add'))
    })
  })

  describe('.getFree', () => {
    it('returns amount remaining in tank', () => {
      expect(tank.getFree()).toBe(5)
      tank.add(3)
      expect(tank.getFree()).toBe(2)
      tank.take(7)
      expect(tank.getFree()).toBe(9)
    })
  })

  describe('.fillRatio', () => {
    it('returns amount / capacity', () => {
      expect(tank.fillRatio()).toBe(0.5)
      tank.add(3)
      expect(tank.fillRatio()).toBe(0.8)
      tank.take(7)
      expect(tank.fillRatio()).toBe(0.1)
    })
  })

  describe('.isEmpty', () => {
    it('returns whether the tank is empty', () => {
      expect(tank.isEmpty()).toBe(false)
      tank.take(tank.amount)
      expect(tank.isEmpty()).toBe(true)
    })
  })
})