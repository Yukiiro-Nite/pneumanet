class Tank {
  constructor({ capacity, amount }) {
    this.capacity = capacity
    this.amount = amount
  }

  add(amount) {
    if(amount < 0) {
      throw new Error('Can not add a negative amount to tank, use take')
    }

    let newTotal = this.amount + amount
    let overflow = 0

    if(newTotal > this.capacity) {
      overflow = newTotal - this.capacity
      newTotal = this.capacity
    }

    this.amount = newTotal

    return overflow
  }

  take(amount) {
    if(amount < 0) {
      throw new Error('Can not take a negative amount from tank, use add')
    }

    let newTotal = this.amount - amount
    let taken = amount

    if(newTotal < 0) {
      taken = amount + newTotal
      newTotal = 0
    }

    this.amount = newTotal

    return taken
  }

  getFree() {
    return this.capacity - this.amount
  }

  fillRatio() {
    return this.amount / this.capacity
  }

  isEmpty() {
    return this.amount === 0
  }
}

module.exports = Tank