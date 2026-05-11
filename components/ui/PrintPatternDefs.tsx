'use client';

import { useId } from 'react';

// Render <PrintPatternDefs> as a direct child of a Recharts chart component.
// It injects SVG <defs> inside that chart's SVG so the patterns are referenceable
// via fill="url(#id)".  Each pattern uses the bar's own fill color as its base
// with semi-transparent dark stripes on top — bars remain color-coded in color
// mode and are distinguishable by texture in B&W print.
interface PrintPatternDefsProps {
  fy1Id: string;
  fy2Id: string;
  fy1Color?: string;
  fy2Color?: string;
}

export function PrintPatternDefs({
  fy1Id,
  fy2Id,
  fy1Color = '#1D4ED8',
  fy2Color = '#F97316',
}: PrintPatternDefsProps) {
  return (
    <defs>
      {/* FY1: forward diagonal stripes ( //// ) over the bar color */}
      <pattern id={fy1Id} patternUnits="userSpaceOnUse" width="8" height="8">
        <rect width="8" height="8" fill={fy1Color} />
        <line x1="-2" y1="2" x2="2"  y2="-2" stroke="rgba(0,0,0,0.32)" strokeWidth="2" />
        <line x1="0"  y1="8" x2="8"  y2="0"  stroke="rgba(0,0,0,0.32)" strokeWidth="2" />
        <line x1="6"  y1="10" x2="10" y2="6" stroke="rgba(0,0,0,0.32)" strokeWidth="2" />
      </pattern>
      {/* FY2: crosshatch ( x ) over the bar color */}
      <pattern id={fy2Id} patternUnits="userSpaceOnUse" width="8" height="8">
        <rect width="8" height="8" fill={fy2Color} />
        <line x1="0" y1="8" x2="8" y2="0" stroke="rgba(0,0,0,0.32)" strokeWidth="2" />
        <line x1="0" y1="0" x2="8" y2="8" stroke="rgba(0,0,0,0.32)" strokeWidth="2" />
      </pattern>
    </defs>
  );
}

// Inline SVG swatch for use in chart legends.
// Defines the pattern within its own <svg> so it needs no external defs reference.
interface PatternSwatchProps {
  variant: 'fy1' | 'fy2';
  color?: string;
  size?: number;
}

export function PatternSwatch({ variant, color, size = 14 }: PatternSwatchProps) {
  const uid = useId();
  const id = `sw-${variant}-${uid}`.replace(/:/g, '');
  const base = color ?? (variant === 'fy1' ? '#1D4ED8' : '#F97316');

  return (
    <svg width={size} height={size} aria-hidden="true" style={{ display: 'inline-block', flexShrink: 0 }}>
      <defs>
        {variant === 'fy1' ? (
          <pattern id={id} patternUnits="userSpaceOnUse" width="8" height="8">
            <rect width="8" height="8" fill={base} />
            <line x1="-2" y1="2"  x2="2"  y2="-2" stroke="rgba(0,0,0,0.32)" strokeWidth="2" />
            <line x1="0"  y1="8"  x2="8"  y2="0"  stroke="rgba(0,0,0,0.32)" strokeWidth="2" />
            <line x1="6"  y1="10" x2="10" y2="6"  stroke="rgba(0,0,0,0.32)" strokeWidth="2" />
          </pattern>
        ) : (
          <pattern id={id} patternUnits="userSpaceOnUse" width="8" height="8">
            <rect width="8" height="8" fill={base} />
            <line x1="0" y1="8" x2="8" y2="0" stroke="rgba(0,0,0,0.32)" strokeWidth="2" />
            <line x1="0" y1="0" x2="8" y2="8" stroke="rgba(0,0,0,0.32)" strokeWidth="2" />
          </pattern>
        )}
      </defs>
      <rect width={size} height={size} fill={`url(#${id})`} stroke="rgba(0,0,0,0.15)" strokeWidth="0.75" rx="2" />
    </svg>
  );
}
