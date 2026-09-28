import { act, fireEvent } from "@testing-library/react"

export async function click(element: HTMLElement) {
  await act(async () => fireEvent.click(element))
}

export function setVisibility(state: DocumentVisibilityState) {
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    get: () => state,
  })
  act(() => {
    document.dispatchEvent(new Event("visibilitychange"))
  })
}
