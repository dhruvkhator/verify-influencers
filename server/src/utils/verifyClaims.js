
import axios from 'axios';
import { extractDetails } from "./cleaner.js";

export const claimVerification = async (claim, apiKey) => {
    try {

        
        const headers = {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        }
        const body = {
            "model": "sonar", //perplexity model
            "messages": [{
                "role": "system",
                "content": `Please analyze the claim and evaluate its credibility. Consider the following factors in your analysis:
                **Guidelines for Evaluation**: 
                1. **Confidence Score (1-10)**:
                    - Assign a score based on how strongly the analysis supports the claim.
                    - Evaluate the study quality, including:
                    - Journal ranking (e.g., top 10% journals are more reliable).
                    - Publication date (recent studies are more relevant unless older research is landmark or foundational).
                    - Citation count (highly cited studies generally hold more credibility).
                    - Check for relevance and consistency in findings across multiple studies.
                2. **Categorization**:
                    - **Verified**: The claim is well-supported by rigorous and reliable evidence.
                    - **Debunked**: The claim is contradicted by strong evidence.
                    - **Questionable**: Evidence exists but is inconclusive, contradictory, or insufficient.
                3. **Reasoning**:
                    - Provide a clear and concise one or two line explanation for the assigned score and category.
                    - Avoid excessive details; focus on whether the evidence supports, partially supports, or contradicts the claim.
                    
                Structure to send:
                **Confidence Score**:<confidence_score>
                **Categorization**: <category>
                **Reasoning**: <reasoning>
                    `
            },
            {
                "role": "user",
                "content": `Based on the analysis, evaluate the given claim. Provide a confidence score (1-10) and categorize it as Verified, Debunked, or Questionable, with reasoning.
                Claim: ${claim}`
            }],
            max_tokens: 500,

        }
        const response = await axios.post('https://api.perplexity.ai/chat/completions', body, { headers });
        const output = response.data.choices[0].message.content;
        const op = extractDetails(output);

        return op;

    } catch (error) {
        //console.log(error.response.statusText)
        // statusText: 'Unauthorized'
        if(error.response.statusText === 'Unauthorized'){
            return error.response.statusText;
        }
        console.error('Error assigning score and status to claim:');
        return {};
    }
}












