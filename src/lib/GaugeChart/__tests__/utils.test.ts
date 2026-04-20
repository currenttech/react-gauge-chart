import { describe, expect, it } from 'vitest';
import type { ArcDatum, ResolvedProps } from '../types';
import { floatingNumber, percentToRad, setArcData } from '../utils';

const baseProps: ResolvedProps = {
  style: {},
  marginInPercent: 0.05,
  cornerRadius: 6,
  nrOfLevels: 3,
  percent: 0.4,
  arcPadding: 0.05,
  arcWidth: 0.2,
  colors: ['#00FF00', '#FF0000'],
  textColor: '#FFFFFF',
  needleColor: '#464A4F',
  needleBaseColor: '#464A4F',
  hideText: false,
  animate: true,
  animDelay: 500,
  animateDuration: 3000,
  formatTextValue: null,
  fontSize: null,
  textComponent: null,
  needleScale: 0.55,
  customNeedleComponent: null,
};

const makeRefs = () => ({
  nbArcsToDisplay: { current: 0 },
  colorArray: { current: [] as string[] },
  arcData: { current: [] as ArcDatum[] },
});

describe('floatingNumber', () => {
  it('converts a 0-1 ratio to a rounded percentage', () => {
    expect(floatingNumber(0.5)).toBe(50);
    expect(floatingNumber(0.12345)).toBe(12.35);
  });

  it('honors the maxDigits argument', () => {
    expect(floatingNumber(0.12345, 0)).toBe(12);
    expect(floatingNumber(0.12345, 4)).toBe(12.345);
  });
});

describe('percentToRad', () => {
  it('maps 0 to 0, 0.5 to pi/2, 1 to pi', () => {
    expect(percentToRad(0)).toBe(0);
    expect(percentToRad(0.5)).toBeCloseTo(Math.PI / 2);
    expect(percentToRad(1)).toBeCloseTo(Math.PI);
  });
});

describe('setArcData', () => {
  it('uses nrOfLevels when arcsLength is not set', () => {
    const refs = makeRefs();
    setArcData({ ...baseProps, nrOfLevels: 5 }, refs.nbArcsToDisplay, refs.colorArray, refs.arcData);
    expect(refs.nbArcsToDisplay.current).toBe(5);
    expect(refs.arcData.current).toHaveLength(5);
    expect(refs.arcData.current.every((d) => d.value === 1)).toBe(true);
  });

  it('prefers arcsLength over nrOfLevels and uses its values', () => {
    const refs = makeRefs();
    setArcData(
      { ...baseProps, nrOfLevels: 99, arcsLength: [0.3, 0.5, 0.2] },
      refs.nbArcsToDisplay,
      refs.colorArray,
      refs.arcData,
    );
    expect(refs.nbArcsToDisplay.current).toBe(3);
    expect(refs.arcData.current.map((d) => d.value)).toEqual([0.3, 0.5, 0.2]);
  });

  it('passes colors through unchanged when count matches', () => {
    const refs = makeRefs();
    const colors = ['#111111', '#222222', '#333333'];
    setArcData({ ...baseProps, nrOfLevels: 3, colors }, refs.nbArcsToDisplay, refs.colorArray, refs.arcData);
    expect(refs.colorArray.current).toEqual(colors);
    expect(refs.arcData.current.map((d) => d.color)).toEqual(colors);
  });

  it('interpolates colors when count does not match nrOfLevels', () => {
    const refs = makeRefs();
    setArcData(
      { ...baseProps, nrOfLevels: 5, colors: ['#00FF00', '#FF0000'] },
      refs.nbArcsToDisplay,
      refs.colorArray,
      refs.arcData,
    );
    expect(refs.colorArray.current).toHaveLength(5);
    expect(refs.colorArray.current.every((c) => typeof c === 'string' && c.length > 0)).toBe(true);
  });
});
