import { Category, Priority } from '@prisma/client';
import { classifyByKeywords } from '../../src/ai/heuristics/keyword-classifier';
import { evaluatePriorityRules } from '../../src/ai/heuristics/priority-rules';

export interface EvalSample {
  id: string;
  subject: string;
  description: string;
  expectedCategory: Category;
  expectedPriority: Priority;
  bookTitle?: string;
  bookStatus?: string;
}

export const EVAL_DATASET: EvalSample[] = [
  // 7 Prompts from Section 11 Knowledge Base
  {
    id: 'kb-1',
    subject: 'Published 4 months ago, no royalty yet',
    description: 'My book was published 4 months ago and I have not received any royalty payout yet.',
    expectedCategory: Category.ROYALTY_PAYMENTS,
    expectedPriority: Priority.HIGH,
  },
  {
    id: 'kb-2',
    subject: 'Sold 200 copies but only received ₹3,000',
    description: 'I sold 200 copies according to my dashboard but only received ₹3,000 in my account. Why is the deduction so high?',
    expectedCategory: Category.ROYALTY_PAYMENTS,
    expectedPriority: Priority.MEDIUM,
  },
  {
    id: 'kb-3',
    subject: 'Different ISBN on Amazon vs physical copy',
    description: 'The ISBN printed on my physical proof copy differs from the ISBN listed on Amazon India.',
    expectedCategory: Category.ISBN_METADATA,
    expectedPriority: Priority.HIGH,
  },
  {
    id: 'kb-4',
    subject: 'Print quality terrible, blurry, misaligned',
    description: 'Received author copies today and the print quality is completely defective with blurry text and bad spine binding.',
    expectedCategory: Category.PRINTING_QUALITY,
    expectedPriority: Priority.HIGH,
  },
  {
    id: 'kb-5',
    subject: 'Showing Currently Unavailable on Amazon',
    description: 'My book is showing Currently Unavailable on Amazon India even though launch was completed.',
    expectedCategory: Category.DISTRIBUTION_AVAILABILITY,
    expectedPriority: Priority.HIGH,
  },
  {
    id: 'kb-6',
    subject: '3 weeks in typesetting, when done?',
    description: 'My manuscript has been sitting in typesetting for over 3 weeks with no update from the designer.',
    expectedCategory: Category.BOOK_STATUS_PRODUCTION,
    expectedPriority: Priority.MEDIUM,
  },
  {
    id: 'kb-7',
    subject: 'Can I update my book description on Amazon after it is live?',
    description: 'I want to update the blurb and author bio on Amazon and Flipkart now that reviews are coming in.',
    expectedCategory: Category.GENERAL_INQUIRY,
    expectedPriority: Priority.LOW,
  },
  // Additional 14 Realistic Author Scenarios
  {
    id: 'eval-8',
    subject: 'Legal notice regarding unpaid royalties for 8 months',
    description: 'I have not been paid royalties for 8 months despite multiple emails. My lawyer will file consumer court proceedings.',
    expectedCategory: Category.ROYALTY_PAYMENTS,
    expectedPriority: Priority.CRITICAL,
  },
  {
    id: 'eval-9',
    subject: 'Critical barcode scan failure in bookstores',
    description: 'Retail stores report the barcode does not scan at registers due to an ISBN checksum mismatch.',
    expectedCategory: Category.ISBN_METADATA,
    expectedPriority: Priority.HIGH,
  },
  {
    id: 'eval-10',
    subject: 'Pages falling out of paperback copies',
    description: 'Several readers informed me the binding glue is detached and pages fall out upon opening.',
    expectedCategory: Category.PRINTING_QUALITY,
    expectedPriority: Priority.HIGH,
  },
  {
    id: 'eval-11',
    subject: 'Flipkart listing links to another author book',
    description: 'When clicking on my title on Flipkart, it redirects to an unrelated cookbook by another publisher.',
    expectedCategory: Category.DISTRIBUTION_AVAILABILITY,
    expectedPriority: Priority.HIGH,
  },
  {
    id: 'eval-12',
    subject: 'Status stuck at Cover Design approval',
    description: 'I approved the third cover iteration 10 days ago but dashboard still shows waiting for approval.',
    expectedCategory: Category.BOOK_STATUS_PRODUCTION,
    expectedPriority: Priority.MEDIUM,
  },
  {
    id: 'eval-13',
    subject: 'How do I download sales invoice reports?',
    description: 'Where can I find GST invoices for bulk author copy purchases made last month?',
    expectedCategory: Category.GENERAL_INQUIRY,
    expectedPriority: Priority.LOW,
  },
  {
    id: 'eval-14',
    subject: 'Quarterly payout breakdown request',
    description: 'Please provide platform-wise sales numbers for Q3 across Amazon US and Amazon IN.',
    expectedCategory: Category.ROYALTY_PAYMENTS,
    expectedPriority: Priority.MEDIUM,
  },
  {
    id: 'eval-15',
    subject: 'Duplicate ISBN assigned to Kindle edition',
    description: 'Kindle store is showing duplicate ISBN conflict error preventing pre-orders.',
    expectedCategory: Category.ISBN_METADATA,
    expectedPriority: Priority.HIGH,
  },
  {
    id: 'eval-16',
    subject: 'Cover colors are washed out and faded',
    description: 'The printed cover looks grey instead of deep green. Colors do not match approved PDF proofs.',
    expectedCategory: Category.PRINTING_QUALITY,
    expectedPriority: Priority.HIGH,
  },
  {
    id: 'eval-17',
    subject: 'Amazon US listing missing entirely',
    description: 'My title was supposed to launch globally but cannot be found on Amazon US or UK.',
    expectedCategory: Category.DISTRIBUTION_AVAILABILITY,
    expectedPriority: Priority.HIGH,
  },
  {
    id: 'eval-18',
    subject: 'Manuscript proofreading turnaround timeline',
    description: 'How long does proofreading review usually take before typesetting commences?',
    expectedCategory: Category.BOOK_STATUS_PRODUCTION,
    expectedPriority: Priority.LOW,
  },
  {
    id: 'eval-19',
    subject: 'Updating bank account details for wire payouts',
    description: 'I recently changed banks and need to update my IFSC code and account number for payouts.',
    expectedCategory: Category.ROYALTY_PAYMENTS,
    expectedPriority: Priority.MEDIUM,
  },
  {
    id: 'eval-20',
    subject: 'Can I purchase 50 author copies with discount?',
    description: 'I have an upcoming book signing event and need 50 copies shipped to Bangalore.',
    expectedCategory: Category.GENERAL_INQUIRY,
    expectedPriority: Priority.LOW,
  },
  {
    id: 'eval-21',
    subject: 'Fraud and legal escalation for missing 10-month payments',
    description: 'This is fraud. You have held my royalties for 10 months. Police complaint will be lodged.',
    expectedCategory: Category.ROYALTY_PAYMENTS,
    expectedPriority: Priority.CRITICAL,
  },
];

export async function runClassificationEval() {
  console.log(`\n============================================================`);
  console.log(`BookLeaf AI Classification & Priority Evaluation Suite`);
  console.log(`Evaluating ${EVAL_DATASET.length} Labelled Ground-Truth Queries`);
  console.log(`============================================================\n`);

  let categoryMatches = 0;
  let priorityMatches = 0;

  for (const sample of EVAL_DATASET) {
    const res = classifyByKeywords(
      sample.subject,
      sample.description,
      sample.bookStatus,
    );

    const isCatMatch = res.category === sample.expectedCategory;
    const isPriMatch = res.priority === sample.expectedPriority;

    if (isCatMatch) categoryMatches++;
    if (isPriMatch) priorityMatches++;

    console.log(
      `[${sample.id}] ${sample.subject.padEnd(52)} | Cat: ${isCatMatch ? '✓' : '✗'} (${res.category}) | Pri: ${isPriMatch ? '✓' : '✗'} (${res.priority})`,
    );
  }

  const categoryAccuracy = ((categoryMatches / EVAL_DATASET.length) * 100).toFixed(1);
  const priorityAccuracy = ((priorityMatches / EVAL_DATASET.length) * 100).toFixed(1);

  console.log(`\n------------------------------------------------------------`);
  console.log(`EVALUATION RESULTS:`);
  console.log(`Category Accuracy: ${categoryAccuracy}% (${categoryMatches}/${EVAL_DATASET.length})`);
  console.log(`Priority Accuracy: ${priorityAccuracy}% (${priorityMatches}/${EVAL_DATASET.length})`);
  console.log(`------------------------------------------------------------\n`);

  return {
    total: EVAL_DATASET.length,
    categoryAccuracy: Number(categoryAccuracy),
    priorityAccuracy: Number(priorityAccuracy),
  };
}

if (require.main === module) {
  runClassificationEval().then(() => process.exit(0));
}
