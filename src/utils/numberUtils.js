function clamp(value, [min, max]) {
  if(min > max) {
    return clamp(value, [max, min])
  }

  return Math.min(max, Math.max(min, value))
}

function transform(value, fromMin, fromMax, toMin, toMax, clampOutput = false) {
  const fromRange = fromMax - fromMin;
  const toRange = toMax - toMin;
  const scale = toRange / fromRange;
  const transformedValue = (value - fromMin) * scale + toMin;

  return clampOutput
    ? clamp(transformedValue, [toMin, toMax])
    : transformedValue;
}

let lastId
function genId() {
  let next = Date.now()
  if (next <= lastId) {
    lastId++
  } else {
    lastId = next
  }

  return lastId.toString(36)
}

module.exports =  {
  clamp,
  transform,
  genId
}