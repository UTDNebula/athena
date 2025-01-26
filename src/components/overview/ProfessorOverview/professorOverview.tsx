import { Skeleton } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import SingleGradesInfo from '@/components/common/SingleGradesInfo/singleGradesInfo';
import SingleProfInfo from '@/components/common/SingleProfInfo/singleProfInfo';
import fetchWithCache, {
  cacheIndexNebula,
  expireTime,
} from '@/modules/fetchWithCache/fetchWithCache';
import {
  type SearchQuery,
  searchQueryLabel,
} from '@/modules/SearchQuery/SearchQuery';
import type { RMPInterface } from '@/pages/api/ratemyprofessorScraper';
import type { GenericFetchedData, GradesType } from '@/pages/dashboard/index';

const fallbackSrc = 'https://profiles.utdallas.edu/img/default.png';

export interface ProfessorInterface {
  _id: string;
  email: string;
  first_name: string;
  image_uri: string;
  last_name: string;
  office: {
    building: string;
    room: string;
    map_uri: string;
  };
  //office_hours: any[];
  phone_number: string;
  profile_uri: string;
  sections: string[];
  titles: string[];
}

type ProfessorOverviewProps = {
  professor: SearchQuery;
  grades: GenericFetchedData<GradesType>;
  rmp: GenericFetchedData<RMPInterface>;
};

const ProfessorOverview = ({
  professor,
  grades,
  rmp,
}: ProfessorOverviewProps) => {
  const [profData, setProfData] = useState<
    GenericFetchedData<ProfessorInterface>
  >({ state: 'loading' });

  const [src, setSrc] = useState(fallbackSrc);

  useEffect(() => {
    setProfData({ state: 'loading' });
    fetchWithCache(
      '/api/professor?profFirst=' +
        encodeURIComponent(String(professor.profFirst)) +
        '&profLast=' +
        encodeURIComponent(String(professor.profLast)),
      cacheIndexNebula,
      expireTime,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      },
    )
      .then((response) => {
        if (response.message !== 'success') {
          throw new Error(response.message);
        }
        setProfData({
          state: typeof response.data !== 'undefined' ? 'done' : 'error',
          data: response.data as ProfessorInterface,
        });
        setSrc(response.data.image_uri);
      })
      .catch((error) => {
        setProfData({ state: 'error' });
        console.error('Professor data', error);
      });
  }, [professor]);

  return (
    <div className="flex flex-col gap-2">
      {profData.state === 'loading' ? (
        <Skeleton variant="circular" className="w-32 h-32 self-center" />
      ) : (
        <Image
          src={src}
          alt="Headshot"
          height={280}
          width={280}
          className="w-32 h-32 rounded-full self-center"
          onLoadingComplete={(result) => {
            if (result.naturalWidth === 0) {
              // Broken image
              setSrc(fallbackSrc);
            }
          }}
          onError={() => {
            setSrc(fallbackSrc);
          }}
        />
      )}
      <div className="flex flex-col items-center">
        {profData.state === 'loading' && (
          <>
            <Skeleton className="text-2xl font-bold w-[15ch]" />
            <Skeleton className="w-[25ch]" />
            <Skeleton className="w-[20ch]" />
            <Skeleton className="w-[10ch]" />
          </>
        )}
        {profData.state === 'done' && typeof profData.data !== 'undefined' && (
          <>
            <p className="text-2xl font-bold self-center">
              {searchQueryLabel(professor)}
            </p>
            {profData.data.email !== '' && (
              <Link
                href={'mailto:' + profData.data.email}
                target="_blank"
                className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
              >
                {profData.data.email}
              </Link>
            )}

            {profData.data.office.map_uri !== '' &&
              profData.data.office.building !== '' &&
              profData.data.office.room !== '' && (
                <p>
                  Office:{' '}
                  <Link
                    href={profData.data.office.map_uri}
                    target="_blank"
                    className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
                  >
                    <b>
                      {profData.data.office.building +
                        ' ' +
                        profData.data.office.room}
                    </b>
                  </Link>
                </p>
              )}
            {profData.data.profile_uri !== '' && (
              <Link
                href={profData.data.profile_uri}
                target="_blank"
                className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
              >
                Faculty Profile
              </Link>
            )}
          </>
        )}
      </div>
      <SingleGradesInfo
        title="# of Students (Overall)"
        course={professor}
        grades={grades}
      />
      <SingleProfInfo rmp={rmp} />
    </div>
  );
};

export default ProfessorOverview;
