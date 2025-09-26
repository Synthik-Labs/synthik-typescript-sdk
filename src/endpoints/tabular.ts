import HttpClient from "../http";
import type {
	DatasetGenerationRequest,
	GenerationStrategy,
	TabularExportFormat,
	TabularGenerateResponse,
	ColumnDescription,
} from "../types";

export class TabularClient {
	constructor(private http: HttpClient, private apiVersion: 'v1' | 'v2', warn: boolean) {
		if (warn && apiVersion === 'v1') {
			console.warn('[Synthik] Tabular v1 endpoints are deprecated and will sunset 2025-09-26. Use apiVersion="v2".');
		}
	}

	v1Generate(req: DatasetGenerationRequest, opts?: { strategy?: GenerationStrategy; format?: TabularExportFormat; batch_size?: number }) {
		console.warn('[Synthik] v1Generate() deprecated; migrate to v2Generate() soon.');
		return this._generate('v1', req, opts);
	}

	v2Generate(req: DatasetGenerationRequest, opts?: { strategy?: GenerationStrategy; format?: TabularExportFormat; batch_size?: number }) {
		return this._generate('v2', req, opts);
	}

	private _generate(version: 'v1' | 'v2', req: DatasetGenerationRequest, opts?: { strategy?: GenerationStrategy; format?: TabularExportFormat; batch_size?: number }) {
		const strategy = opts?.strategy ?? 'adaptive_flow';
		const format = opts?.format ?? 'json';
		const batch_size = opts?.batch_size ?? 256;
		return this.http.request(
			'POST',
			`/api/${version}/tabular/generate`,
			req,
			{ strategy, format, batch_size }
		);
	}

	async generate(
		req: DatasetGenerationRequest,
		opts?: { strategy?: GenerationStrategy; format?: TabularExportFormat; batch_size?: number }
	): Promise<TabularGenerateResponse | ArrayBuffer> {
		// backward compatible unified generate
		return this._generate(this.apiVersion, req, opts) as Promise<TabularGenerateResponse | ArrayBuffer>;
	}

	async strategies(): Promise<{ strategies: Array<Record<string, unknown>> }> {
		return await this.http.request("GET", `/api/${this.apiVersion}/tabular/strategies`);
	}

	async analyze(request: DatasetGenerationRequest): Promise<Record<string, unknown>> {
		return await this.http.request("POST", `/api/${this.apiVersion}/tabular/analyze`, request);
	}

	async validate(body: { data: Record<string, unknown>[]; schema: { columns: ColumnDescription[] } }): Promise<Record<string, unknown>> {
		return await this.http.request("POST", `/api/${this.apiVersion}/tabular/validate`, body);
	}

	async status(): Promise<Record<string, unknown>> {
		return await this.http.request("GET", `/api/${this.apiVersion}/tabular/status`);
	}
}

