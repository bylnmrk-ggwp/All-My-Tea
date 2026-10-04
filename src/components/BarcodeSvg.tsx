import React, { useId } from 'react';

interface BarcodeSvgProps {
  sku: string;
  className?: string;
  height?: number;
}

export const BarcodeSvg: React.FC<BarcodeSvgProps> = ({ sku, className = '', height = 48 }) => {
  const maskId = useId();
  // Deterministic bar widths based on SKU character codes
  const generateBars = (code: string) => {
    const bars: { width: number; isBlack: boolean }[] = [];
    // Start quiet zone + guard bars
    bars.push({ width: 2, isBlack: true });
    bars.push({ width: 1, isBlack: false });
    bars.push({ width: 2, isBlack: true });

    for (let i = 0; i < code.length; i++) {
      const charCode = code.charCodeAt(i);
      const pattern = [(charCode % 3) + 1, ((charCode >> 1) % 3) + 1, ((charCode >> 2) % 3) + 1, 1];
      bars.push({ width: pattern[0], isBlack: false });
      bars.push({ width: pattern[1], isBlack: true });
      bars.push({ width: pattern[2], isBlack: false });
      bars.push({ width: pattern[3], isBlack: true });
    }

    // Stop guard bars
    bars.push({ width: 2, isBlack: true });
    bars.push({ width: 1, isBlack: false });
    bars.push({ width: 2, isBlack: true });

    return bars;
  };

  const bars = generateBars(sku || 'SKU-0000');
  const totalWidth = bars.reduce((acc, b) => acc + b.width, 0);

  let currentX = 0;

  return (
    <div className={`inline-flex flex-col items-center bg-white p-2.5 rounded border border-neutral-200 ${className}`}>
      <svg
        viewBox={`0 0 ${totalWidth} 40`}
        height={height}
        className="w-full max-w-[200px]"
        preserveAspectRatio="none"
        aria-label={`Barcode for ${sku}`}
      >
        <g id={maskId}>
          {bars.map((bar, idx) => {
            const x = currentX;
            currentX += bar.width;
            if (!bar.isBlack) return null;
            return <rect key={idx} x={x} y="0" width={bar.width} height="40" fill="#171717" />;
          })}
        </g>
      </svg>
      <span className="mt-1 font-mono text-[11px] tracking-widest text-neutral-600 font-semibold select-all">
        {sku}
      </span>
    </div>
  );
};
