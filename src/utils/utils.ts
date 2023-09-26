import { readdirSync, statSync } from 'fs';

export function fi<T>(): T {
	return undefined as T;
}

export function resolve(path: string): string {
	const parts = path.split('/');

	return parts
		.reduce<string[]>((newParts, segment) => {
			if (segment === '..') {
				if (newParts.length === 0) {
					throw new Error('beyond svelte');
				} else {
					return newParts.slice(0, -1);
				}
			} else if (segment === '.' || segment === '') {
				return newParts;
			} else {
				return [...newParts, segment];
			}
		}, [])
		.join('/');
}

export function walkDir(path: string, fn: (file: string) => void): void {
	const dir = readdirSync(path);

	dir.forEach((entry) => {
		if (statSync(`${path}/${entry}`).isDirectory()) {
			walkDir(`${path}/${entry}`, fn);
		} else {
			fn(`${path}/${entry}`);
		}
	});
}

