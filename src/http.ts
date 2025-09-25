/*
 HTTP client with simple retries, timeouts, and JSON handling.
 Works in Node 18+ and modern browsers (uses global fetch).
*/

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface HttpClientOptions {
	baseUrl: string;
	apiKey?: string; // Optional if server requires auth later
	timeoutMs?: number;
	defaultHeaders?: Record<string, string>;
	retries?: number;
	retryBackoffMs?: number;
}

export class HttpError extends Error {
	constructor(
		public status: number,
		public statusText: string,
		public body?: any
	) {
		super(`HTTP ${status} ${statusText}`);
	}
}

export class HttpClient {
	private baseUrl: string;
	private apiKey?: string;
	private timeoutMs: number;
	private defaultHeaders: Record<string, string>;
	private retries: number;
	private retryBackoffMs: number;

	constructor(opts: HttpClientOptions) {
		this.baseUrl = opts.baseUrl.replace(/\/$/, "");
		this.apiKey = opts.apiKey;
		this.timeoutMs = opts.timeoutMs ?? 60_000;
		this.defaultHeaders = {
			"Content-Type": "application/json",
			...(opts.defaultHeaders || {}),
		};
		this.retries = Math.max(0, opts.retries ?? 2);
		this.retryBackoffMs = Math.max(0, opts.retryBackoffMs ?? 500);
	}

	async request<T>(
		method: HttpMethod,
		path: string,
		body?: any,
		query?: Record<string, string | number | boolean | undefined>,
		headers?: Record<string, string>
	): Promise<T> {
		const url = new URL(this.baseUrl + (path.startsWith("/") ? path : `/${path}`));
		if (query) {
			Object.entries(query).forEach(([k, v]) => {
				if (v !== undefined && v !== null) url.searchParams.append(k, String(v));
			});
		}

		const finalHeaders: Record<string, string> = { ...this.defaultHeaders, ...(headers || {}) };
		if (this.apiKey && !finalHeaders.Authorization) {
			finalHeaders.Authorization = `Bearer ${this.apiKey}`;
		}

		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

		const exec = async (): Promise<Response> => {
			return fetch(url.toString(), {
				method,
				headers: finalHeaders,
				body: body !== undefined ? JSON.stringify(body) : undefined,
				signal: controller.signal,
			});
		};

		let attempt = 0;
		let lastErr: any;
		while (attempt <= this.retries) {
			try {
				const res = await exec();
				clearTimeout(timeout);
				if (!res.ok) {
					let errBody: any;
					try { errBody = await res.json(); } catch { errBody = await res.text(); }
					throw new HttpError(res.status, res.statusText, errBody);
				}
				const contentType = res.headers.get("content-type") || "";
						if (contentType.includes("application/json")) {
							return (await res.json()) as T;
						}
						// For non-JSON responses, return the raw ArrayBuffer casted to unknown first
						return (await res.arrayBuffer()) as unknown as T;
			} catch (err) {
				lastErr = err;
				// retry on fetch/network/5xx
				const isAbort = err instanceof DOMException && err.name === "AbortError";
				const isHttp = err instanceof HttpError;
				const retryable = isAbort || (isHttp && err.status >= 500);
				if (!retryable || attempt === this.retries) break;
				const backoff = this.retryBackoffMs * Math.pow(2, attempt);
				await new Promise((r) => setTimeout(r, backoff));
				attempt += 1;
			}
		}
		throw lastErr;
	}
}

export default HttpClient;

