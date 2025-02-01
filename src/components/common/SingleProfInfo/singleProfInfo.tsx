import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Chip,
  Collapse,
  Grid2 as Grid,
  IconButton,
  Skeleton,
} from '@mui/material';
import Link from 'next/link';
import React, { useState } from 'react';

import type { RMPInterface } from '@/pages/api/ratemyprofessorScraper';
import type { GenericFetchedData } from '@/pages/dashboard/index';

type Props = {
  rmp: GenericFetchedData<RMPInterface>;
};

function SingleProfInfo({ rmp }: Props) {
  const [showMore, setShowMore] = useState(false);

  if (typeof rmp === 'undefined' || rmp.state === 'error') {
    return null;
  }

  if (rmp.state === 'loading') {
    const loadingTags = [
      'Group projects (54)',
      'Lecture heavy (29)',
      'Hilarious (13)',
      'Respected (9)',
      'Clear grading criteria (9)',
    ];
    return (
      <Grid container spacing={2} className="p-4">
        {/* Loading skeletons for each metric */}
        <Grid size={6}>
          <Skeleton variant="rounded">
            <p className="text-xl font-bold">5.0</p>
          </Skeleton>
          <p>Professor rating</p>
        </Grid>
        <Grid size={6}>
          <Skeleton variant="rounded">
            <p className="text-xl font-bold">5.0</p>
          </Skeleton>
          <p>Difficulty</p>
        </Grid>
        <Grid size={6}>
          <Skeleton variant="rounded">
            <p className="text-xl font-bold">1,000</p>
          </Skeleton>
          <p>Ratings given</p>
        </Grid>
        <Grid size={6}>
          <Skeleton variant="rounded">
            <p className="text-xl font-bold">99%</p>
          </Skeleton>
          <p>Would take again</p>
        </Grid>

        <Grid size={12}>
          <div className="flex gap-1 flex-wrap">
            {loadingTags.map((tag, index) => (
              <Skeleton key={index} variant="rounded" className="rounded-full">
                <Chip label={tag} />
              </Skeleton>
            ))}
            <Skeleton variant="rounded" className="rounded-full">
              <IconButton size="small">
                <ExpandMoreIcon />
              </IconButton>
            </Skeleton>
          </div>
        </Grid>

        <Grid size={12}>
          <Skeleton variant="rounded">
            <p>Visit Rate My Professors</p>
          </Skeleton>
        </Grid>
      </Grid>
    );
  }

  if (rmp.data.numRatings == 0) {
    return (
      <Grid container spacing={2} className="p-4">
        <Grid size={6}>
          <p className="text-xl font-bold">
            {rmp.data.numRatings.toLocaleString()}
          </p>
          <p>Ratings given</p>
        </Grid>
        <Grid size={12}>
          <Link
            href={
              'https://www.ratemyprofessors.com/professor/' + rmp.data.legacyId
            }
            target="_blank"
            className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
          >
            Visit Rate My Professors
          </Link>
        </Grid>
      </Grid>
    );
  }

  const topTags = rmp.data.teacherRatingTags.sort(
    (a, b) => b.tagCount - a.tagCount,
  );
  const first5 = topTags.slice(0, 5);
  const next5 = topTags.slice(5, 10);

  return (
    <Grid container spacing={2} className="p-4">
      <Grid size={6}>
        <p className="text-xl font-bold">
          {rmp.data.avgRating > 0 ? rmp.data.avgRating : 'N/A'}
        </p>
        <p>Professor rating</p>
      </Grid>
      <Grid size={6}>
        <p className="text-xl font-bold">
          {rmp.data.avgDifficulty > 0 ? rmp.data.avgDifficulty : 'N/A'}
        </p>
        <p>Difficulty</p>
      </Grid>
      <Grid size={6}>
        <p className="text-xl font-bold">
          {rmp.data.numRatings.toLocaleString()}
        </p>
        <p>Ratings given</p>
      </Grid>
      <Grid size={6}>
        <p className="text-xl font-bold">
          {rmp.data.wouldTakeAgainPercent > 0
            ? rmp.data.wouldTakeAgainPercent.toFixed(0) + '%'
            : 'N/A'}
        </p>
        <p>Would take again</p>
      </Grid>

      {first5.length > 0 && (
        <Grid size={12}>
          <div className="flex gap-y-1 flex-wrap">
            {first5.map((tag, index) => (
              <Chip
                key={index}
                label={`${tag.tagName} (${tag.tagCount})`}
                variant="outlined"
                className="mr-1"
              />
            ))}
            {next5.length > 0 && (
              <>
                {next5.map((tag, index) => (
                  <Collapse key={index} in={showMore} orientation="horizontal">
                    <Chip
                      label={`${tag.tagName} (${tag.tagCount})`}
                      variant="outlined"
                      className="mr-1"
                    />
                  </Collapse>
                ))}
                <IconButton
                  size="small"
                  aria-label="show more"
                  onClick={() => setShowMore(!showMore)}
                >
                  <ExpandMoreIcon
                    className={
                      'transition ' + (showMore ? 'rotate-90' : '-rotate-90')
                    }
                  />
                </IconButton>
              </>
            )}
          </div>
        </Grid>
      )}

      <Grid size={12}>
        <Link
          href={
            'https://www.ratemyprofessors.com/professor/' + rmp.data.legacyId
          }
          target="_blank"
          className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
        >
          Visit Rate My Professors
        </Link>
      </Grid>
    </Grid>
  );
}

export default SingleProfInfo;
