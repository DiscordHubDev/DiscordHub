import { clsx, type ClassValue } from "clsx";
import { Palette } from "color-thief-node";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Simplify<T> = {
  [KeyType in keyof T]: T[KeyType];
} & {};

export function rgbToHex([r, g, b]: Palette): string {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}
