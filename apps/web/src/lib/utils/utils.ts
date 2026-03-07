import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * @packageDocumentation
 * Kliens oldali segéd függvények, típusok
 */

/**
 * Tailwind CSS osztályok kombinálása és optimalizálása
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// Svelte komponens típus segédprogramok
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

/**
 * A bemeneti string első karakterét nagybetűsre alakítja.
 * @param input Átalakítandó string.
 * @returns Átalakított string.
 */
export function capitalizeFirstLetter(input: string): string {
	if (input.length === 0) return input;
	return input.charAt(0).toUpperCase() + input.slice(1);
}
