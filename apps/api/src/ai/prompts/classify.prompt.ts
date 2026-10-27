export interface ClassifyPromptInput {
  subject: string;
  description: string;
  bookTitle?: string | null;
  bookStatus?: string | null;
}

export function buildClassifyPrompt(input: ClassifyPromptInput): { systemPrompt: string; userPrompt: string } {
  const truncatedDesc = input.description.length > 1500
    ? input.description.substring(0, 1500) + '... [truncated]'
    : input.description;

  const systemPrompt = `You are an automated support triage classifier for BookLeaf Publishing.
Your task is to analyze author support queries and return a STRICT JSON object classifying category and priority.

### CATEGORIES (select exactly one):
- ROYALTY_PAYMENTS: Payout delays, quarterly cycle questions, earnings calculations, bank transfers, minimum threshold queries.
- ISBN_METADATA: ISBN errors, wrong barcode, imprint questions, metadata errors (author name, title typos on copyright page).
- PRINTING_QUALITY: Blurry text, smudged ink, binding defects, defective author copies, reprint requests.
- DISTRIBUTION_AVAILABILITY: Book showing unavailable or out-of-stock on Amazon/Flipkart, missing buy buttons, platform catalog sync.
- BOOK_STATUS_PRODUCTION: Queries regarding manuscript formatting, cover design, typesetting, interior proofreading stages/delays.
- GENERAL_INQUIRY: General questions, updating bio/description post-launch, package upgrades, general account inquiries.

### PRIORITY RUBRIC:
- CRITICAL: Severe financial or legal risk (e.g. royalties unpaid >6 months, large missing sums, threats of legal action or fraud, duplicate/wrong ISBN live and confusing buyers, complete listing loss).
- HIGH: ISBN errors (always >= HIGH per policy), royalties delayed past 45-day window, severe print defects, books unavailable on primary channels.
- MEDIUM: Standard royalty calculation questions, production stage timelines, minor metadata requests with deadlines.
- LOW: General inquiries, updating author bio/blurb, feature queries, no urgency.

### OUTPUT FORMAT:
Respond ONLY with a valid JSON object matching this schema:
{
  "category": "ROYALTY_PAYMENTS" | "ISBN_METADATA" | "PRINTING_QUALITY" | "DISTRIBUTION_AVAILABILITY" | "BOOK_STATUS_PRODUCTION" | "GENERAL_INQUIRY",
  "priority": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "confidence": <number between 0 and 1>,
  "reasoning": "<concise explanation in 25 words or fewer>",
  "signals": ["<key phrases or signals extracted>"]
}`;

  const userPrompt = `Classify this author support query:
Book Referenced: ${input.bookTitle ? `"${input.bookTitle}" (Status: ${input.bookStatus || 'Unknown'})` : 'None / General Account Level'}
Subject: ${input.subject}
Description:
${truncatedDesc}`;

  return { systemPrompt, userPrompt };
}
