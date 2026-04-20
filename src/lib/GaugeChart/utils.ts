import { interpolateHsl, scaleLinear } from 'd3';
import type { ArcDatum, GSel, Margin, Ref, ResolvedProps } from './types';

export const calculateRadius = (
  width: Ref<number>,
  height: Ref<number>,
  outerRadius: Ref<number>,
  margin: Ref<Margin>,
  g: Ref<GSel | null>,
): void => {
  if (width.current < 2 * height.current) {
    outerRadius.current = (width.current - margin.current.left - margin.current.right) / 2;
  } else {
    outerRadius.current = height.current - margin.current.top - margin.current.bottom;
  }
  centerGraph(width, g, outerRadius, margin);
};

export const centerGraph = (
  width: Ref<number>,
  g: Ref<GSel | null>,
  outerRadius: Ref<number>,
  margin: Ref<Margin>,
): void => {
  margin.current.left = width.current / 2 - outerRadius.current + margin.current.right;
  g.current?.attr('transform', `translate(${margin.current.left}, ${margin.current.top})`);
};

export const updateDimensions = (
  props: ResolvedProps,
  container: Ref<HTMLDivElement | null>,
  margin: Ref<Margin>,
  width: Ref<number>,
  height: Ref<number>,
): void => {
  const { marginInPercent } = props;
  if (!container.current) return;
  const { width: divWidth, height: divHeight } = container.current.getBoundingClientRect();

  margin.current.left = divWidth * marginInPercent;
  margin.current.right = divWidth * marginInPercent;
  width.current = divWidth - margin.current.left - margin.current.right;

  margin.current.top = divHeight * marginInPercent;
  margin.current.bottom = divHeight * marginInPercent;
  height.current = width.current / 2 - margin.current.top - margin.current.bottom;
};

export const calculateRotation = (
  percent: number,
  outerRadius: Ref<number>,
  width: Ref<number>,
  needleScale: number,
): string => {
  const needleLength = outerRadius.current * needleScale;
  const needleRadius = 15 * (width.current / 500);
  const theta = percentToRad(percent);
  const centerPoint: [number, number] = [0, -needleRadius / 2];
  const topPoint: [number, number] = [
    centerPoint[0] - needleLength * Math.cos(theta),
    centerPoint[1] - needleLength * Math.sin(theta),
  ];
  const leftPoint: [number, number] = [
    centerPoint[0] - needleRadius * Math.cos(theta - Math.PI / 2),
    centerPoint[1] - needleRadius * Math.sin(theta - Math.PI / 2),
  ];
  const rightPoint: [number, number] = [
    centerPoint[0] - needleRadius * Math.cos(theta + Math.PI / 2),
    centerPoint[1] - needleRadius * Math.sin(theta + Math.PI / 2),
  ];
  return `M ${leftPoint[0]} ${leftPoint[1]} L ${topPoint[0]} ${topPoint[1]} L ${rightPoint[0]} ${rightPoint[1]}`;
};

export const addText = (
  percentage: number,
  props: ResolvedProps,
  outerRadius: Ref<number>,
  width: Ref<number>,
  g: Ref<GSel | null>,
): void => {
  const { formatTextValue, fontSize, textColor } = props;
  const textPadding = 20;
  const text = formatTextValue ? formatTextValue(floatingNumber(percentage)) : `${floatingNumber(percentage)}%`;
  g.current
    ?.append('g')
    .attr('class', 'text-group')
    .attr('transform', `translate(${outerRadius.current}, ${outerRadius.current / 2 + textPadding})`)
    .append('text')
    .text(text)
    .style('font-size', () => fontSize ?? `${width.current / 11 / (text.length > 10 ? text.length / 10 : 1)}px`)
    .style('fill', textColor)
    .style('text-anchor', 'middle');
};

export const setArcData = (
  props: ResolvedProps,
  nbArcsToDisplay: Ref<number>,
  colorArray: Ref<string[]>,
  arcData: Ref<ArcDatum[]>,
): void => {
  const arcsLength = props.arcsLength;
  nbArcsToDisplay.current = arcsLength ? arcsLength.length : props.nrOfLevels;

  if (nbArcsToDisplay.current === props.colors.length) {
    colorArray.current = props.colors;
  } else {
    colorArray.current = getColors(props, nbArcsToDisplay.current);
  }

  const data: ArcDatum[] = [];
  for (let i = 0; i < nbArcsToDisplay.current; i++) {
    data.push({
      value: arcsLength && arcsLength.length > i ? (arcsLength[i] ?? 1) : 1,
      color: colorArray.current[i] ?? '#000000',
    });
  }
  arcData.current = data;
};

const getColors = (props: ResolvedProps, nb: number): string[] => {
  const { colors } = props;
  const first = colors[0] ?? '#00FF00';
  const last = colors[colors.length - 1] ?? '#FF0000';
  const colorScale = scaleLinear<string>().domain([1, nb]).range([first, last]).interpolate(interpolateHsl);
  const out: string[] = [];
  for (let i = 1; i <= nb; i++) out.push(colorScale(i));
  return out;
};

export const floatingNumber = (value: number, maxDigits = 2): number =>
  Math.round(value * 100 * 10 ** maxDigits) / 10 ** maxDigits;

export const percentToRad = (percent: number): number => percent * Math.PI;
