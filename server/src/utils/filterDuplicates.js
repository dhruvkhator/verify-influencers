import OpenAI from 'openai';
import dotenv from 'dotenv';
import pkg from 'faiss-node';


const { IndexFlatL2 } = pkg;

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPEN_AI_API_KEY });

// Function to generate embeddings for claims
const generateEmbeddings = async (claims) => {
  //console.log(claims[0])
  const embeddings = [];
  for (const claim of claims) {
    const response = await openai.embeddings.create({
      input: claim.claim, // Use the claim text for embedding
      model: 'text-embedding-3-small'
    });
    embeddings.push(response.data[0].embedding);
  }
  return embeddings;
};

const flattenEmbeddings = (embeddings) => {
  return embeddings.flat(); // Flatten the 2D array into a 1D array
};

// Function to deduplicate claims using FAISS
export const deduplicateClaims = async (claims) => {
  const embeddings = await generateEmbeddings(claims);


  const dimension = embeddings[0].length;
  const index = new IndexFlatL2(dimension)

  const matrixEmbeddings = flattenEmbeddings(embeddings);

  index.add(matrixEmbeddings);

  const uniqueClaims = [];
  const visited = new Set();

  for (let i = 0; i < claims.length; i++) {
    if (visited.has(i)) continue; // Skip already visited claims

    const k = index.ntotal() > 10 ? 10 : index.ntotal();

    const queryEmbedding = flattenEmbeddings([embeddings[i]]);

    // Find the nearest neighbors for the current claim
    const { distances, labels } = index.search(queryEmbedding, k); // Search for top 10 neighbors


    let earliestSourceId = claims[i].source_id;
    let earliestCreatedAt = claims[i].created_at;
    let categoryToKeep = claims[i].category;

    for (let j = 0; j < labels.length; j++) {
      if (labels[j] !== i && distances[j] < 0.4) { // Adjust threshold as needed
        visited.add(labels[j]); // Mark the neighbor as visited

        // Update source_id and created_at if the duplicate claim is earlier
        if (new Date(claims[labels[j]].created_at) < new Date(earliestCreatedAt)) {
          earliestSourceId = claims[labels[j]].source_id;
          earliestCreatedAt = claims[labels[j]].created_at;
          categoryToKeep = claims[labels[j]].category; // Update category to keep
        }
      }
    }

    // Add the unique claim with grouped categories and earliest source_id
    uniqueClaims.push({
      claim: claims[i].claim,
      category: categoryToKeep, // Keep only one category
      source_id: earliestSourceId,
      created_at: earliestCreatedAt
    });
  }

  return uniqueClaims;
};

