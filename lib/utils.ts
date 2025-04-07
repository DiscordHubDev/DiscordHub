import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Simplify<T> = {
  [KeyType in keyof T]: T[KeyType];
} & {};

export async function fetchUserInfo(id: string) {
  const res = await fetch(`https://dchub.mantou.dev/member/${id}`);

  if (!res.ok) {
    throw new Error(
      `Failed to fetch user info for ID ${id}: ${res.statusText}`,
    );
  }

  const data = await res.json();
  return data;
}
