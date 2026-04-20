import { act, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GaugeChart } from '../index';

describe('<GaugeChart />', () => {
  it('mounts and renders an svg with an arc and a needle group', () => {
    const { container } = render(<GaugeChart percent={0.5} animate={false} />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(container.querySelector('g.doughnut')).not.toBeNull();
    expect(container.querySelector('g.needle')).not.toBeNull();
  });

  it('renders default text (hideText=false) and hides it when hideText=true', () => {
    const { container: shown } = render(<GaugeChart percent={0.37} animate={false} />);
    expect(shown.querySelector('text')?.textContent).toMatch(/%/);

    const { container: hidden } = render(<GaugeChart percent={0.37} animate={false} hideText />);
    expect(hidden.querySelector('text')).toBeNull();
  });

  it('applies formatTextValue', () => {
    const { container } = render(<GaugeChart percent={0.37} animate={false} formatTextValue={(v) => `${v}kbit/s`} />);
    expect(container.querySelector('text')?.textContent).toBe('37kbit/s');
  });

  it('does not remount the svg when an unrelated prop changes (regression: remount bug)', () => {
    const { container, rerender } = render(<GaugeChart percent={0.5} animate={false} />);
    const svgBefore = container.querySelector('svg');
    expect(svgBefore).not.toBeNull();

    act(() => {
      // new style object identity — would have remounted under old useMemo logic
      rerender(<GaugeChart percent={0.5} animate={false} style={{ width: '100%' }} />);
    });

    const svgAfter = container.querySelector('svg');
    expect(svgAfter).toBe(svgBefore);
  });

  it('renders a custom text component in place of the default text', () => {
    const { container } = render(
      <GaugeChart percent={0.5} animate={false} textComponent={<span data-testid='custom-text'>hello</span>} />,
    );
    expect(container.querySelector('[data-testid="custom-text"]')).not.toBeNull();
    expect(container.querySelector('text')).toBeNull();
  });

  it('renders a custom needle component alongside the svg', () => {
    const { container } = render(
      <GaugeChart percent={0.5} animate={false} customNeedleComponent={<span data-testid='custom-needle' />} />,
    );
    expect(container.querySelector('[data-testid="custom-needle"]')).not.toBeNull();
  });
});
