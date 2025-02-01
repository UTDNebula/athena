import KeyboardArrowIcon from '@mui/icons-material/KeyboardArrowRight';
import {
  Checkbox,
  Collapse,
  IconButton,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';

import Rating from '@/components/common/Rating/rating';
import SingleGradesInfo from '@/components/common/SingleGradesInfo/singleGradesInfo';
import SingleProfInfo from '@/components/common/SingleProfInfo/singleProfInfo';
import TableSortLabel from '@/components/common/TableSortLabel/tableSortLabel';
import { useRainbowColors } from '@/modules/colors/colors';
import gpaToLetterGrade from '@/modules/gpaToLetterGrade/gpaToLetterGrade';
import {
  convertToProfOnly,
  type SearchQuery,
  searchQueryEqual,
  searchQueryLabel,
} from '@/modules/SearchQuery/SearchQuery';
import type { RMPInterface } from '@/pages/api/ratemyprofessorScraper';
import type { GenericFetchedData, GradesType } from '@/pages/dashboard/index';

function LoadingRow() {
  return (
    <TableRow>
      <TableCell className="flex gap-1">
        <IconButton aria-label="expand row" size="medium" disabled>
          <KeyboardArrowIcon />
        </IconButton>
        <Checkbox disabled />
      </TableCell>
      <TableCell component="th" scope="row" className="w-full">
        <Typography className="w-full leading-tight text-lg">
          <Skeleton />
        </Typography>
      </TableCell>
      <TableCell align="center">
        <Skeleton
          variant="rounded"
          className="rounded-full px-5 py-2 min-w-16 block mx-auto"
        >
          <Typography className="text-base">A+</Typography>
        </Skeleton>
      </TableCell>
      <TableCell align="center">
        <Skeleton variant="rounded" className="rounded-full mx-auto">
          <Rating sx={{ fontSize: 25 }} readOnly />
        </Skeleton>
      </TableCell>
    </TableRow>
  );
}

type RowProps = {
  course: SearchQuery;
  grades: GenericFetchedData<GradesType>;
  rmp: GenericFetchedData<RMPInterface>;
  inCompare: boolean;
  addToCompare: (arg0: SearchQuery) => void;
  removeFromCompare: (arg0: SearchQuery) => void;
  color?: string;
};

function Row({
  course,
  grades,
  rmp,
  inCompare,
  addToCompare,
  removeFromCompare,
  color,
}: RowProps) {
  const [open, setOpen] = useState(false);

  const rainbowColors = useRainbowColors();
  const gpaToColor = (gpa: number): string => {
    if (gpa >= 4.0) return rainbowColors[1];
    if (gpa >= 3.67) return rainbowColors[2];
    if (gpa >= 3.33) return rainbowColors[3];
    if (gpa >= 3.0) return rainbowColors[4];
    if (gpa >= 2.67) return rainbowColors[5];
    if (gpa >= 2.33) return rainbowColors[6];
    if (gpa >= 2.0) return rainbowColors[7];
    if (gpa >= 1.67) return rainbowColors[8];
    if (gpa >= 1.33) return rainbowColors[9];
    if (gpa >= 1.0) return rainbowColors[10];
    if (gpa >= 0.67) return rainbowColors[11];
    return rainbowColors[12];
  };

  return (
    <>
      <TableRow
        onClick={() => setOpen(!open)} // opens/closes the card by clicking anywhere on the row
        className="cursor-pointer"
      >
        <TableCell className="border-b-0">
          <div className="flex items-center gap-1">
            <Tooltip
              title={open ? 'Minimize Result' : 'Expand Result'}
              placement="top"
            >
              <IconButton
                aria-label="expand row"
                size="medium"
                onClick={(e) => {
                  e.stopPropagation(); // prevents double opening/closing
                  setOpen(!open);
                }}
                className={'transition-transform' + (open ? ' rotate-90' : '')}
              >
                <KeyboardArrowIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
            <Tooltip
              title={inCompare ? 'Remove from Compare' : 'Add to Compare'}
              placement="top"
            >
              <Checkbox
                checked={inCompare}
                onClick={(e) => {
                  e.stopPropagation(); // prevents opening/closing the card when clicking on the compare checkbox
                  if (inCompare) {
                    removeFromCompare(course);
                  } else {
                    addToCompare(course);
                  }
                }}
                disabled={
                  (typeof grades !== 'undefined' &&
                    grades.state === 'loading') ||
                  (typeof rmp !== 'undefined' && rmp.state === 'loading')
                }
                sx={
                  color
                    ? {
                        '&.Mui-checked': {
                          color: color,
                        },
                      }
                    : undefined
                } // Apply color if defined
              />
            </Tooltip>
          </div>
        </TableCell>
        <TableCell component="th" scope="row" className="w-full border-b-0">
          <Tooltip
            title={
              typeof course.profFirst !== 'undefined' &&
              typeof course.profLast !== 'undefined' &&
              (rmp !== undefined &&
              rmp.state === 'done' &&
              rmp.data.teacherRatingTags.length > 0
                ? 'Tags: ' +
                  rmp.data.teacherRatingTags
                    .sort((a, b) => b.tagCount - a.tagCount)
                    .slice(0, 3)
                    .map((tag) => tag.tagName)
                    .join(', ')
                : 'No Tags Available')
            }
            placement="top"
          >
            <Typography
              onClick={
                (e) => e.stopPropagation() // prevents opening/closing the card when clicking on the text
              }
              className="leading-tight text-lg text-gray-600 dark:text-gray-200 cursor-text w-fit"
            >
              {searchQueryLabel(course) +
                ((typeof course.profFirst === 'undefined' &&
                  typeof course.profLast === 'undefined') ||
                (typeof course.prefix === 'undefined' &&
                  typeof course.number === 'undefined')
                  ? ' (Overall)'
                  : '')}
            </Typography>
          </Tooltip>
        </TableCell>
        <TableCell align="center" className="border-b-0">
          {((typeof grades === 'undefined' || grades.state === 'error') && (
            <></>
          )) ||
            (grades.state === 'loading' && (
              <Skeleton
                variant="rounded"
                className="rounded-full px-5 py-2 w-16 block mx-auto"
              >
                <Typography className="text-base w-6">A+</Typography>
              </Skeleton>
            )) ||
            (grades.state === 'done' && (
              <Tooltip
                title={'GPA: ' + grades.data.gpa.toFixed(2)}
                placement="top"
              >
                <Typography
                  className="text-base text-black text-center rounded-full px-5 py-2 w-16 block mx-auto"
                  sx={{ backgroundColor: gpaToColor(grades.data.gpa) }}
                >
                  {gpaToLetterGrade(grades.data.gpa)}
                </Typography>
              </Tooltip>
            )) ||
            null}
        </TableCell>
        <TableCell align="center" className="border-b-0">
          {((typeof rmp === 'undefined' || rmp.state === 'error') && <></>) ||
            (rmp.state === 'loading' && (
              <Skeleton variant="rounded" className="rounded-full">
                <Rating sx={{ fontSize: 25 }} readOnly />
              </Skeleton>
            )) ||
            (rmp.state === 'done' && rmp.data.numRatings == 0 && <></>) ||
            (rmp.state === 'done' && rmp.data.numRatings != 0 && (
              <Tooltip
                title={'Professor rating: ' + rmp.data.avgRating}
                placement="top"
              >
                <div>
                  <Rating
                    defaultValue={rmp.data.avgRating}
                    precision={0.1}
                    sx={{ fontSize: 25 }}
                    readOnly
                  />
                </div>
              </Tooltip>
            )) ||
            null}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className="p-0" colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <div className="p-2 md:p-4 flex flex-col gap-2">
              <SingleGradesInfo course={course} grades={grades} />
              <SingleProfInfo rmp={rmp} />
            </div>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

type SearchResultsTableProps = {
  resultsLoading: 'loading' | 'done';
  includedResults: SearchQuery[];
  grades: { [key: string]: GenericFetchedData<GradesType> };
  rmp: { [key: string]: GenericFetchedData<RMPInterface> };
  compare: SearchQuery[];
  addToCompare: (arg0: SearchQuery) => void;
  removeFromCompare: (arg0: SearchQuery) => void;
  colorMap: { [key: string]: string };
};

const SearchResultsTable = ({
  resultsLoading,
  includedResults,
  grades,
  rmp,
  compare,
  addToCompare,
  removeFromCompare,
  colorMap,
}: SearchResultsTableProps) => {
  //Table sorting category
  const [orderBy, setOrderBy] = useState<'name' | 'gpa' | 'rating'>('name');
  //Table sorting direction
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  //Cycle through sorting
  function handleClick(col: 'name' | 'gpa' | 'rating') {
    if (orderBy !== col) {
      setOrderBy(col);
      if (col === 'name')
        setOrder('asc'); //default alphabetical behavior goes from a to z
      else setOrder('desc'); //default number behavior goes from high to low for our metrics
    } else {
      if (order === 'asc') {
        setOrder('desc');
      } else {
        setOrder('asc');
      }
    }
  }

  if (resultsLoading !== 'loading' && includedResults.length === 0) {
    return (
      <div className="p-4">
        <Typography
          variant="h3"
          gutterBottom
          className="leading-tight text-3xl font-bold"
        >
          No results
        </Typography>
        <Typography variant="body1">
          There is no overlap for the selected courses, professors, and filters.
        </Typography>
      </div>
    );
  }

  //Sort
  const sortedResults = includedResults.sort((a, b) => {
    if (orderBy === 'name') {
      //same logic as in generateCombosTable.ts
      //handle undefined variables based on searchQueryLabel
      const aFirstName = a.profFirst ?? '';
      const bFirstName = b.profFirst ?? '';
      const aLastName = a.profLast ?? '';
      const bLastName = b.profLast ?? '';
      const aPrefix = a.prefix ?? ''; //make sure the is no empty input for prefix and number
      const bPrefix = b.prefix ?? '';
      const aNumber = a.number ?? '';
      const bNumber = b.number ?? '';

      if (order === 'asc') {
        //ascending alphabetical automatically sorts Overall results correctly
        if (
          (typeof a.profFirst === 'undefined' &&
            typeof a.profLast === 'undefined') ||
          (typeof a.prefix === 'undefined' && typeof a.number === 'undefined')
        )
          return -1;
        if (
          (typeof b.profFirst === 'undefined' &&
            typeof b.profLast === 'undefined') ||
          (typeof b.prefix === 'undefined' && typeof b.number === 'undefined')
        )
          return 1;
        return (
          aLastName.localeCompare(bLastName) || //sort by last name then first name
          aFirstName.localeCompare(bFirstName) ||
          aPrefix.localeCompare(bPrefix) || //if names are equal/don't exist, then sort by prefix then number
          aNumber.localeCompare(bNumber)
        );
      }
      //keep the "(Overall)" result on top for descending sort too
      else {
        // catches the case where a is an Overall result AND b is an Overall result
        if (
          ((typeof a.profFirst === 'undefined' &&
            typeof a.profLast === 'undefined') ||
            (typeof a.prefix === 'undefined' &&
              typeof a.number === 'undefined')) &&
          ((typeof b.profFirst === 'undefined' &&
            typeof b.profLast === 'undefined') ||
            (typeof b.prefix === 'undefined' &&
              typeof b.number === 'undefined'))
        )
          return (
            bLastName.localeCompare(aLastName) || //sort by last name then first name
            bFirstName.localeCompare(aFirstName) ||
            bPrefix.localeCompare(aPrefix) || //if names are equal/don't exist, then, sort by prefix then number
            bNumber.localeCompare(aNumber)
          );
        if (
          (typeof a.profFirst === 'undefined' &&
            typeof a.profLast === 'undefined') ||
          (typeof a.prefix === 'undefined' && typeof a.number === 'undefined')
        )
          return -1;
        if (
          (typeof b.profFirst === 'undefined' &&
            typeof b.profLast === 'undefined') ||
          (typeof b.prefix === 'undefined' && typeof b.number === 'undefined')
        )
          return 1;
        return (
          bLastName.localeCompare(aLastName) || //sort by last name then first name
          bFirstName.localeCompare(aFirstName) ||
          bPrefix.localeCompare(aPrefix) || //if names are equal/don't exist, then, sort by prefix then number
          bNumber.localeCompare(aNumber)
        );
      }
      return 0;
    }
    if (orderBy === 'gpa') {
      const aGrades = grades[searchQueryLabel(a)];
      const bGrades = grades[searchQueryLabel(b)];
      if (
        (!aGrades || aGrades.state !== 'done') &&
        (!bGrades || bGrades.state !== 'done')
      ) {
        return 0;
      }

      if (!aGrades || aGrades.state !== 'done') {
        return 9999;
      }
      if (!bGrades || bGrades.state !== 'done') {
        return -9999;
      }

      if (order === 'asc') {
        return aGrades.data.gpa - bGrades.data.gpa;
      }
      return bGrades.data.gpa - aGrades.data.gpa;
    }
    if (orderBy === 'rating') {
      const aRmp = rmp[searchQueryLabel(convertToProfOnly(a))];
      const bRmp = rmp[searchQueryLabel(convertToProfOnly(b))];
      //drop loading/error rows to bottom
      if (
        (!aRmp || aRmp.state !== 'done' || aRmp.data.numRatings == 0) &&
        (!bRmp || bRmp.state !== 'done' || bRmp.data.numRatings == 0)
      ) {
        // If both aRmp and bRmp are not done, treat them as equal and return 0
        return 0;
      }
      if (!aRmp || aRmp.state !== 'done' || aRmp.data.numRatings == 0) {
        return 9999;
      }
      if (!bRmp || bRmp.state !== 'done' || bRmp.data.numRatings == 0) {
        return -9999;
      }
      const aRating = aRmp?.data?.avgRating ?? 0; // Fallback to 0 if undefined
      const bRating = bRmp?.data?.avgRating ?? 0; // Fallback to 0 if undefined
      if (order === 'asc') {
        return aRating - bRating;
      }
      return bRating - aRating;
    }
    return 0;
  });

  return (
    //TODO: sticky header
    <>
      <Typography className="leading-tight text-3xl font-bold p-4">
        Search Results
      </Typography>
      <TableContainer component={Paper}>
        <Table stickyHeader aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell>Actions</TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'name'}
                  direction={orderBy === 'name' ? order : 'asc'}
                  onClick={() => {
                    handleClick('name');
                  }}
                >
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">
                <Tooltip
                  title="Average Letter Grade Across Course Sections"
                  placement="top"
                >
                  <div>
                    <TableSortLabel
                      active={orderBy === 'gpa'}
                      direction={orderBy === 'gpa' ? order : 'desc'}
                      onClick={() => {
                        handleClick('gpa');
                      }}
                    >
                      Grades
                    </TableSortLabel>
                  </div>
                </Tooltip>
              </TableCell>
              <TableCell align="center">
                <Tooltip
                  title="Average Professor Rating from Rate My Professors"
                  placement="top"
                >
                  <div>
                    <TableSortLabel
                      active={orderBy === 'rating'}
                      direction={orderBy === 'rating' ? order : 'desc'}
                      onClick={() => {
                        handleClick('rating');
                      }}
                    >
                      Rating
                    </TableSortLabel>
                  </div>
                </Tooltip>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {resultsLoading === 'done'
              ? sortedResults.map((result) => (
                  <Row
                    key={searchQueryLabel(result)}
                    course={result}
                    grades={grades[searchQueryLabel(result)]}
                    rmp={rmp[searchQueryLabel(convertToProfOnly(result))]}
                    inCompare={
                      compare.findIndex((obj) =>
                        searchQueryEqual(obj, result),
                      ) !== -1
                    }
                    addToCompare={addToCompare}
                    removeFromCompare={removeFromCompare}
                    color={colorMap[searchQueryLabel(result)]}
                  />
                ))
              : Array(10)
                  .fill(0)
                  .map((_, index) => <LoadingRow key={index} />)}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default SearchResultsTable;
