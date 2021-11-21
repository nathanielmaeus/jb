export function debounce<T extends unknown[], U>(
  callback: (...args: T) => U,
  wait: number,
) {
  let timer: number;

  return (...args: T): void => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => callback(...args), wait);
  };
}
