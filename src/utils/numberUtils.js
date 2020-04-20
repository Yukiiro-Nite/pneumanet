function clamp(value, [min, max]) {
  if(min > max) {
    return clamp(value, [max, min])
  }

  return Math.min(max, Math.max(min, value))
}

module.exports =  {
  clamp
}