import { easeElastic, interpolateNumber, select } from 'd3';
import type { GSel, Ref, ResolvedProps } from './types';
import { addText, calculateRotation } from './utils';

export const drawNeedle = (
  resize: boolean,
  prevProps: ResolvedProps | null,
  props: ResolvedProps,
  width: Ref<number>,
  needle: Ref<GSel | null>,
  container: Ref<HTMLDivElement | null>,
  outerRadius: Ref<number>,
  g: Ref<GSel | null>,
): void => {
  const {
    percent,
    needleColor,
    needleBaseColor,
    hideText,
    animate,
    needleScale,
    textComponent,
    animDelay,
    animateDuration,
  } = props;

  const needleRadius = 15 * (width.current / 500);
  const centerPoint: [number, number] = [0, -needleRadius / 2];

  if (!needle.current) return;

  needle.current.selectAll('*').remove();
  needle.current.attr('transform', `translate(${outerRadius.current}, ${outerRadius.current})`);

  const prevPercent = prevProps ? prevProps.percent : 0;
  const pathStr = calculateRotation(prevPercent || percent, outerRadius, width, needleScale);
  needle.current.append('path').attr('d', pathStr).attr('fill', needleColor);
  needle.current
    .append('circle')
    .attr('cx', centerPoint[0])
    .attr('cy', centerPoint[1])
    .attr('r', needleRadius)
    .attr('fill', needleBaseColor);

  if (!hideText && !textComponent) {
    addText(percent, props, outerRadius, width, g);
  }

  if (!container.current) return;
  const containerSel = select(container.current);

  if (!resize && animate) {
    needle.current
      .transition()
      .delay(animDelay)
      .ease(easeElastic)
      .duration(animateDuration)
      .tween('progress', () => {
        const currentPercent = interpolateNumber(prevPercent, percent);
        return (percentOfPercent: number) => {
          const progress = currentPercent(percentOfPercent);
          containerSel.select('.needle path').attr('d', calculateRotation(progress, outerRadius, width, needleScale));
        };
      });
  } else {
    containerSel.select('.needle path').attr('d', calculateRotation(percent, outerRadius, width, needleScale));
  }
};
