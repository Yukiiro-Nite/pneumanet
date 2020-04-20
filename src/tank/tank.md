# Tank
A tank stores a fluid.
A tank can be connected to valves in a device, which determine where the fluid can flow from and to.

## Fields

### capacity: number
How much fluid the tank can hold

### amount: number
How much fluid is currently in the tank


## Methods

### getFree(): number
Returns the amount of space available to fill (`capacity - amount`).

### fillRatio(): number
Returns the fill ratio (`amount / capacity`) of the tank.

### isEmpty(): boolean
Returns true if empty (`amount === 0`)

### add(amount: number): number
Attempts to add the amount to the tank, returns amount left over.

### take(amount: number): number
Attempts to take the amount from the tank, returns amount taken.