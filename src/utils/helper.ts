export function debounce<T extends (...args: any[]) => void>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timer: NodeJS.Timeout | null = null;
    return function (...args: Parameters<T>) {
      if (timer) clearTimeout(timer); // Reset timer on each call
      timer = setTimeout(() => {
        func(...args);
      }, delay);
    };
  }
