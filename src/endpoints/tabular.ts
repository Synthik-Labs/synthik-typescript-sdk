import HttpClient from "../http";
import type {
	DatasetGenerationRequest,
	GenerationStrategy,
	TabularExportFormat,
	TabularGenerateResponse,
	ColumnDescription,
} from "../types";

export class TabularClient {
	constructor(private http: HttpClient) {}

	async generate(
		req: DatasetGenerationRequest,
		opts?: { strategy?: GenerationStrategy; format?: TabularExportFormat; batch_size?: number }
	): Promise<TabularGenerateResponse | ArrayBuffer> {
		const strategy = opts?.strategy ?? "adaptive_flow";
		const format = opts?.format ?? "json";
		const batch_size = opts?.batch_size ?? 256;

		return await this.http.request(
			"POST",
			"/api/v1/tabular/generate",
			req,
			{ strategy, format, batch_size }
		);
	}

	async strategies(): Promise<{ strategies: Array<Record<string, unknown>> }> {
		return await this.http.request("GET", "/api/v1/tabular/strategies");
	}

	async analyze(request: DatasetGenerationRequest): Promise<Record<string, unknown>> {
		return await this.http.request("POST", "/api/v1/tabular/analyze", request);
	}

	async validate(body: { data: Record<string, unknown>[]; schema: { columns: ColumnDescription[] } }): Promise<Record<string, unknown>> {
		return await this.http.request("POST", "/api/v1/tabular/validate", body);
	}

	async status(): Promise<Record<string, unknown>> {
		return await this.http.request("GET", "/api/v1/tabular/status");
	}
}

