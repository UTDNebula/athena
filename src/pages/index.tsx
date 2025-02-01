import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import Background from '@/../public/background.png';
import SearchBar from '@/components/search/SearchBar/searchBar';
import {
  type SearchQuery,
  searchQueryLabel,
} from '@/modules/SearchQuery/SearchQuery';

import type { GenericFetchedData } from './dashboard';

/**
 * Returns the home page with Nebula Branding, waved background, and SearchBar Components
 */
const Home: NextPage = () => {
  const router = useRouter();
  function searchOptionChosen(chosenOptions: SearchQuery[]) {
    if (chosenOptions.length) {
      router.push({
        pathname: '/dashboard',
        query: {
          searchTerms: chosenOptions
            .map((el) => searchQueryLabel(el))
            .join(','),
        },
      });
    }
  }

  const [results, setResults] = useState<GenericFetchedData<SearchQuery[]>>({
    state: 'done',
    data: [],
  }); // essentially a dummy state. Used only for the loading animation to start in homescreen before navigation to the dashboard

  useEffect(() => {
    router.prefetch('/dashboard');
  }, [router]);

  return (
    <>
      <Head>
        <link
          rel="canonical"
          href="https://trends.utdnebula.com"
          key="canonical"
        />
        <meta property="og:url" content="https://trends.utdnebula.com" />
      </Head>
      <div className="relative bg-lighten dark:bg-darken h-full w-full flex flex-col items-center gap-4 px-8 py-4">
        <Image
          src={Background}
          alt="gradient background"
          fill
          className="object-cover -z-20"
        />
        <div className="max-w-xl grow flex flex-col justify-center">
          <h2 className="text-sm font-semibold mb-3 text-cornflower-600 dark:text-cornflower-400 tracking-wider">
            POWERED BY {/*eslint-disable-next-line react/jsx-no-target-blank*/}
            <a
              href="https://www.utdnebula.com/"
              target="_blank"
              rel="noopener"
              className="underline decoration-transparent hover:decoration-inherit transition"
            >
              NEBULA LABS
            </a>
          </h2>
          <h1 className="text-6xl font-extrabold font-kallisto mb-6">
            UTD TRENDS
          </h1>
          <p className="mb-10 text-gray-700 dark:text-gray-300 leading-7">
            Explore and compare past grades, professor ratings, and reviews to
            find the perfect class.
          </p>
          <SearchBar
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus={true}
            onSelect={searchOptionChosen}
            resultsLoading={results.state}
            setResultsLoading={() => setResults({ state: 'loading' })}
            input_className="[&>.MuiInputBase-root]:bg-white [&>.MuiInputBase-root]:dark:bg-haiti"
          />
        </div>
        {/*eslint-disable-next-line react/jsx-no-target-blank*/}
        <a
          href="https://utdgrades.com/"
          target="_blank"
          rel="noopener"
          className="bg-white dark:bg-black text-black dark:text-white py-3 px-5 rounded transition hover:scale-[1.01]"
        >
          Also check out <b>UTD Grades</b>
        </a>
      </div>
    </>
  );
};

export default Home;
