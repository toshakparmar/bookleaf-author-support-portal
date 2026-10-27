import { Category, Priority } from '@prisma/client';

export interface PriorityRuleEvaluation {
  finalPriority: Priority;
  ruleFloor: Priority;
  ruleTriggered?: string;
}

const PRIORITY_WEIGHT: Record<Priority, number> = {
  [Priority.CRITICAL]: 4,
  [Priority.HIGH]: 3,
  [Priority.MEDIUM]: 2,
  [Priority.LOW]: 1,
};

export function evaluatePriorityRules(
  aiPriority: Priority,
  category: Category,
  subject: string,
  description: string,
): PriorityRuleEvaluation {
  const text = `${subject} ${description}`.toLowerCase();
  let ruleFloor: Priority = Priority.LOW;
  let ruleTriggered: string | undefined = undefined;

  // 1. Legal / Escalation / Severe Distress -> CRITICAL
  const legalKeywords = ['legal', 'lawyer', 'consumer court', 'fraud', 'scam', 'police', 'sue', 'police complaint', 'court notice'];
  if (legalKeywords.some((kw) => text.includes(kw))) {
    ruleFloor = Priority.CRITICAL;
    ruleTriggered = 'Legal / Fraud / Court escalation keywords detected';
  }

  // 2. Severe Royalty Delay (>=6 months) -> CRITICAL
  const sixMonthsMatch = text.match(/(?:haven't|not|no)\s+(?:received|got|paid).*(?:6|7|8|9|10|11|12|six|seven|eight)\s+months/i);
  if (sixMonthsMatch) {
    ruleFloor = Priority.CRITICAL;
    ruleTriggered = 'Unpaid royalty delay exceeding 6 months detected';
  }

  // 3. ISBN Policy: ISBN errors are always >= HIGH per BookLeaf policy
  if (category === Category.ISBN_METADATA) {
    if (ruleFloor !== Priority.CRITICAL) {
      ruleFloor = Priority.HIGH;
      ruleTriggered = 'BookLeaf Policy: ISBN/metadata issues enforce minimum HIGH priority';
    }
  }

  const isbnKeywords = ['wrong isbn', 'duplicate isbn', 'different isbn', 'mismatched isbn', 'isbn incorrect'];
  if (isbnKeywords.some((kw) => text.includes(kw))) {
    if (ruleFloor !== Priority.CRITICAL) {
      ruleFloor = Priority.HIGH;
      ruleTriggered = 'ISBN discrepancy keyword detected';
    }
  }

  // 4. Royalty delayed >= 3 months -> HIGH
  const threeMonthsMatch = text.match(/(?:haven't|not|no)\s+(?:received|got|paid).*(?:3|4|5|three|four|five)\s+months/i);
  if (threeMonthsMatch && PRIORITY_WEIGHT[ruleFloor] < PRIORITY_WEIGHT[Priority.HIGH]) {
    ruleFloor = Priority.HIGH;
    ruleTriggered = 'Royalty delay >= 3 months detected';
  }

  // 5. Defective print copies / batch print damage -> HIGH
  const printDefectKeywords = ['binding broken', 'pages missing', 'terrible quality', 'smudged', 'blurry text', 'defective copy', 'print defect'];
  if (printDefectKeywords.some((kw) => text.includes(kw)) && PRIORITY_WEIGHT[ruleFloor] < PRIORITY_WEIGHT[Priority.HIGH]) {
    ruleFloor = Priority.HIGH;
    ruleTriggered = 'Severe print quality/binding defect detected';
  }

  // Final priority is the max of AI suggested priority and rule floor
  const aiWeight = PRIORITY_WEIGHT[aiPriority] || 2;
  const floorWeight = PRIORITY_WEIGHT[ruleFloor] || 1;

  const finalPriority = aiWeight >= floorWeight ? aiPriority : ruleFloor;

  return {
    finalPriority,
    ruleFloor,
    ruleTriggered: aiWeight < floorWeight ? ruleTriggered : undefined,
  };
}
