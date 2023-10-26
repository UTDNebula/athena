import { Card, Fade, Modal, useMediaQuery } from '@mui/material';
import { ApexOptions } from 'apexcharts';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';

import GraphProps from '../../../modules/GraphProps/GraphProps';
import searchQueryColors from '../../../modules/searchQueryColors/searchQueryColors';
import { FullscreenCloseIcon } from '../../icons/FullscreenCloseIcon/fullscreenCloseIcon';
import { FullscreenOpenIcon } from '../../icons/FullscreenOpenIcon/fullscreenOpenIcon';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

/**
 * Creates a pre-configured ApexCharts line graph component. Takes in `series`, `title`, and `xaxisLabels` via `GraphProps`.
 * @param props
 * @returns line graph
 */
export function LineGraph(props: GraphProps) {
  const [fullScreenOpen, setFullScreenOpen] = useState<boolean>(false);

  const icon =
    '<div class="apexcharts-menu-icon">' +
    (fullScreenOpen ? FullscreenCloseIcon : FullscreenOpenIcon) +
    '</div>';

  const options: ApexOptions = {
    chart: {
      id: 'line-chart',
      zoom: {
        enabled: false,
      },
      toolbar: {
        tools: {
          customIcons: [
            {
              icon: icon,
              index: 0,
              title: 'Fullscreen',
              class: 'custom-icon',
              click: () => setFullScreenOpen(!fullScreenOpen),
            },
          ],
        },
      },
      background: 'transparent',
      animations: {
        enabled: !fullScreenOpen,
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
    yaxis: {
      labels: {
        formatter: props.yaxisFormatter,
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
    theme: {
      mode: useMediaQuery('(prefers-color-scheme: dark)') ? 'dark' : 'light',
    },
  };

  const graph = (
    <div className="h-full">
      <Chart
        options={options}
        series={props.series}
        type="line"
        height={'100%'}
      />
    </div>
  );

  return (
    <>
      {graph}
      <Modal
        open={fullScreenOpen}
        onClose={() => setFullScreenOpen(false)}
        className="flex justify-stretch align-stretch"
      >
        <Fade in={fullScreenOpen}>
          <Card className="p-4 m-12 flex-auto">{graph}</Card>
        </Fade>
      </Modal>
    </>
  );
}
