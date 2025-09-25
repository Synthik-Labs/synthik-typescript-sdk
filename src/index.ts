import HttpClient, { HttpClientOptions } from "./http";
import { TabularClient } from "./endpoints/tabular";
import { TextClient } from "./endpoints/text";
export * from "./types";

// Hard-coded base URL; not user-configurable
const BASE_URL = "https://moral-danice-poeai-c2f6213c.koyeb.app";

export interface SynthikClientOptions {
	apiKey?: string;
	timeoutMs?: number;
	defaultHeaders?: Record<string, string>;
	retries?: number;
	retryBackoffMs?: number;
}

export class SynthikClient {
	readonly http: HttpClient;
	readonly tabular: TabularClient;
	readonly text: TextClient;

	constructor(opts: SynthikClientOptions = {}) {
		const baseUrl = BASE_URL;
		this.http = new HttpClient({
			baseUrl,
			apiKey: opts.apiKey,
			timeoutMs: opts.timeoutMs,
			defaultHeaders: opts.defaultHeaders,
			retries: opts.retries,
			retryBackoffMs: opts.retryBackoffMs,
		} as HttpClientOptions);
		this.tabular = new TabularClient(this.http);
		this.text = new TextClient(this.http);
	}
}

export default SynthikClient;

