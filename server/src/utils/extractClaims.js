import OpenAI from 'openai'
import dotenv from "dotenv";

dotenv.config();


const openai = new OpenAI({
    apiKey: [process.env.OPEN_AI_API_KEY]
});

export const extractClaims = async (text) => {
    try {
        const prompt = `Analyze the provided text completely first and then extract claims specifically designed to align with rigorous, research-backed scientific studies in health.
        The extracted claims must adhere to the following criteria:
Requirements for Claims:
1. Claims must include quantifiable data, such as percentages, numerical ranges, or statistical outcomes (e.g., "reduces the risk by 20%" or "improves by 50%").
2. Claims must be precise, evidence-based, and suggest measurable impacts, interventions, or findings (e.g., "consuming 25g of fiber daily reduces the risk of cardiovascular disease by 30%").
3. Avoid general statements or subjective observations (e.g., "exercise is good for you" or "high-intensity workouts are beneficial").
4. Claims must use terms commonly found in academic research, such as "associated with," "linked to," "reduces risk," "correlates with," or "statistically significant."


Categories: Classify each claim into one of the following categories:
Sleep
Nutrition
Fitness & Physical Activity
Mental Health
Preventive Health
Environmental Health
Reproductive Health
Chronic Diseases
Aging & Longevity
Immune Health

Output Format:
<Category>: <Claim>
If no claims meeting the above criteria are present in the text, respond with: "No claims present."

Examples of Valid Claims:
1. Nutrition: "Consuming 20g of olive oil daily reduces LDL cholesterol by 15% within two months."
2. Fitness & Physical Activity: "Engaging in high-intensity interval training (HIIT) three times a week improves VO2 max by 10% over six weeks."
Avoid extracting casual claims, personal opinions, or vague statements.
Text: ${text}`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini', // or 'gpt-3.5-turbo' if GPT-4 is not available
            messages: [
                { role: 'system', content: 'You are a helpful assistant that extracts health claims from text.' },
                { role: 'user', content: prompt },
            ],
            max_tokens: 500,
        });

        const output = response.choices[0].message.content.trim();

        // Check if no claims are present
        if (output === "No claims present.") {
            return [];
        }

 

        // Parse claims
        const lines = output.split('\n');
        const claims = lines.map((line) => {
            // Remove leading numbers (e.g., "1.", "2.") and trim whitespace
            const cleanedLine = line.replace(/^\d+\.\s*/, '').trim();
            const [category, claimText] = cleanedLine.split(':').map((part) => part.trim());
            return { category, claimText };
        });
     

        return claims;
    } catch (error) {
        console.error('Error extracting claims:', error);
        return [];
    }
};