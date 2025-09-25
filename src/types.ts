// Shared client types that mirror backend Pydantic models

export type GenerationStrategy = "neural_argn" | "llm_structured" | "adaptive_flow";
export type TabularExportFormat = "json" | "csv" | "parquet" | "arrow" | "excel";

export interface ColumnConstraints {
	[key: string]: unknown;
}

export interface ColumnDescription {
	name: string;
	dtype: string; // "int" | "float" | "string" | "boolean" | etc.
	description?: string;
	sample_values?: unknown[];
	constraints?: ColumnConstraints;
	max_length?: number; // convenience for text fields
}

export interface DatasetGenerationRequest {
	num_rows: number;
	columns: ColumnDescription[];
	topic: string;
	seed?: number;
	additional_constraints?: Record<string, unknown>;
}

export interface TabularGenerateResponse {
	success: boolean;
	data: Record<string, unknown>[]; // when format=json
	metadata: {
		strategy: GenerationStrategy;
		num_rows: number;
		columns: string[];
		[k: string]: unknown;
	};
}

// Text module types
export type TextOutputFormat = "instruction" | "conversation" | "json";

export interface TextDatasetGenerationRequest {
	num_samples: number;
	task_definition: string;
	data_domain: string;
	data_description: string;
	output_format: TextOutputFormat;
	sample_examples?: Record<string, unknown>[];
	constraints?: Record<string, unknown>;
}

export interface SyntheticTextSample {
	data: Record<string, unknown> | Record<string, unknown>[];
}

export interface SyntheticTextDatasetResponse {
	data: SyntheticTextSample[];
	metadata?: Record<string, unknown>;
}

// Builders
export class ColumnBuilder {
	private col: ColumnDescription;
	private constructor(name: string, dtype: string) {
		this.col = { name, dtype };
	}
	static string(name: string, opts?: { description?: string; max_length?: number; constraints?: ColumnConstraints; sample_values?: unknown[] }) {
		const b = new ColumnBuilder(name, "string");
		if (opts?.description) b.col.description = opts.description;
		if (opts?.max_length !== undefined) (b.col as any).max_length = opts.max_length;
		if (opts?.constraints) b.col.constraints = opts.constraints;
		if (opts?.sample_values) b.col.sample_values = opts.sample_values;
		return b;
	}
	static int(name: string, opts?: { description?: string; constraints?: ColumnConstraints; sample_values?: number[] }) {
		const b = new ColumnBuilder(name, "integer");
		if (opts?.description) b.col.description = opts.description;
		if (opts?.constraints) b.col.constraints = opts.constraints;
		if (opts?.sample_values) b.col.sample_values = opts.sample_values;
		return b;
	}
	static float(name: string, opts?: { description?: string; constraints?: ColumnConstraints; sample_values?: number[] }) {
		const b = new ColumnBuilder(name, "float");
		if (opts?.description) b.col.description = opts.description;
		if (opts?.constraints) b.col.constraints = opts.constraints;
		if (opts?.sample_values) b.col.sample_values = opts.sample_values;
		return b;
	}
	static categorical(name: string, categories: string[], opts?: { description?: string }) {
		const b = new ColumnBuilder(name, "string");
		b.col.sample_values = categories;
		b.col.description = opts?.description;
		(b.col.constraints ||= {}).one_of = categories;
		return b;
	}
	static email(name = "email", opts?: { description?: string }) {
		const b = new ColumnBuilder(name, "string");
		b.col.description = opts?.description ?? "Valid email address";
		(b.col.constraints ||= {}).regex = "^[^@\n\s]+@[^@\n\s]+\.[^@\n\s]+$";
		return b;
	}
	static uuid(name = "id", opts?: { description?: string }) {
		const b = new ColumnBuilder(name, "string");
		b.col.description = opts?.description ?? "UUID v4";
		(b.col.constraints ||= {}).regex = "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$";
		return b;
	}
	desc(description: string) { this.col.description = description; return this; }
	samples(values: unknown[]) { this.col.sample_values = values; return this; }
	constrain(k: string, v: unknown) { (this.col.constraints ||= {})[k] = v; return this; }
	build(): ColumnDescription { return { ...this.col }; }
}

