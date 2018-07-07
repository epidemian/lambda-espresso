export const $ = <T extends Element>(s: string) =>
  document.querySelector(s) as T

// Similar to jQuery.fn.on(type, selector, handler)
export const delegate = (
  eventType: string,
  element: Element,
  selector: string,
  handler: (el: Element, ev: Event) => void
) => {
  element.addEventListener(eventType, event => {
    if (event.target instanceof Element) {
      let closest = event.target.closest(selector)
      if (closest && element.contains(closest)) handler(closest, event)
    }
  })
}

export const nodeIndex = (element: Element): number => {
  return Array.prototype.indexOf.call(element.parentNode!.childNodes, element)
}
