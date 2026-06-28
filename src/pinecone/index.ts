import Anthropic from "@anthropic-ai/sdk";
import { Pinecone } from "@pinecone-database/pinecone";
import { VoyageAIClient } from "voyageai";
import fs from "fs";

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const claude = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const voyage = new VoyageAIClient({
  apiKey: process.env.VOYAGE_API_KEY,
});

const INDEX_NAME = "calude-index";
const EMBEDDING_MODEL = "voyage-3-large";
const EMBEDDING_DIMENSION = 2048;

// Splits a Markdown document into chunks based on "##" headings.
export function chunkMarkdown(md: string) {
  const sections = md.split(/\n## /);

  const chunks: string[] = [];

  for (const section of sections) {
    chunks.push(section);
  }

  return chunks;
}

// Ensures the Pinecone index exists and matches the configured embedding dimension.
async function ensureIndex() {
  const indexList = await pc.listIndexes();
  const existingIndex = indexList.indexes?.find((index) => index.name === INDEX_NAME);

  if (existingIndex) {
    if (existingIndex.dimension !== EMBEDDING_DIMENSION) {
      throw new Error(
        `Pinecone index "${INDEX_NAME}" has dimension ${existingIndex.dimension}, but ${EMBEDDING_MODEL} is configured for ${EMBEDDING_DIMENSION}.`
      );
    }

    return;
  }

  await pc.createIndex({
    name: INDEX_NAME,
    dimension: EMBEDDING_DIMENSION,
    metric: "cosine",
    spec: {
      serverless: {
        cloud: "aws",
        region: "us-east-1",
      },
    },
    waitUntilReady: true,
    suppressConflicts: true,
  });
}

// Generates embeddings for the provided text using the Voyage AI model.
export async function embed(texts: string[]) {
  const res = await voyage.embed({
    input: texts,
    model: EMBEDDING_MODEL,
    outputDimension: EMBEDDING_DIMENSION,
  });

  return res.data;
}

// Returns the embedding vector for the specified index.
function getEmbedding(vectors: Awaited<ReturnType<typeof embed>>, index: number) {
  const embedding = vectors?.[index]?.embedding;

  if (!embedding) {
    throw new Error(`Missing embedding at index ${index}.`);
  }

  return embedding;
}

// Returns a Pinecone index instance by name.
export function getIndex(name: string) {
  return pc.index({ name });
}

// Reads, chunks, embeds, and uploads the Markdown document to Pinecone.
export async function upsertChunks() {
  await ensureIndex();

  const md = fs.readFileSync("report.md", "utf-8");
  const chunks = chunkMarkdown(md);
  const vectors = await embed(chunks);

  const items: any[] = chunks.map((chunk, i) => ({
    id: `report-${i}`,
    values: getEmbedding(vectors, i),
    metadata: {
      text: chunk,
      reportId: `report-${i}`,
    },
  }));

  const index = getIndex(INDEX_NAME);
  await index.upsert({ records: items });
}

// Retrieves the most relevant document chunks for a given query.
export async function retrieve(query: string, topK = 5) {
  await ensureIndex();

  const queryVector = await embed([query]);
  const index = getIndex(INDEX_NAME);
  const embedding = getEmbedding(queryVector, 0);

  const result = await index.query({
    vector: embedding,
    topK,
    includeMetadata: true,
  });

  console.log(JSON.stringify(result, null, 2));
}

retrieve("What happened in cybersecurity section")
