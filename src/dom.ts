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
    let element = event.target as Element
    // Try to find matching element bubbling up from event target.
    while (element !== event.currentTarget) {
      if (element.matches(selector)) {
        handler(element, event)
        break
      }
      element = element.parentNode as Element
    }
  })
}

export const nodeIndex = (element: Element): number => {
  return Array.prototype.indexOf.call(element.parentNode!.childNodes, element)
}
