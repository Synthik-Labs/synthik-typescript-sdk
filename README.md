# @synthik/client

A minimal, typed TypeScript client for the Synthik Labs backend.

## Install (local)

```bash
# from repo root
pnpm -C clients/typescript i
pnpm -C clients/typescript build
```

## Usage

```ts
import SynthikClient, { ColumnBuilder, type DatasetGenerationRequest } from "@synthik/client";

// Base URL is preconfigured inside the client; no configuration needed.
const client = new SynthikClient();

const req: DatasetGenerationRequest = {
  num_rows: 50,
  topic: "User profiles",
  columns: [
    ColumnBuilder.string("full_name", { description: "User's full name", max_length: 80 }).build(),
    ColumnBuilder.int("age", { description: "Age in years", constraints: { min: 18, max: 90 } }).build(),
    ColumnBuilder.categorical("country", ["US", "CA", "GB"]).build(),
    ColumnBuilder.email().build(),
  ],
};

const result = await client.tabular.generate(req, { strategy: "adaptive_flow", format: "json" });
console.log(result);

// Text
const text = await client.text.generate({
  num_samples: 5,
  task_definition: "sentiment analysis of product reviews",
  data_domain: "e-commerce",
  data_description: "Product reviews with positive/negative/neutral",
  output_format: "instruction",
  sample_examples: [
    {
      instruction: "Analyze the sentiment of this product review",
      input: "This phone has amazing battery life and great camera quality!",
      output: "positive",
    },
  ],
});
console.log(text);
```
