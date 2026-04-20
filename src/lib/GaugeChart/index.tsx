import { type Arc, arc, type DefaultArcObject, type Pie, pie, select } from 'd3';
import { type CSSProperties, useEffect, useLayoutEffect, useRef } from 'react';
import { drawNeedle } from './drawNeedle';
import { renderChart } from './renderChart';
import type { ArcDatum, GaugeChartProps, Margin, ResolvedProps } from './types';
import { useDeepCompareEffect } from './useDeepCompareEffect';
import { setArcData } from './utils';

const startAngle = -Math.PI / 2;
const endAngle = Math.PI / 2;

const defaultStyle: CSSProperties = { width: '100%' };

const ANIMATE_KEYS = [
  'marginInPercent',
  'arcPadding',
  'percent',
  'nrOfLevels',
  'animDelay',
] as const satisfies readonly (keyof ResolvedProps)[];

export const GaugeChart = ({
  id,
  className,
  style = defaultStyle,
  marginInPercent = 0.05,
  cornerRadius = 6,
  nrOfLevels = 3,
  percent = 0.4,
  arcPadding = 0.05,
  arcWidth = 0.2,
  arcsLength,
  colors = ['#00FF00', '#FF0000'],
  textColor = '#FFFFFF',
  needleColor = '#464A4F',
  needleBaseColor = '#464A4F',
  hideText = false,
  animate = true,
  animDelay = 500,
  animateDuration = 3000,
  formatTextValue = null,
  fontSize = null,
  textComponent = null,
  textComponentContainerClassName,
  needleScale = 0.55,
  customNeedleComponent = null,
  customNeedleComponentClassName,
  customNeedleStyle,
}: GaugeChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<ReturnType<typeof select<SVGSVGElement, unknown>> | null>(null);
  const gRef = useRef<ReturnType<typeof select<SVGGElement, unknown>> | null>(null);
  const doughnutRef = useRef<ReturnType<typeof select<SVGGElement, unknown>> | null>(null);
  const needleRef = useRef<ReturnType<typeof select<SVGGElement, unknown>> | null>(null);

  const widthRef = useRef<number>(0);
  const heightRef = useRef<number>(0);
  const outerRadiusRef = useRef<number>(0);
  const marginRef = useRef<Margin>({ top: 0, right: 0, bottom: 0, left: 0 });
  const nbArcsToDisplay = useRef<number>(0);
  const colorArray = useRef<string[]>([]);
  const arcData = useRef<ArcDatum[]>([]);

  // Lazy init — d3 generators are created once per component instance.
  const arcChartRef = useRef<Arc<unknown, DefaultArcObject> | null>(null);
  if (arcChartRef.current === null) {
    arcChartRef.current = arc();
  }
  const pieChartRef = useRef<Pie<unknown, ArcDatum> | null>(null);
  if (pieChartRef.current === null) {
    pieChartRef.current = pie<ArcDatum>()
      .value((d) => d.value)
      .startAngle(startAngle)
      .endAngle(endAngle)
      .sort(null);
  }

  const prevPropsRef = useRef<ResolvedProps | null>(null);

  // Fresh resolved-props object per render. NOT used as an effect dep.
  const props: ResolvedProps = {
    id,
    className,
    style,
    marginInPercent,
    cornerRadius,
    nrOfLevels,
    percent,
    arcPadding,
    arcWidth,
    arcsLength,
    colors,
    textColor,
    needleColor,
    needleBaseColor,
    hideText,
    animate,
    animDelay,
    animateDuration,
    formatTextValue,
    fontSize,
    textComponent,
    textComponentContainerClassName,
    needleScale,
    customNeedleComponent,
    customNeedleComponentClassName,
    customNeedleStyle,
  };

  const buildChart = (update: boolean, resize: boolean, prev: ResolvedProps | null): void => {
    const arcChart = arcChartRef.current as Arc<unknown, DefaultArcObject>;
    const pieChart = pieChartRef.current as Pie<unknown, ArcDatum>;
    const arcChartHolder = { current: arcChart };
    const pieChartHolder = { current: pieChart };

    if (!update) {
      if (!containerRef.current) return;
      const containerSel = select(containerRef.current);
      containerSel.select('svg').remove();
      const newSvg = containerSel.append('svg');
      const newG = newSvg.append('g');
      const newDoughnut = newG.append('g').attr('class', 'doughnut');
      const newNeedle = newG.append('g').attr('class', 'needle');
      svgRef.current = newSvg;
      gRef.current = newG;
      doughnutRef.current = newDoughnut;
      needleRef.current = newNeedle;
    }

    renderChart(
      widthRef,
      marginRef,
      heightRef,
      outerRadiusRef,
      gRef,
      doughnutRef,
      arcChartHolder,
      pieChartHolder,
      svgRef,
      props,
      containerRef,
      arcData,
    );

    if (!customNeedleComponent) {
      drawNeedle(resize, prev, props, widthRef, needleRef, containerRef, outerRadiusRef, gRef);
    }
  };

  // Keep a ref to the latest buildChart so one-time effects (mount, resize) always
  // call through to the current render's props without re-subscribing.
  const buildChartRef = useRef(buildChart);
  buildChartRef.current = buildChart;

  // Mount-once: build the SVG, do initial render, animate from 0.
  // biome-ignore lint/correctness/useExhaustiveDependencies: mount-once by design; subsequent updates are handled by the deep-compare effect below
  useLayoutEffect(() => {
    const el = containerRef.current;
    setArcData(props, nbArcsToDisplay, colorArray, arcData);
    buildChartRef.current(false, false, null);
    prevPropsRef.current = props;
    return () => {
      if (el) select(el).select('svg').remove();
    };
  }, []);

  // Updates: re-render only when arc structure or needle position actually changes.
  useDeepCompareEffect(() => {
    const prev = prevPropsRef.current;
    if (!prev) return;
    setArcData(props, nbArcsToDisplay, colorArray, arcData);
    const shouldAnimate = ANIMATE_KEYS.some((k) => prev[k] !== props[k]);
    buildChartRef.current(true, !shouldAnimate, prev);
    prevPropsRef.current = props;
  }, [nrOfLevels, arcsLength, colors, percent, needleColor, needleBaseColor]);

  // Window resize: re-render without animation, always using the latest build closure.
  useEffect(() => {
    const onResize = () => buildChartRef.current(true, true, prevPropsRef.current);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div id={id} className={className} style={style}>
      <div ref={containerRef}>
        <div className={textComponentContainerClassName} style={{ position: 'relative', top: '50%' }}>
          {textComponent}
        </div>
      </div>
      {customNeedleComponent && (
        <div className={customNeedleComponentClassName} style={{ position: 'relative', ...customNeedleStyle }}>
          {customNeedleComponent}
        </div>
      )}
    </div>
  );
};

export default GaugeChart;
