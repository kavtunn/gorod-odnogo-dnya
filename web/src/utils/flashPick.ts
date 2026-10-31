// Короткая анимация нажатия, потом колбэк
export function flashPick(
  button: HTMLElement,
  afterMs: number,
  then: () => void,
): void {
  button.classList.remove('pick-flash')
  void button.offsetWidth
  button.classList.add('pick-flash')

  if (afterMs <= 0) {
    then()
    return
  }

  window.setTimeout(then, afterMs)
}
