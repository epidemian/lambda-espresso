function $(selector: string): Element
function $<T extends Element>(selector: string, elementCtor: { new (): T }): T
// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
function $(selector: string, elementCtor = Element) {
  const element = document.querySelector(selector)
  if (!(element instanceof elementCtor)) {
    throw TypeError(
      `expected '${selector}' to find an ${elementCtor.name} but got ${element}`
    )
  }
  return element
}
export { $ }

// Similar to jQuery.fn.on(type, selector, handler)
export const delegate = (
  eventType: string,
  element: Element,
  selector: string,
  handler: (el: Element, ev: Event) => void
) => {
  element.addEventListener(eventType, event => {
    if (event.target instanceof Element) {
      const closest = event.target.closest(selector)
      if (closest && element.contains(closest)) {
        handler(closest, event)
      }
    }
  })
}

export const nodeIndex = (element: Element): number => {
  return Array.prototype.indexOf.call(element.parentNode?.childNodes, element)
}
