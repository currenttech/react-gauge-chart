import type { Arc, DefaultArcObject, Pie, PieArcDatum } from 'd3';
import type { ArcDatum, GSel, Margin, Ref, ResolvedProps, SVGSel } from './types';
import { calculateRadius, updateDimensions } from './utils';

export const renderChart = (
  width: Ref<number>,
  margin: Ref<Margin>,
  height: Ref<number>,
  outerRadius: Ref<number>,
  g: Ref<GSel | null>,
  doughnut: Ref<GSel | null>,
  arcChart: Ref<Arc<unknown, DefaultArcObject>>,
  pieChart: Ref<Pie<unknown, ArcDatum>>,
  svg: Ref<SVGSel | null>,
  props: ResolvedProps,
  container: Ref<HTMLDivElement | null>,
  arcData: Ref<ArcDatum[]>,
): void => {
  updateDimensions(props, container, margin, width, height);

  svg.current
    ?.attr('width', width.current + margin.current.left + margin.current.right)
    .attr('height', height.current + margin.current.top + margin.current.bottom);
  g.current?.attr('transform', `translate(${margin.current.left}, ${margin.current.top})`);

  calculateRadius(width, height, outerRadius, margin, g);

  doughnut.current?.attr('transform', `translate(${outerRadius.current}, ${outerRadius.current})`);

  arcChart.current
    .outerRadius(outerRadius.current)
    .innerRadius(outerRadius.current * (1 - props.arcWidth))
    .cornerRadius(props.cornerRadius)
    .padAngle(props.arcPadding);

  doughnut.current?.selectAll('.arc').remove();
  g.current?.selectAll('.text-group').remove();

  const arcPaths = doughnut.current
    ?.selectAll('.arc')
    .data(pieChart.current(arcData.current) as PieArcDatum<ArcDatum>[])
    .enter()
    .append('g')
    .attr('class', 'arc');
  arcPaths
    ?.append('path')
    .attr('d', (d) => arcChart.current(d as unknown as DefaultArcObject))
    .style('fill', (d) => (d as PieArcDatum<ArcDatum>).data.color);
};
