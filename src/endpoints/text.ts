import HttpClient from "../http";
import type {
	TextDatasetGenerationRequest,
	SyntheticTextDatasetResponse,
} from "../types";

export class TextClient {
	constructor(private http: HttpClient, private apiVersion: 'v1' | 'v2', warn: boolean) {
		if (warn && apiVersion === 'v1') {
			console.warn('[Synthik] Text v1 endpoints are deprecated and will sunset 2025-09-26. Use apiVersion="v2".');
		}
	}

	v1Generate(request: TextDatasetGenerationRequest) {
		console.warn('[Synthik] v1Generate() deprecated; use v2Generate()');
		return this.http.request("POST", `/api/v1/text/generate`, request);
	}

	v2Generate(request: TextDatasetGenerationRequest) {
		return this.http.request("POST", `/api/v2/text/generate`, request);
	}

	async generate(request: TextDatasetGenerationRequest): Promise<SyntheticTextDatasetResponse> {
		return (this.apiVersion === 'v1' ? this.v1Generate(request) : this.v2Generate(request)) as Promise<SyntheticTextDatasetResponse>;
	}

	async info(): Promise<Record<string, unknown>> {
		return await this.http.request("GET", `/api/${this.apiVersion}/text/info`);
	}

	async validate(request: TextDatasetGenerationRequest): Promise<Record<string, unknown>> {
		return await this.http.request("POST", `/api/${this.apiVersion}/text/validate`, request);
	}

	async examples(): Promise<Record<string, unknown>> {
		return await this.http.request("GET", `/api/${this.apiVersion}/text/examples`);
	}
}

