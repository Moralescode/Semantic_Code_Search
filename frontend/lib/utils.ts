import { type ClassValue, clsx } from 'clsx';

/**
 * Utility function to merge Tailwind CSS classes conditionally.
 * This is a lightweight alternative to `clsx` + `tailwind-merge`.
 * For simplicity, we just filter falsy values and join.
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

