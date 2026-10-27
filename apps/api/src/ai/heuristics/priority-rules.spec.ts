import { evaluatePriorityRules } from './priority-rules';
import { Priority, Category } from '@prisma/client';

describe('PriorityRules Deterministic Safety Net', () => {
  it('enforces CRITICAL floor when legal or consumer court is threatened', () => {
    const res = evaluatePriorityRules(
      Priority.LOW,
      Category.ROYALTY_PAYMENTS,
      'Will take consumer court legal action if not paid',
      'I have not received my royalty and my lawyer will send a notice',
    );
    expect(res.finalPriority).toBe(Priority.CRITICAL);
    expect(res.ruleFloor).toBe(Priority.CRITICAL);
    expect(res.ruleTriggered).toBeDefined();
  });

  it('enforces CRITICAL floor when royalty is unpaid for 6+ months', () => {
    const res = evaluatePriorityRules(
      Priority.MEDIUM,
      Category.ROYALTY_PAYMENTS,
      'Haven not received royalty in 7 months',
      'Published in January and haven not received anything for 7 months',
    );
    expect(res.finalPriority).toBe(Priority.CRITICAL);
  });

  it('enforces HIGH floor for ISBN duplicate/wrong errors per BookLeaf policy', () => {
    const res = evaluatePriorityRules(
      Priority.LOW,
      Category.ISBN_METADATA,
      'Wrong duplicate ISBN on Amazon listing',
      'The book has different ISBN printed on back cover versus Amazon store',
    );
    expect(res.finalPriority).toBe(Priority.HIGH);
  });

  it('respects higher AI priority if AI priority exceeds rule floor', () => {
    const res = evaluatePriorityRules(
      Priority.HIGH,
      Category.GENERAL_INQUIRY,
      'General question',
      'Inquiring about publishing next book',
    );
    expect(res.finalPriority).toBe(Priority.HIGH);
  });
});
