import HttpClient from "../http";
import type {
	TextDatasetGenerationRequest,
	SyntheticTextDatasetResponse,
} from "../types";

export class TextClient {
	constructor(private http: HttpClient) {}

	async generate(request: TextDatasetGenerationRequest): Promise<SyntheticTextDatasetResponse> {
		return await this.http.request("POST", "/api/v1/text/generate", request);
	}

	async info(): Promise<Record<string, unknown>> {
		return await this.http.request("GET", "/api/v1/text/info");
	}

	async validate(request: TextDatasetGenerationRequest): Promise<Record<string, unknown>> {
		return await this.http.request("POST", "/api/v1/text/validate", request);
	}

	async examples(): Promise<Record<string, unknown>> {
		return await this.http.request("GET", "/api/v1/text/examples");
	}
}

