# @synthik/client

A minimal, typed TypeScript client for the Synthik Labs backend.

> API v1 is deprecated and will sunset **2025-09-26**. Prefer `apiVersion: 'v2'` when instantiating the client. Unified helpers (e.g. `client.tabular.generate`) dispatch automatically.

## Install (local dev from repo)

```bash
# from repo root
pnpm -C clients/typescript i
pnpm -C clients/typescript build
```

For consumers (once published):

```bash
pnpm add @synthik/client
# or
npm install @synthik/client
```

## Quick Start

```ts
import SynthikClient, { ColumnBuilder, type DatasetGenerationRequest, type TextDatasetGenerationRequest } from "@synthik/client";

const client = new SynthikClient({ apiVersion: 'v2', apiKey: process.env.SYNTHIK_API_KEY });

const tabularReq: DatasetGenerationRequest = {
  num_rows: 50,
  topic: "User profiles",
  columns: [
    ColumnBuilder.string("full_name", { description: "User's full name", max_length: 80 }).build(),
    ColumnBuilder.int("age", { description: "Age in years", constraints: { min: 18, max: 90 } }).build(),
    ColumnBuilder.categorical("country", ["US", "CA", "GB"]).build(),
    ColumnBuilder.email().build(),
  ],
  seed: 123,
};

const tabular = await client.tabular.generate(tabularReq, { strategy: "adaptive_flow", format: "json", batch_size: 256 });
console.log(tabular.metadata);

const textReq: TextDatasetGenerationRequest = {
  num_samples: 5,
  task_definition: "sentiment analysis of product reviews",
  data_domain: "e-commerce",
  data_description: "Product reviews with positive/negative/neutral",
  output_format: "instruction",
  sample_examples: [
    { instruction: "Analyze sentiment", input: "Great battery life", output: "positive" }
  ]
};
const text = await client.text.generate(textReq);
console.log(text.metadata);
```

---

## API Versioning

Set `apiVersion: 'v2'` in `SynthikClient` options. Explicit versioned methods exist (`v1Generate`, `v2Generate`, etc.) but will emit deprecation warnings for v1.

## Tabular Module

| Method | Description |
| ------ | ----------- |
| `generate(req, opts?)` | Unified generate; opts: `{ strategy?, format?, batch_size? }`. Formats: `json`, `csv`, `parquet`, `arrow`, `excel`. |
| `v1Generate(req, opts?) / v2Generate(req, opts?)` | Explicit versioned helpers (v1 deprecated). |
| `strategies()` | Retrieve available generation strategies. |
| `analyze(req)` | Pre-flight analysis (schema/topic). |
| `validate({ data, schema })` | Validate data rows against schema. |
| `status()` | Service / model readiness. |

### CSV Example

```ts
const csv = await client.tabular.generate(tabularReq, { format: 'csv' });
// csv is ArrayBuffer (browser) or Buffer (node) — write to file:
import { writeFileSync } from 'node:fs';
writeFileSync('synthetic.csv', Buffer.from(csv as ArrayBuffer));
```

### Analyze & Strategies

```ts
const analysis = await client.tabular.analyze(tabularReq);
const available = await client.tabular.strategies();
console.log(available.strategies);
```

### Validation

```ts
const validation = await client.tabular.validate({
  data: (tabular as any).data, // when format=json
  schema: { columns: tabularReq.columns }
});
console.log(validation);
```

## Text Module

| Method | Description |
| ------ | ----------- |
| `generate(req)` | Unified generate. |
| `v1Generate(req) / v2Generate(req)` | Explicit versioned helpers. |
| `info()` | Capability info (graceful across versions). |
| `validate(req)` | Validate a text generation request. |
| `examples()` | Retrieve sample example tasks. |

## Auth Module

Available via `client.auth`.

| Method | Description |
| ------ | ----------- |
| `register(email, password)` | Create account (dispatch by version). |
| `login(email, password)` | Obtain auth token. |
| `validateToken(token?)` | Validate current (or provided) token. |
| `listTokens(includeRevoked?, includeExpired?)` | Enumerate issued tokens. |
| `revoke(token)` | Revoke token by value. |
| `revokeById(token_id)` | Revoke token by id. |
| `me()` | Current user profile. |

### Auth Example

```ts
const auth = await client.auth.login('user@example.com', 'password123');
console.log(auth);
const valid = await client.auth.validateToken(auth.token);
console.log(valid);
```

## ColumnBuilder Helpers

```ts
const col = ColumnBuilder.string('title', { description: 'Article title', max_length: 120 })
  // Chain builder helpers before build
  .constrain('regex', '^[A-Z].+')
  .samples(['Hello World', 'A Great Day'])
  .build();
```

Static constructors: `string`, `int`, `float`, `categorical`, `email`, `uuid`.

## Text Request Notes

`output_format`: `instruction | conversation | json`. Provide `sample_examples` to guide style.

## Error Handling

Errors are thrown (non-2xx). Wrap in try/catch:

```ts
try {
  await client.tabular.generate(tabularReq);
} catch (e) {
  console.error('Generation failed', e);
}
```

## Migration (v1 -> v2)

- Specify `apiVersion: 'v2'` in client options
- Replace explicit `v1*` calls with unified or `v2*`
- Re-run generation if relying on improved strategy semantics

## License

See repository root for license info.
```
