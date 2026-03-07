/**
 * Remote function segédeszközök - timeout és szerver elérhetőség kezelés.
 *
 * Megoldja azt a problémát, hogy ha a szerver leáll miközben a kliens fut,
 * a remote function hívások végtelen ideig lógnak és lefagyasztják a UI-t.
 */

const DEFAULT_TIMEOUT = 10_000; // 10 másodperc

export class RemoteTimeoutError extends Error {
	constructor(timeoutMs: number) {
		super(`A szerver nem válaszolt ${timeoutMs / 1000} másodpercen belül`);
		this.name = 'RemoteTimeoutError';
	}
}

/**
 * Remote function hívás timeout-tal.
 * Ha a szerver nem válaszol az adott időn belül, RemoteTimeoutError-t dob.
 *
 * @example
 * ```ts
 * const result = await withTimeout(getUserApps({}), 8000);
 * ```
 */
export async function withTimeout<T>(
	promise: Promise<T>,
	timeoutMs: number = DEFAULT_TIMEOUT
): Promise<T> {
	let timeoutId: ReturnType<typeof setTimeout>;

	const timeoutPromise = new Promise<never>((_, reject) => {
		timeoutId = setTimeout(() => {
			reject(new RemoteTimeoutError(timeoutMs));
		}, timeoutMs);
	});

	try {
		const result = await Promise.race([promise, timeoutPromise]);
		clearTimeout(timeoutId!);
		return result;
	} catch (error) {
		clearTimeout(timeoutId!);
		throw error;
	}
}
