import type { CSSProperties, ReactElement } from 'react';

export interface GaugeChartProps {
  id?: string;
  className?: string;
  style?: CSSProperties;
  marginInPercent?: number;
  cornerRadius?: number;
  nrOfLevels?: number;
  percent?: number;
  arcPadding?: number;
  arcWidth?: number;
  arcsLength?: number[];
  colors?: string[];
  textColor?: string;
  needleColor?: string;
  needleBaseColor?: string;
  hideText?: boolean;
  animate?: boolean;
  animDelay?: number;
  animateDuration?: number;
  formatTextValue?: ((value: number) => string) | null;
  fontSize?: string | null;
  textComponent?: ReactElement | null;
  textComponentContainerClassName?: string;
  needleScale?: number;
  customNeedleComponent?: ReactElement | null;
  customNeedleComponentClassName?: string;
  customNeedleStyle?: CSSProperties;
}

export interface ArcDatum {
  value: number;
  color: string;
}

export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ResolvedProps {
  id?: string;
  className?: string;
  style: CSSProperties;
  marginInPercent: number;
  cornerRadius: number;
  nrOfLevels: number;
  percent: number;
  arcPadding: number;
  arcWidth: number;
  arcsLength?: number[];
  colors: string[];
  textColor: string;
  needleColor: string;
  needleBaseColor: string;
  hideText: boolean;
  animate: boolean;
  animDelay: number;
  animateDuration: number;
  formatTextValue: ((value: number) => string) | null;
  fontSize: string | null;
  textComponent: ReactElement | null;
  textComponentContainerClassName?: string;
  needleScale: number;
  customNeedleComponent: ReactElement | null;
  customNeedleComponentClassName?: string;
  customNeedleStyle?: CSSProperties;
}

export type Ref<T> = { current: T };
export type D3Selection<E extends Element> = import('d3').Selection<E, unknown, null, undefined>;
export type SVGSel = D3Selection<SVGSVGElement>;
export type GSel = D3Selection<SVGGElement>;
export type DivSel = D3Selection<HTMLDivElement>;
