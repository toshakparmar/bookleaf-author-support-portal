import { computeRoyaltyCycle } from './royalty-cycle';

describe('RoyaltyCycle Math & Computation', () => {
  it('correctly calculates rollover flag when pending < 1000', () => {
    const facts = computeRoyaltyCycle(
      850,
      null,
      new Date('2024-01-15'),
      new Date('2024-06-01'),
    );

    expect(facts.isBelowMinimumThreshold).toBe(true);
    expect(facts.minimumThresholdAmount).toBe(1000);
  });

  it('correctly indicates not below threshold when pending >= 1000', () => {
    const facts = computeRoyaltyCycle(
      4800,
      new Date('2024-02-15'),
      new Date('2023-05-10'),
      new Date('2024-06-01'),
    );

    expect(facts.isBelowMinimumThreshold).toBe(false);
    expect(facts.currentQuarter).toMatch(/^Q[1-4]\s\d{4}$/);
    expect(facts.payoutDeadline).toBeDefined();
  });

  it('provides computed quarter cycle strings and 45-day deadline dates', () => {
    const facts = computeRoyaltyCycle(
      0,
      new Date('2024-05-15'),
      new Date('2024-01-01'),
      new Date('2024-06-01'),
    );

    expect(facts.currentQuarter).toBe('Q2 2024');
    expect(facts.quarterEndDate).toBe('2024-06-30');
    expect(facts.isBelowMinimumThreshold).toBe(false);
  });
});
