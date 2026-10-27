import { PrismaClient, Role, TicketStatus, Priority, Category, AiStatus, MessageSender } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting BookLeaf database seed...');

  // 1. Password hashes
  const saltRounds = 10;
  const authorPasswordHash = await bcrypt.hash('Author@123', saltRounds);
  const adminPasswordHash = await bcrypt.hash('Admin@123', saltRounds);

  // 2. Upsert Admins
  const admin1 = await prisma.user.upsert({
    where: { email: 'admin@bookleaf.test' },
    update: { name: 'Support Admin', role: Role.ADMIN, passwordHash: adminPasswordHash },
    create: {
      email: 'admin@bookleaf.test',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      name: 'Support Admin',
    },
  });

  const admin2 = await prisma.user.upsert({
    where: { email: 'ops@bookleaf.test' },
    update: { name: 'Operations Lead', role: Role.ADMIN, passwordHash: adminPasswordHash },
    create: {
      email: 'ops@bookleaf.test',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      name: 'Operations Lead',
    },
  });

  console.log('✅ Admin accounts seeded: admin@bookleaf.test, ops@bookleaf.test');

  // 3. Load Sample Dataset
  const dataPath = path.join(__dirname, 'data', 'bookleaf_sample_data.json');
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const sampleData = JSON.parse(rawData);

  const authorMap = new Map<string, any>();
  const bookMap = new Map<string, any>();

  for (const authorData of sampleData.authors) {
    // Upsert User
    const user = await prisma.user.upsert({
      where: { email: authorData.email },
      update: {
        name: authorData.name,
        role: Role.AUTHOR,
        passwordHash: authorPasswordHash,
      },
      create: {
        email: authorData.email,
        passwordHash: authorPasswordHash,
        role: Role.AUTHOR,
        name: authorData.name,
      },
    });

    // Upsert Author Profile
    const author = await prisma.author.upsert({
      where: { authorCode: authorData.author_id },
      update: {
        userId: user.id,
        name: authorData.name,
        phone: authorData.phone,
        city: authorData.city,
        joinedDate: new Date(authorData.joined_date),
      },
      create: {
        userId: user.id,
        authorCode: authorData.author_id,
        name: authorData.name,
        phone: authorData.phone,
        city: authorData.city,
        joinedDate: new Date(authorData.joined_date),
      },
    });

    authorMap.set(author.authorCode, { author, user });

    // Upsert Books
    for (const b of authorData.books) {
      const book = await prisma.book.upsert({
        where: { bookCode: b.book_id },
        update: {
          authorId: author.id,
          title: b.title,
          isbn: b.isbn,
          genre: b.genre,
          publicationDate: b.publication_date ? new Date(b.publication_date) : null,
          status: b.status,
          mrp: b.mrp !== null ? Number(b.mrp) : null,
          royaltyPerCopy: b.author_royalty_per_copy !== null ? Number(b.author_royalty_per_copy) : null,
          totalCopiesSold: b.total_copies_sold || 0,
          totalRoyaltyEarned: b.total_royalty_earned !== null ? Number(b.total_royalty_earned) : 0,
          royaltyPaid: b.royalty_paid !== null ? Number(b.royalty_paid) : 0,
          royaltyPending: b.royalty_pending !== null ? Number(b.royalty_pending) : 0,
          lastRoyaltyPayoutDate: b.last_royalty_payout_date ? new Date(b.last_royalty_payout_date) : null,
          printPartner: b.print_partner || null,
          availableOn: b.available_on || [],
        },
        create: {
          bookCode: b.book_id,
          authorId: author.id,
          title: b.title,
          isbn: b.isbn,
          genre: b.genre,
          publicationDate: b.publication_date ? new Date(b.publication_date) : null,
          status: b.status,
          mrp: b.mrp !== null ? Number(b.mrp) : null,
          royaltyPerCopy: b.author_royalty_per_copy !== null ? Number(b.author_royalty_per_copy) : null,
          totalCopiesSold: b.total_copies_sold || 0,
          totalRoyaltyEarned: b.total_royalty_earned !== null ? Number(b.total_royalty_earned) : 0,
          royaltyPaid: b.royalty_paid !== null ? Number(b.royalty_paid) : 0,
          royaltyPending: b.royalty_pending !== null ? Number(b.royalty_pending) : 0,
          lastRoyaltyPayoutDate: b.last_royalty_payout_date ? new Date(b.last_royalty_payout_date) : null,
          printPartner: b.print_partner || null,
          availableOn: b.available_on || [],
        },
      });

      bookMap.set(book.bookCode, book);
    }
  }

  console.log(`✅ Seeded ${authorMap.size} authors and ${bookMap.size} books.`);

  // 4. Seed 14 Realistic Demo Tickets
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const hourMs = 60 * 60 * 1000;

  const demoTickets = [
    // 1. Royalty: Published 4 months ago, no royalty yet (AUTH003 - Ananya Reddy - BK005)
    {
      ticketNumber: 'BL-1001',
      authorCode: 'AUTH003',
      bookCode: 'BK005',
      subject: 'Published 4 months ago, no royalty received yet',
      description: 'My book Between Two Temples went live over 4 months ago. I see 67 copies sold in my dashboard, but my bank account has not received any payout. Can someone please look into this urgently?',
      status: TicketStatus.OPEN,
      category: Category.ROYALTY_PAYMENTS,
      aiCategory: Category.ROYALTY_PAYMENTS,
      priority: Priority.HIGH,
      aiPriority: Priority.HIGH,
      aiStatus: AiStatus.DONE,
      createdAt: new Date(now - 3 * dayMs),
      lastActivityAt: new Date(now - 3 * dayMs),
      assignedToId: admin1.id,
      notes: ['Author has ₹2,546 pending. Check if IFSC and bank account details are verified.'],
      messages: [],
    },
    // 2. Royalty: Sold 200 copies but received only ₹3,000 (AUTH001 - Priya Sharma - BK001)
    {
      ticketNumber: 'BL-1002',
      authorCode: 'AUTH001',
      bookCode: 'BK001',
      subject: 'Query regarding royalty calculation for Whispers of the Ganges',
      description: 'I calculated my sales based on 200 recent copies sold, but the payout received was only ₹3,000. Could you explain the royalty split and deductions for Amazon and printing?',
      status: TicketStatus.IN_PROGRESS,
      category: Category.ROYALTY_PAYMENTS,
      aiCategory: Category.ROYALTY_PAYMENTS,
      priority: Priority.MEDIUM,
      aiPriority: Priority.MEDIUM,
      aiStatus: AiStatus.DONE,
      createdAt: new Date(now - 2 * dayMs),
      lastActivityAt: new Date(now - 1 * dayMs),
      assignedToId: admin2.id,
      notes: ['Prepared platform commission breakdown from Amazon India sales report.'],
      messages: [
        {
          sender: MessageSender.ADMIN,
          senderUserId: admin2.id,
          body: 'Hello Priya, thank you for reaching out. At BookLeaf, royalties are 80% of net profit (MRP minus printing cost, platform commission, and shipping). For Amazon India orders, platform commission typically averages 30-35%. I am pulling the detailed platform sales breakdown for your 200 copies and will attach the itemized ledger within 24 hours.',
          wasAiDrafted: true,
          createdAt: new Date(now - 1 * dayMs),
        },
      ],
    },
    // 3. ISBN: Different ISBN on Amazon vs physical copy (AUTH002 - Rohit Kapoor - BK004)
    {
      ticketNumber: 'BL-1003',
      authorCode: 'AUTH002',
      bookCode: 'BK004',
      subject: 'CRITICAL: Different ISBN on Amazon listing vs physical copy of Startup Sutra',
      description: 'A reader pointed out that the ISBN on the Amazon product page does not match the printed barcode on the back cover of Startup Sutra. This is causing confusion with reviews and orders.',
      status: TicketStatus.OPEN,
      category: Category.ISBN_METADATA,
      aiCategory: Category.ISBN_METADATA,
      priority: Priority.CRITICAL,
      aiPriority: Priority.HIGH,
      priorityOverriddenBy: admin1.id, // Rule safety net escalated to CRITICAL
      aiStatus: AiStatus.DONE,
      createdAt: new Date(now - 5 * hourMs), // SLA Breached for Critical (>4h)
      lastActivityAt: new Date(now - 5 * hourMs),
      assignedToId: admin1.id,
      notes: ['Escalated directly to production lead. Barcode scanned matches imprint 978-93-5XXXX-04-2.'],
      messages: [],
    },
    // 4. Printing: Print quality terrible, blurry, misaligned (AUTH004 - Vikram Joshi - BK006)
    {
      ticketNumber: 'BL-1004',
      authorCode: 'AUTH004',
      bookCode: 'BK006',
      subject: 'Severe print quality defect in author order of Debugging Life',
      description: 'I received my box of 20 author copies yesterday. The text is blurry on pages 40-75 and the spine binding is visibly misaligned. Photos can be provided immediately. Requesting a free reprint.',
      status: TicketStatus.IN_PROGRESS,
      category: Category.PRINTING_QUALITY,
      aiCategory: Category.PRINTING_QUALITY,
      priority: Priority.HIGH,
      aiPriority: Priority.HIGH,
      aiStatus: AiStatus.DONE,
      createdAt: new Date(now - 30 * hourMs), // SLA Breached for High (>24h)
      lastActivityAt: new Date(now - 20 * hourMs),
      assignedToId: admin2.id,
      notes: ['Photos reviewed. Clear printing alignment defect from Delhi press. Approved for free reprint.'],
      messages: [
        {
          sender: MessageSender.ADMIN,
          senderUserId: admin2.id,
          body: 'Dear Vikram, we sincerely apologize for this printing defect. BookLeaf stands behind our print quality. Our quality team has verified the issue and authorized an expedited free reprint of all 20 copies via our in-house Delhi press. Your new copies will ship within 5-7 business days, and we will email your tracking details as soon as they dispatch.',
          wasAiDrafted: true,
          createdAt: new Date(now - 20 * hourMs),
        },
      ],
    },
    // 5. Distribution: Showing Currently Unavailable on Amazon (AUTH005 - Meera Nair - BK009)
    {
      ticketNumber: 'BL-1005',
      authorCode: 'AUTH005',
      bookCode: 'BK009',
      subject: 'Letters from Lakshadweep showing Currently Unavailable on Amazon',
      description: 'My book listing on Amazon US is showing as Currently Unavailable even though it was live last week. Could you please check stock synchronization?',
      status: TicketStatus.RESOLVED,
      category: Category.DISTRIBUTION_AVAILABILITY,
      aiCategory: Category.DISTRIBUTION_AVAILABILITY,
      priority: Priority.MEDIUM,
      aiPriority: Priority.MEDIUM,
      aiStatus: AiStatus.DONE,
      createdAt: new Date(now - 4 * dayMs),
      lastActivityAt: new Date(now - 1 * dayMs),
      resolvedAt: new Date(now - 1 * dayMs),
      assignedToId: admin1.id,
      notes: ['Triggered Ingram/Amazon inventory sync.'],
      messages: [
        {
          sender: MessageSender.ADMIN,
          senderUserId: admin1.id,
          body: 'Hello Meera, thank you for letting us know. This was a temporary stock catalog sync issue with Amazon US. We triggered a manual catalog re-sync with our distribution partner. The listing is now back in stock and active for ordering.',
          wasAiDrafted: true,
          createdAt: new Date(now - 1 * dayMs),
        },
      ],
    },
    // 6. Production: 3 weeks in typesetting, when done? (AUTH009 - Kavita Deshmukh - BK015)
    {
      ticketNumber: 'BL-1006',
      authorCode: 'AUTH009',
      bookCode: 'BK015',
      subject: 'Raising Roots has been in typesetting for 3 weeks',
      description: 'The production stage for Raising Roots has shown In Production - Typesetting for almost 3 weeks now without an update. When can I expect the interior proofs for review?',
      status: TicketStatus.OPEN,
      category: Category.BOOK_STATUS_PRODUCTION,
      aiCategory: Category.BOOK_STATUS_PRODUCTION,
      priority: Priority.MEDIUM,
      aiPriority: Priority.MEDIUM,
      aiStatus: AiStatus.DONE,
      createdAt: new Date(now - 5 * dayMs),
      lastActivityAt: new Date(now - 5 * dayMs),
      assignedToId: null, // Unassigned
      notes: ['Typesetter was waiting on author clarification regarding chapter index headers.'],
      messages: [],
    },
    // 7. General: Update book description on Amazon (AUTH008 - Farhan Sheikh - BK014)
    {
      ticketNumber: 'BL-1007',
      authorCode: 'AUTH008',
      bookCode: 'BK014',
      subject: 'Can I update my book description and author bio on Amazon?',
      description: 'Ghazal of the Forgotten is now published. I would like to revise the back-cover blurb and author bio shown on Amazon India. How do I submit the new text?',
      status: TicketStatus.RESOLVED,
      category: Category.GENERAL_INQUIRY,
      aiCategory: Category.GENERAL_INQUIRY,
      priority: Priority.LOW,
      aiPriority: Priority.LOW,
      aiStatus: AiStatus.DONE,
      createdAt: new Date(now - 6 * dayMs),
      lastActivityAt: new Date(now - 2 * dayMs),
      resolvedAt: new Date(now - 2 * dayMs),
      assignedToId: admin2.id,
      notes: ['Sent standard metadata update instructions.'],
      messages: [
        {
          sender: MessageSender.ADMIN,
          senderUserId: admin2.id,
          body: 'Hi Farhan, absolutely! You can update your book description and author bio at any time. Simply reply here with your revised blurb and bio, and our metadata team will push the update to Amazon and Flipkart. Once submitted, changes reflect across platforms within 3-5 business days.',
          wasAiDrafted: true,
          createdAt: new Date(now - 2 * dayMs),
        },
      ],
    },
    // 8. Production: Cover design delay (AUTH007 - Sneha Kulkarni - BK013)
    {
      ticketNumber: 'BL-1008',
      authorCode: 'AUTH007',
      bookCode: 'BK013',
      subject: 'Status of cover design concepts for Midnight in Mysore',
      description: 'I submitted my cover design brief two weeks ago for Midnight in Mysore. The status still says Cover Design. Could I get an update on when the first mockups will be ready?',
      status: TicketStatus.OPEN,
      category: Category.BOOK_STATUS_PRODUCTION,
      aiCategory: Category.BOOK_STATUS_PRODUCTION,
      priority: Priority.MEDIUM,
      aiPriority: Priority.MEDIUM,
      aiStatus: AiStatus.DONE,
      createdAt: new Date(now - 4 * dayMs),
      lastActivityAt: new Date(now - 4 * dayMs),
      assignedToId: admin1.id,
      notes: ['Design team has 2 drafts ready for author review.'],
      messages: [],
    },
    // 9. Royalty: Pending below ₹1,000 rollover (AUTH009 - Kavita Deshmukh - BK016)
    {
      ticketNumber: 'BL-1009',
      authorCode: 'AUTH009',
      bookCode: 'BK016',
      subject: 'Royalty payout question for The Nagpur Notebooks',
      description: 'I see ₹850 in pending royalty for The Nagpur Notebooks. Why was this not paid out in the latest cycle?',
      status: TicketStatus.OPEN,
      category: Category.ROYALTY_PAYMENTS,
      aiCategory: Category.ROYALTY_PAYMENTS,
      priority: Priority.LOW,
      aiPriority: Priority.LOW,
      aiStatus: AiStatus.DONE,
      createdAt: new Date(now - 2 * dayMs),
      lastActivityAt: new Date(now - 2 * dayMs),
      assignedToId: null, // Unassigned
      notes: ['Amount ₹850 is below minimum threshold ₹1,000. Will roll over.'],
      messages: [],
    },
    // 10. General Account Level: Bank account update request (AUTH006 - Arjun Malhotra - null book)
    {
      ticketNumber: 'BL-1010',
      authorCode: 'AUTH006',
      bookCode: null, // General / Account Level
      subject: 'Update bank details for upcoming quarterly royalty transfer',
      description: 'I have recently changed my primary bank account and want to ensure my upcoming payout for Turban Tales goes to the new account. Please provide instructions on how to submit the cancelled cheque.',
      status: TicketStatus.OPEN,
      category: Category.GENERAL_INQUIRY,
      aiCategory: Category.GENERAL_INQUIRY,
      priority: Priority.LOW,
      aiPriority: Priority.LOW,
      aiStatus: AiStatus.DONE,
      createdAt: new Date(now - 1 * dayMs),
      lastActivityAt: new Date(now - 1 * dayMs),
      assignedToId: admin2.id,
      notes: [],
      messages: [],
    },
    // 11. Printing: Misprint on first chapter (AUTH007 - Sneha Kulkarni - BK011)
    {
      ticketNumber: 'BL-1011',
      authorCode: 'AUTH007',
      bookCode: 'BK011',
      subject: 'Blurry text on Chapter 1 of The Algorithm of Love',
      description: 'Customer contacted me saying copies purchased on Flipkart had smudged ink on pages 12-15. We have sold over 1500 copies so this is alarming.',
      status: TicketStatus.IN_PROGRESS,
      category: Category.PRINTING_QUALITY,
      aiCategory: Category.PRINTING_QUALITY,
      priority: Priority.HIGH,
      aiPriority: Priority.HIGH,
      aiStatus: AiStatus.DONE,
      createdAt: new Date(now - 2 * dayMs),
      lastActivityAt: new Date(now - 1 * dayMs),
      assignedToId: admin1.id,
      notes: ['Contacted Repro India to check batch lot.'],
      messages: [],
    },
    // 12. ISBN: Duplicate barcode scanned at warehouse (AUTH010 - Diya Chatterjee - BK017)
    {
      ticketNumber: 'BL-1012',
      authorCode: 'AUTH010',
      bookCode: 'BK017',
      subject: 'ISBN question regarding reprint batch of Durga’s Daughters',
      description: 'Our bookstore partner noted that the barcode on the latest batch of Durga’s Daughters scanned as an older edition. Can you confirm the registered ISBN 978-93-5XXXX-17-2 is active?',
      status: TicketStatus.CLOSED,
      category: Category.ISBN_METADATA,
      aiCategory: Category.ISBN_METADATA,
      priority: Priority.HIGH,
      aiPriority: Priority.HIGH,
      aiStatus: AiStatus.DONE,
      createdAt: new Date(now - 10 * dayMs),
      lastActivityAt: new Date(now - 8 * dayMs),
      resolvedAt: new Date(now - 8 * dayMs),
      assignedToId: admin1.id,
      notes: ['Confirmed with ISBN registry; imprint matches correctly.'],
      messages: [
        {
          sender: MessageSender.ADMIN,
          senderUserId: admin1.id,
          body: 'Dear Diya, our production team verified the imprint registry for Durga’s Daughters. The ISBN 978-93-5XXXX-17-2 is valid and properly mapped to your title across all partner repositories. The scanner at the bookstore was using an outdated cached catalog which has now refreshed.',
          wasAiDrafted: true,
          createdAt: new Date(now - 8 * dayMs),
        },
      ],
    },
    // 13. Distribution: Flipkart buy button missing (AUTH010 - Diya Chatterjee - BK018)
    {
      ticketNumber: 'BL-1013',
      authorCode: 'AUTH010',
      bookCode: 'BK018',
      subject: 'Howrah Nights missing buy button on Flipkart',
      description: 'The book was published in January 2025. On Flipkart the listing says Item not deliverable to pin codes. Can you check distribution listing?',
      status: TicketStatus.OPEN,
      category: Category.DISTRIBUTION_AVAILABILITY,
      aiCategory: Category.DISTRIBUTION_AVAILABILITY,
      priority: Priority.HIGH,
      aiPriority: Priority.HIGH,
      aiStatus: AiStatus.DONE,
      createdAt: new Date(now - 18 * hourMs),
      lastActivityAt: new Date(now - 18 * hourMs),
      assignedToId: null, // Unassigned
      notes: [],
      messages: [],
    },
    // 14. Royalty: Large pending amount overdue (AUTH002 - Rohit Kapoor - BK004)
    {
      ticketNumber: 'BL-1014',
      authorCode: 'AUTH002',
      bookCode: 'BK004',
      subject: 'Overdue royalty payout of ₹7,744 for Startup Sutra',
      description: 'Startup Sutra has ₹7,744 in pending royalties. The last payout was November 2025. It has been over 3 months without an update and I have not received the Q4 transfer.',
      status: TicketStatus.OPEN,
      category: Category.ROYALTY_PAYMENTS,
      aiCategory: Category.ROYALTY_PAYMENTS,
      priority: Priority.HIGH,
      aiPriority: Priority.HIGH,
      aiStatus: AiStatus.DONE,
      createdAt: new Date(now - 48 * hourMs), // SLA Breached for High (>24h)
      lastActivityAt: new Date(now - 48 * hourMs),
      assignedToId: admin2.id,
      notes: ['Q4 royalty cycle batch payout pending banking processing.'],
      messages: [],
    },
  ];

  for (const t of demoTickets) {
    const authorRecord = authorMap.get(t.authorCode);
    if (!authorRecord) continue;

    const book = t.bookCode ? bookMap.get(t.bookCode) : null;

    const ticket = await prisma.ticket.upsert({
      where: { ticketNumber: t.ticketNumber },
      update: {
        authorId: authorRecord.author.id,
        bookId: book ? book.id : null,
        subject: t.subject,
        description: t.description,
        status: t.status,
        category: t.category,
        aiCategory: t.aiCategory,
        priority: t.priority,
        aiPriority: t.aiPriority,
        priorityOverriddenBy: t.priorityOverriddenBy || null,
        aiStatus: t.aiStatus,
        aiClassifiedAt: t.createdAt,
        assignedToId: t.assignedToId,
        createdAt: t.createdAt,
        lastActivityAt: t.lastActivityAt,
        resolvedAt: t.resolvedAt || null,
      },
      create: {
        ticketNumber: t.ticketNumber,
        authorId: authorRecord.author.id,
        bookId: book ? book.id : null,
        subject: t.subject,
        description: t.description,
        status: t.status,
        category: t.category,
        aiCategory: t.aiCategory,
        priority: t.priority,
        aiPriority: t.aiPriority,
        priorityOverriddenBy: t.priorityOverriddenBy || null,
        aiStatus: t.aiStatus,
        aiClassifiedAt: t.createdAt,
        assignedToId: t.assignedToId,
        createdAt: t.createdAt,
        lastActivityAt: t.lastActivityAt,
        resolvedAt: t.resolvedAt || null,
      },
    });

    // Create Initial Event
    await prisma.ticketEvent.create({
      data: {
        ticketId: ticket.id,
        actorId: authorRecord.user.id,
        type: 'CREATED',
        meta: { subject: t.subject, initialCategory: t.category, initialPriority: t.priority },
        createdAt: t.createdAt,
      },
    });

    // Create Internal Notes
    for (const note of t.notes) {
      await prisma.internalNote.create({
        data: {
          ticketId: ticket.id,
          adminId: admin1.id,
          body: note,
          createdAt: new Date(t.createdAt.getTime() + 10 * 60 * 1000),
        },
      });
      await prisma.ticketEvent.create({
        data: {
          ticketId: ticket.id,
          actorId: admin1.id,
          type: 'NOTE_ADDED',
          meta: { noteLength: note.length },
          createdAt: new Date(t.createdAt.getTime() + 10 * 60 * 1000),
        },
      });
    }

    // Create Messages
    for (const msg of t.messages) {
      await prisma.ticketMessage.create({
        data: {
          ticketId: ticket.id,
          sender: msg.sender,
          senderUserId: msg.senderUserId,
          body: msg.body,
          wasAiDrafted: msg.wasAiDrafted,
          createdAt: msg.createdAt,
        },
      });
      await prisma.ticketEvent.create({
        data: {
          ticketId: ticket.id,
          actorId: msg.senderUserId,
          type: 'REPLY_SENT',
          meta: { sender: msg.sender, wasAiDrafted: msg.wasAiDrafted },
          createdAt: msg.createdAt,
        },
      });
    }
  }

  console.log(`✅ Seeded ${demoTickets.length} realistic demo tickets with audit events.`);

  // 5. Seed initial AiLog entries for the admin dashboard
  const aiLogSamples = [
    { kind: 'CLASSIFY', model: 'claude-3-5-haiku-20241022', inTokens: 412, outTokens: 76, cost: 0.00045, ms: 820, success: true },
    { kind: 'CLASSIFY', model: 'claude-3-5-haiku-20241022', inTokens: 388, outTokens: 81, cost: 0.00043, ms: 740, success: true },
    { kind: 'DRAFT', model: 'claude-3-5-haiku-20241022', inTokens: 1140, outTokens: 310, cost: 0.00168, ms: 1420, success: true },
    { kind: 'CLASSIFY', model: 'claude-3-5-haiku-20241022', inTokens: 425, outTokens: 79, cost: 0.00046, ms: 790, success: true },
    { kind: 'DRAFT', model: 'claude-3-5-haiku-20241022', inTokens: 1220, outTokens: 345, cost: 0.00181, ms: 1510, success: true },
  ];

  for (const log of aiLogSamples) {
    await prisma.aiLog.create({
      data: {
        kind: log.kind,
        model: log.model,
        inputTokens: log.inTokens,
        outputTokens: log.outTokens,
        estimatedCostUsd: log.cost,
        latencyMs: log.ms,
        success: log.success,
      },
    });
  }

  console.log('✅ Seeded sample AiLog entries.');

  // 6. Print Credentials Table
  console.log('\n========================================================================');
  console.log('🎉 BOOKLEAF DEMO CREDENTIALS TABLE');
  console.log('========================================================================');
  console.log('ROLE    | EMAIL                     | PASSWORD     | DETAILS');
  console.log('------------------------------------------------------------------------');
  console.log('ADMIN   | admin@bookleaf.test       | Admin@123    | Primary Support Admin');
  console.log('ADMIN   | ops@bookleaf.test         | Admin@123    | Operations Lead');
  console.log('------------------------------------------------------------------------');
  for (const a of sampleData.authors) {
    console.log(`AUTHOR  | ${a.email.padEnd(25)} | Author@123   | ${a.author_id} - ${a.name} (${a.books.length} books)`);
  }
  console.log('========================================================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
