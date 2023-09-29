import { ApexOptions } from 'apexcharts';
import dynamic from 'next/dynamic';
import React from 'react';

import GraphProps from '../../../modules/GraphProps';
import searchQueryColors from '../../../modules/searchQueryColors/searchQueryColors';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

/**
 * Creates a pre-configured ApexCharts horizontal bar graph component. Takes in `series`, `title`, and `xaxisLabels` via `GraphProps`. This component also gets returned from a BarGraph component on a small screen.
 * @param props
 * @returns horizontal bar graph
 */
export function HorizontalBarGraph(props: GraphProps) {
  function xaxisFormatter(value: string) {
    if (typeof props.yaxisFormatter === 'undefined') {
      return value;
    }
    return props.yaxisFormatter(Number(value));
  }

  const options: ApexOptions = {
    chart: {
      id: 'line-chart',
      zoom: {
        enabled: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: props.xaxisLabels,
      labels: {
        formatter: xaxisFormatter,
      },
    },
    colors: searchQueryColors,
    stroke: {
      width: 2,
      curve: 'smooth',
    },
    title: {
      text: props.title,
      align: 'left',
    },
    noData: {
      text: 'Please select a class to add',
      align: 'center',
      verticalAlign: 'middle',
      offsetX: 0,
      offsetY: 0,
      style: {
        color: undefined,
        fontSize: '14px',
        fontFamily: undefined,
      },
    },
  };

  return (
    <>
      <div className="h-full">
        <Chart
          options={options}
          series={props.series}
          type="bar"
          height={'100%'}
        />
      </div>
    </>
  );
}
