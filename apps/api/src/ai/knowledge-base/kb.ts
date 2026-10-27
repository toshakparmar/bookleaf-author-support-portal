import { Category } from '@prisma/client';

export interface KbSection {
  title: string;
  content: string;
}

export interface KbExample {
  category: Category;
  query: string;
  expectedBehavior: string;
}

export const BOOKLEAF_KB = {
  company: {
    title: 'Company Overview & Packages',
    content:
      'BookLeaf Publishing is a self-publishing company operating in India and the US. Packages: Standard Free (no upfront cost) and Bestseller Breakthrough (premium, paid, with marketing and distribution add-ons). BookLeaf handles cover design, typesetting, ISBN assignment, printing, distribution, and royalty management. In-house printing facility and warehouse are in Delhi; print partners are Repro India and Epitome Books.',
  },

  royalty: {
    title: 'Royalty Structure & Calculations',
    content:
      '80/20 split — 80% of net profit per book to the author, 20% to BookLeaf. Net profit = MRP − printing cost − platform commission (Amazon/Flipkart) − shipping charges. Royalties are calculated quarterly and paid within 45 days of quarter end. Minimum payout threshold ₹1,000; below that, royalties roll over to the next quarter. Payouts by bank transfer to the account linked in the author’s dashboard. Authors can view a detailed royalty breakdown (sales per platform) in their dashboard.',
  },

  isbn: {
    title: 'ISBN Assignment & Verification',
    content:
      'Every book gets a unique ISBN assigned by BookLeaf, registered under BookLeaf’s publisher imprint. An ISBN under the author’s own imprint must be obtained by the author independently. An ISBN error (duplicate, wrong book linked) is a high-priority issue escalated to the production team.',
  },

  printing: {
    title: 'Printing Operations & Quality Guarantee',
    content:
      'In-house printing handles most orders; overflow/specific formats go to Repro India or Epitome Books. Standard print turnaround 5–7 business days from order confirmation. Quality issues (misprints, binding defects, colour inconsistency) → free reprint after verification; the author may need to share photos of the defective copy.',
  },

  distribution: {
    title: 'Distribution Channels & Stock Availability',
    content:
      'Listed on Amazon India, Flipkart, Amazon US, Amazon UK, and the BookLeaf Store. New listings go live 7–10 business days after publication is complete. "Unavailable" on a platform usually indicates a stock sync issue; BookLeaf can trigger a re-sync within 24–48 hours.',
  },

  production: {
    title: 'Production Pipeline & Stage Timelines',
    content:
      'Production stages: Manuscript Received → Editing (if opted) → Cover Design → Typesetting → Proofreading → ISBN Assignment → Printing → Distribution Setup → Published & Live. Authors are emailed at each stage. Delays typically occur at Cover Design (waiting for author approval) and Proofreading (revision rounds).',
  },

  tone: {
    title: 'Author Support Tone Guidelines',
    content:
      'Always empathetic and professional; authors are partners, not customers to be managed. Acknowledge the concern before solutions. Be specific — actual numbers, dates, statuses. If it is BookLeaf’s fault (delayed royalties, ISBN error), own it directly; no corporate deflection. If escalation/investigation is required, give a clear timeline (e.g. "Our team will look into this and get back to you within 48 hours"). Always end with a clear next step for the author and/or BookLeaf team. Plain text, no markdown headers, ~120–220 words. Sign off as "Team BookLeaf".',
  },

  examples: [
    {
      category: Category.ROYALTY_PAYMENTS,
      query: 'Published 4 months ago, no royalty yet',
      expectedBehavior:
        'Acknowledge frustration; explain quarterly cycle + 45-day window; check bank details are linked; give the specific next payout date; if genuinely overdue, escalate with a 48-hour resolution timeline.',
    },
    {
      category: Category.ROYALTY_PAYMENTS,
      query: 'Sold 200 copies but only received ₹3,000',
      expectedBehavior:
        'Explain net profit = MRP − printing − platform commission − shipping; offer a detailed line-by-line breakdown; be transparent, not defensive.',
    },
    {
      category: Category.ISBN_METADATA,
      query: 'Different ISBN on Amazon vs physical copy',
      expectedBehavior:
        'High priority; acknowledge it is a serious data issue; confirm immediate escalation to the production team; 48-hour resolution timeline.',
    },
    {
      category: Category.PRINTING_QUALITY,
      query: 'Print quality terrible, blurry, misaligned',
      expectedBehavior:
        'Apologise sincerely; ask for photos; confirm free reprint once verified; 5–7 business day reprint timeline.',
    },
    {
      category: Category.DISTRIBUTION_AVAILABILITY,
      query: 'Showing Currently Unavailable on Amazon',
      expectedBehavior:
        'Likely stock sync issue; confirm re-sync with the distribution team; 24–48 hours.',
    },
    {
      category: Category.BOOK_STATUS_PRODUCTION,
      query: '3 weeks in typesetting, when done?',
      expectedBehavior:
        'Check actual production status; if delayed, be honest about why (e.g. awaiting author approval of proofs); give a specific updated timeline; frame collaboratively, do not blame the author.',
    },
    {
      category: Category.GENERAL_INQUIRY,
      query: 'Can I update my book description on Amazon after it is live?',
      expectedBehavior:
        'Yes, via dashboard or by emailing the BookLeaf team; changes reflect on platforms in 3–5 business days.',
    },
  ] as KbExample[],
};
