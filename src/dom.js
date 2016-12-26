exports.$ = document.querySelector.bind(document)

// Similar to jQuery.fn.on(type, selector, handler)
exports.delegate = (eventType, element, selector, handler) => {
  element.addEventListener(eventType, event => {
    let element = event.target
    // Try to find matching element bubbling up from event target.
    while (element !== event.currentTarget) {
      if (element.matches(selector)) {
        handler(element, event)
        break
      }
      element = element.parentNode
    }
  })
}

// Add an event listener that is only called once.
exports.once = (eventType, element, handler) => {
  let onceListener = event => {
    handler(event)
    element.removeEventListener(eventType, onceListener)
  }
  element.addEventListener(eventType, onceListener)
}

exports.nodeIndex = element => {
  return Array.prototype.indexOf.call(element.parentNode.childNodes, element)
}
