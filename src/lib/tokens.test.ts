import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('brand tokens', () => {
  const css = readFileSync(resolve(__dirname, '../index.css'), 'utf8');

  it('defines the brand palette exactly', () => {
    expect(css).toContain('--color-brand-500: #F2B64B');
    expect(css).toContain('--color-brand-700: #C98A2E');
    expect(css).toContain('--color-brown-700: #7A3E12');
    expect(css).toContain('--color-brown-900: #2B1B10');
    expect(css).toContain('--color-cream-50: #FFF8EC');
    expect(css).toContain('--color-stone-100: #F4F2EE');
    expect(css).toContain('--color-stone-300: #E4DFD6');
  });

  it('defines radius and font tokens', () => {
    expect(css).toContain('--radius-panel: 10px');
    expect(css).toContain('--radius-control: 6px');
    expect(css).toContain("--font-display: 'Fraunces'");
  });

  it('no longer carries the unused shadcn variable block', () => {
    expect(css).not.toContain('--popover-foreground');
    expect(css).not.toContain('.dark');
  });
});
