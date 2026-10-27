import * as fs from 'fs';
import * as path from 'path';

describe('Security Leak Audit', () => {
  it('ensures no Anthropic or OpenAI API keys are committed in code or frontend', () => {
    const rootDir = path.resolve(__dirname, '../../..');

    const checkDir = (dir: string): string[] => {
      let findings: string[] = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (
          entry.name === 'node_modules' ||
          entry.name === '.git' ||
          entry.name === 'dist' ||
          entry.name === '.next' ||
          entry.name === '.env' // Local active dev env file
        ) {
          continue;
        }

        if (entry.isDirectory()) {
          findings = findings.concat(checkDir(fullPath));
        } else if (
          entry.isFile() &&
          /\.(ts|tsx|js|jsx|json|md|html)$/.test(entry.name) &&
          !entry.name.includes('.env.example')
        ) {
          const content = fs.readFileSync(fullPath, 'utf8');

          // Check for live sk-ant- or sk-proj- live key patterns
          if (/sk-ant-api03-[A-Za-z0-9_-]{20,}/.test(content)) {
            findings.push(`Live Anthropic key leaked in: ${fullPath}`);
          }
          if (/sk-proj-[A-Za-z0-9_-]{20,}/.test(content)) {
            findings.push(`Live OpenAI key leaked in: ${fullPath}`);
          }
        }
      }

      return findings;
    };

    const leaks = checkDir(rootDir);
    expect(leaks).toEqual([]);
  });
});
