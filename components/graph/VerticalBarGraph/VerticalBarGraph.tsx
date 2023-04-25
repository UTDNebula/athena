import { useState } from 'react';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
import GraphProps from '../../../modules/GraphProps';
import React from 'react';
import { Card, Modal, Fade } from '@mui/material';
import { FullscreenOpenIcon } from '../../icons/FullscreenOpenIcon/fullscreenOpenIcon';
import { FullscreenCloseIcon } from '../../icons/FullscreenCloseIcon/fullscreenCloseIcon';

/**
 * Creates a pre-configured ApexCharts vertical bar graph component. Takes in `series`, `title`, and `xaxisLabels` via `GraphProps`. This component also gets returned from a BarGraph component on a large screen.
 * @param props
 * @returns vertical bar graph
 */
export function VerticalBarGraph(props: GraphProps) {
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
              click: (chart, options, e) => setFullScreenOpen(!fullScreenOpen),
            },
          ],
        },
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
    colors: ['#eb5757', '#2d9cdb', '#499F68'],
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

  const graph = (
    <div className="h-full">
      <Chart
        options={options}
        series={props.series}
        type="bar"
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
