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

  const [fullScreenOpen, setFullScreenOpen] = useState<boolean>(false);

  const icon =
    '<div class="apexcharts-menu-icon">' +
    (fullScreenOpen ? FullscreenCloseIcon : FullscreenOpenIcon) +
    '</div>';

  let series = props.series;
  let noDataText = 'Please select a class to add';
  if (
    series.length !== 0 &&
    series.every((grade_distribution) =>
      grade_distribution.data.every((letter: number) => isNaN(letter)),
    )
  ) {
    series = [];
    noDataText = 'Grade data unavailable for selected courses';
  }

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
    colors: searchQueryColors.filter(
      (searchQuery, i) => props.includedColors?.[i] ?? 1,
    ),
    stroke: {
      width: 2,
      curve: 'smooth',
    },
    title: {
      text: props.title,
      align: 'left',
      style: {
        fontFamily: 'inherit',
      },
    },
    noData: {
      text: noDataText,
      align: 'center',
      verticalAlign: 'middle',
      offsetX: 0,
      offsetY: 0,
      style: {
        fontSize: '14px',
        fontFamily: 'inherit',
      },
    },
    theme: {
      mode: useMediaQuery('(prefers-color-scheme: dark)') ? 'dark' : 'light',
    },
  };

  const graph = (
    <div className="h-full">
      <Chart options={options} series={series} type="bar" height={'100%'} />
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
