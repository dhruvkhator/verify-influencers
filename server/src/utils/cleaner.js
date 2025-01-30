export const sanitizeText = (category) => {
    return category
        .replace(/[<>*"'`]/g, '') // Remove specific unwanted characters (< > * " ' `)
        .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
        .trim(); // Remove leading and trailing spaces 
};
export const extractDetails = (text) =>{
    const cleanedText = text.replace(/\*/g, '');

    // Regular expressions for cleaned text
    const confidenceScoreRegex = /Confidence Score:\s*(\d+)/;
    const categoryRegex = /Categorization:\s*([^\n]+)/;
    const reasoningRegex = /Reasoning:\s*([\s\S]+)$/;

    // Extract values
    const confidenceMatch = cleanedText.match(confidenceScoreRegex);
    const categoryMatch = cleanedText.match(categoryRegex);
    const reasoningMatch = cleanedText.match(reasoningRegex);

    return {
        confidenceScore: confidenceMatch ? parseInt(confidenceMatch[1]) : null,
        status: categoryMatch ? categoryMatch[1].trim() : null,
        reason: reasoningMatch ? reasoningMatch[1].replace(/\[\d+\]/g, '').trim() : null
    };
}
