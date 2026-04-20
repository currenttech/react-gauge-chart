# react-gauge-chart

React component for displaying a gauge chart, built with D3.js. This is a
modernized TypeScript fork of [Martin36/react-gauge-chart][upstream] with
`prop-types` removed, a strict `tsup` build (ESM + CJS + `.d.ts`), React 18/19
peer-dep range, and the long-standing remount-on-rerender bug fixed.

[upstream]: https://github.com/Martin36/react-gauge-chart

## Install

```sh
npm install react-gauge-chart
```

Peer dependencies: `react` and `react-dom` >= 18, < 20.

## Usage

```tsx
import GaugeChart from 'react-gauge-chart';

<GaugeChart id="gauge-chart1" />
```

### Examples

```tsx
// 20 levels, pointer at 86%
<GaugeChart id="gauge-chart2" nrOfLevels={20} percent={0.86} />

// Custom colors and larger arc width
<GaugeChart
  id="gauge-chart3"
  nrOfLevels={30}
  colors={['#FF5F6D', '#FFC371']}
  arcWidth={0.3}
  percent={0.37}
/>

// Custom arcs width (arcsLength overrides nrOfLevels)
<GaugeChart
  id="gauge-chart5"
  arcsLength={[0.3, 0.5, 0.2]}
  colors={['#5BE12C', '#F5CD19', '#EA4228']}
  percent={0.37}
  arcPadding={0.02}
/>

// Disabled animation
<GaugeChart
  id="gauge-chart6"
  animate={false}
  nrOfLevels={15}
  percent={0.56}
  needleColor="#345243"
/>

// Formatted text value
<GaugeChart
  id="gauge-chart8"
  percent={0.37}
  formatTextValue={(v) => `${v}kbit/s`}
/>
```

## Props

The component exports a `GaugeChartProps` interface:

```ts
import type { GaugeChartProps } from 'react-gauge-chart';
```

| Prop                              | Type                              | Default                | Description                                                           |
| --------------------------------- | --------------------------------- | ---------------------- | --------------------------------------------------------------------- |
| `id`                              | `string`                          | —                      | `id` applied to the outer `<div>`.                                    |
| `className`                       | `string`                          | —                      | `className` applied to the outer `<div>`.                             |
| `style`                           | `CSSProperties`                   | `{ width: '100%' }`    | Style applied to the outer `<div>`.                                   |
| `marginInPercent`                 | `number`                          | `0.05`                 | Chart margin inside the SVG.                                          |
| `cornerRadius`                    | `number`                          | `6`                    | Corner radius of the arc segments.                                    |
| `nrOfLevels`                      | `number`                          | `3`                    | Number of arc segments. Ignored when `arcsLength` is set.             |
| `percent`                         | `number`                          | `0.4`                  | Needle target value between 0 and 1.                                  |
| `arcPadding`                      | `number`                          | `0.05`                 | Gap between arc segments (radians).                                   |
| `arcWidth`                        | `number`                          | `0.2`                  | Arc thickness as a fraction of radius.                                |
| `arcsLength`                      | `number[]`                        | —                      | Explicit per-arc lengths. Overrides `nrOfLevels`.                     |
| `colors`                          | `string[]`                        | `['#00FF00','#FF0000']`| Arc colors. Interpolated if count ≠ `nrOfLevels`.                     |
| `textColor`                       | `string`                          | `'#FFFFFF'`            | Default text color.                                                   |
| `fontSize`                        | `string \| null`                  | `null` (auto)          | Explicit text size.                                                   |
| `needleColor`                     | `string`                          | `'#464A4F'`            | Needle triangle color.                                                |
| `needleBaseColor`                 | `string`                          | `'#464A4F'`            | Needle base circle color.                                             |
| `hideText`                        | `boolean`                         | `false`                | Hide the default percentage text.                                     |
| `animate`                         | `boolean`                         | `true`                 | Animate the needle on mount/update.                                   |
| `animDelay`                       | `number`                          | `500`                  | Animation delay in ms.                                                |
| `animateDuration`                 | `number`                          | `3000`                 | Animation duration in ms.                                             |
| `formatTextValue`                 | `(v: number) => string \| null`   | `null`                 | Format the default text value.                                        |
| `textComponent`                   | `ReactElement \| null`            | `null`                 | Replace the default text with a custom element.                       |
| `textComponentContainerClassName` | `string`                          | —                      | `className` for the text container.                                   |
| `needleScale`                     | `number`                          | `0.55`                 | Needle length as a fraction of the arc radius.                        |
| `customNeedleComponent`           | `ReactElement \| null`            | `null`                 | Replace the SVG needle with a custom element (rotate it yourself).    |
| `customNeedleComponentClassName`  | `string`                          | —                      | `className` for the custom-needle container.                          |
| `customNeedleStyle`               | `CSSProperties`                   | —                      | Style for the custom-needle container.                                |

### Notes on colors

Colors can be passed two ways:

- **Exact count** — `colors.length === nrOfLevels` (or `arcsLength.length`): each arc gets the corresponding color.
- **Endpoint count** — any other length: the first and last entries are taken as endpoints and remaining arcs are filled via [`d3.interpolateHsl`](https://github.com/d3/d3-interpolate#interpolateHsl).

### Warning

Do not reuse the same `id` for multiple charts on a page — d3 selectors will collide.

## Development

```sh
npm install
npm run typecheck
npm run lint
npm run test
npm run build
```

The library build emits to `dist/`:

- `dist/index.js` — ESM
- `dist/index.cjs` — CJS
- `dist/index.d.ts` — types
