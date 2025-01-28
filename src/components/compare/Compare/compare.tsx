import FaceIcon from '@mui/icons-material/Face';
import Face2Icon from '@mui/icons-material/Face2';
import Face3Icon from '@mui/icons-material/Face3';
import Face4Icon from '@mui/icons-material/Face4';
import Face5Icon from '@mui/icons-material/Face5';
import Face6Icon from '@mui/icons-material/Face6';
import { Grid2 as Grid } from '@mui/material';
import React from 'react';

import CompareTable from '@/components/compare/CompareTable/compareTable';
import BarGraph from '@/components/graph/BarGraph/barGraph';
import {
  type SearchQuery,
  searchQueryLabel,
} from '@/modules/SearchQuery/SearchQuery';
import type { RMPInterface } from '@/pages/api/ratemyprofessorScraper';
import type { GenericFetchedData, GradesType } from '@/pages/dashboard/index';

type CompareProps = {
  courses: SearchQuery[];
  grades: { [key: string]: GenericFetchedData<GradesType> };
  rmp: { [key: string]: GenericFetchedData<RMPInterface> };
  removeFromCompare: { (arg0: SearchQuery): void };
  colorMap: { [key: string]: string };
};

function convertNumbersToPercents(distribution: GradesType): number[] {
  const total = distribution.total;
  return distribution.grade_distribution.map(
    (frequencyOfLetterGrade) => (frequencyOfLetterGrade / total) * 100,
  );
}

const Compare = ({
  courses,
  grades,
  rmp,
  removeFromCompare,
  colorMap,
}: CompareProps) => {
  if (courses.length === 0) {
    return (
      <Grid container spacing={4} className="px-4">
        <Grid size={12} className="flex justify-center">
          <p>Click a checkbox to add something to compare.</p>
        </Grid>
        <Grid size={4} className="flex justify-center">
          <FaceIcon fontSize="large" />
        </Grid>
        <Grid size={4} className="flex justify-center">
          <Face2Icon fontSize="large" />
        </Grid>
        <Grid size={4} className="flex justify-center">
          <Face3Icon fontSize="large" />
        </Grid>
        <Grid size={4} className="flex justify-center">
          <Face4Icon fontSize="large" />
        </Grid>
        <Grid size={4} className="flex justify-center">
          <Face5Icon fontSize="large" />
        </Grid>
        <Grid size={4} className="flex justify-center">
          <Face6Icon fontSize="large" />
        </Grid>
      </Grid>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="h-64">
        <BarGraph
          title="% of Students"
          xaxisLabels={[
            'A+',
            'A',
            'A-',
            'B+',
            'B',
            'B-',
            'C+',
            'C',
            'C-',
            'D+',
            'D',
            'D-',
            'F',
            'W',
          ]}
          yaxisFormatter={(value) =>
            Number(value).toFixed(0).toLocaleString() + '%'
          }
          tooltipFormatter={(value, { seriesIndex, dataPointIndex }) => {
            let response = Number(value).toFixed(2).toLocaleString() + '%';
            const grade = grades[searchQueryLabel(courses[seriesIndex])];
            if (grade.state === 'done') {
              response +=
                ' (' +
                grade.data.grade_distribution[dataPointIndex]
                  .toFixed(0)
                  .toLocaleString() +
                ')';
            }
            return response;
          }}
          series={courses.map((course) => {
            const grade = grades[searchQueryLabel(course)];
            return {
              name:
                searchQueryLabel(course) +
                ((typeof course.profFirst === 'undefined' &&
                  typeof course.profLast === 'undefined') ||
                (typeof course.prefix === 'undefined' &&
                  typeof course.number === 'undefined')
                  ? ' (Overall)' //Indicates that this entry is an aggregate for the entire course/professor
                  : ''),
              data:
                grade.state === 'done'
                  ? convertNumbersToPercents(grade.data)
                  : [],
            };
          })}
        />
      </div>
      <CompareTable
        includedResults={courses}
        grades={grades}
        rmp={rmp}
        removeFromCompare={removeFromCompare}
        colorMap={colorMap}
      />
    </div>
  );
};

export default Compare;
