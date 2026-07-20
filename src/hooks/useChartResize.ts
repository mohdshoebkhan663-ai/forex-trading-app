import { useEffect, RefObject } from 'react';
import { IChartApi } from 'lightweight-charts';

export const useChartResize = (
  containerRef: RefObject<HTMLDivElement>,
  chartRef: RefObject<IChartApi>
) => {
  useEffect(() => {
    const resizeChart = () => {
      if (containerRef.current && chartRef.current) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        chartRef.current.applyOptions({ width, height });
      }
    };

    const resizeObserver = new ResizeObserver(resizeChart);

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', resizeChart);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', resizeChart);
    };
  }, [containerRef, chartRef]);
};
