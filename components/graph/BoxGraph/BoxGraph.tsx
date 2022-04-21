import { useState } from 'react';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
import GraphProps from '../../../modules/GraphProps';
import React from 'react';

/**
 * Creates a pre-configured ApexCharts box-and-whisker graph. Takes in `series`, `title`, and `xaxisLabels` via `GraphProps`. 
 * @param props 
 * @returns line graph
 */
export function BoxGraph(props: GraphProps) {
  for (let x = 0; x<props.series.length;x++){
    props.series[x].y.sort()
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
        horizontal: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: props.xaxisLabels,
    },
    colors: ['#ffadad', '#9bf6ff', '#caffbf'],
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
          series={[
            {
              type: 'boxPlot',
              data: props.series
            }
          ]}
          type="boxPlot"
          height={'100%'}
        />
      </div>
    </>
  );
}
