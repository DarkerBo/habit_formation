/**
 * @description 节流。leading设置是否立即执行第一次回调，trailing设置是否执行最后一次回调
 * @param {Function} func
 * @param {number} [wait=0]
 * @param {Object{}} [options={leading: true,trailing: true}]
 * @returns {Function}
 */
export default function(func, wait = 0, option) {
  const options = { leading: true, trailing: true, ...option }
  let timeout, result, _this, _arguments
  let previous = 0

  const later = function() {
    previous = options.leading === false ? 0 : new Date().getTime()
    timeout = null
    result = func.apply(_this, _arguments)
    timeout || (_this = _arguments = null)
  }

  const throttled = function() {
    const now = new Date().getTime()

    if (!previous && options.leading === false) previous = now

    let remaining = wait - (now - previous)
    _this = this
    _arguments = arguments

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }

      previous = now
      result = func.apply(_this, _arguments)
      timeout || (_this = _arguments = null)
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining)
    }
    return result
  }

  throttled.cancel = function() {
    clearTimeout(timeout)
    previous = 0
    timeout = null
  }

  return throttled
}
