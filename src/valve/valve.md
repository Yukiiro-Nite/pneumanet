# Valve
A valve controls the flow of fluid from one place to another.
A valve can be connected to tanks or valves in a device, which determines where fluid flow from and to.
A valve has a control, which can be connected to a fluid source (valve output, tank, or source) or can be controlled in other ways (user input, game input (sensors)).

## Note
- I'm not sure how much logic i'm going to put in valve vs device.

## Fields

### bandwidth: number
The maximum amount of fluid transfered per second.


## Methods

### constructor({ bandwidth: number, control: function })
Sets the bandwidth and control function of the valve

### control(): number
The control function returns a number between 0 and 1 that determines the usage of the bandwidth.

### transfer(): number
The amount that can transfer through the valve (`control() * bandwidth`). 