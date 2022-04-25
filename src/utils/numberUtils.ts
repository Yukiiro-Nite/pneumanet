export function clamp(value: number, [min, max]: [number, number]): number {
  if(min > max) {
    return clamp(value, [max, min])
  }

  return Math.min(max, Math.max(min, value))
}

export function transform(value: number, fromMin: number, fromMax: number, toMin: number, toMax: number, clampOutput = false): number {
  const fromRange = fromMax - fromMin;
  const toRange = toMax - toMin;
  const scale = toRange / fromRange;
  const transformedValue = (value - fromMin) * scale + toMin;

  return clampOutput
    ? clamp(transformedValue, [toMin, toMax])
    : transformedValue;
}

let lastId: number
export function genId(): string {
  let next = Date.now()
  if (next <= lastId) {
    lastId++
  } else {
    lastId = next
  }

  return lastId.toString(36)
}