import { Button, Card, Grid, LinearProgress, Typography } from '@mui/material';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import Carousel from '../../components/common/Carousel/carousel';
import Compare from '../../components/common/Compare/compare';
import CourseOverview from '../../components/common/CourseOverview/courseOverview';
import Filters from '../../components/common/Filters/filters';
import ProfessorOverview from '../../components/common/ProfessorOverview/professorOverview';
import SearchResultsTable from '../../components/common/SearchResultsTable/searchResultsTable';
import TopMenu from '../../components/navigation/topMenu/topMenu';
import decodeSearchQueryLabel from '../../modules/decodeSearchQueryLabel/decodeSearchQueryLabel';
import fetchWithCache, {
  cacheIndexGrades,
  cacheIndexRmp,
  expireTime,
} from '../../modules/fetchWithCache';
import SearchQuery, {
  convertToProfOnly,
} from '../../modules/SearchQuery/SearchQuery';
import searchQueryEqual from '../../modules/searchQueryEqual/searchQueryEqual';
import searchQueryLabel from '../../modules/searchQueryLabel/searchQueryLabel';
import type { GradesData } from '../../pages/api/grades';
import type { RateMyProfessorData } from '../../pages/api/ratemyprofessorScraper';

function removeDuplicates(array: SearchQuery[]) {
  return array.filter(
    (obj1, index, self) =>
      index === self.findIndex((obj2) => searchQueryEqual(obj1, obj2)),
  );
}

//Fetch course+prof combos matching a specific course/prof
function autocompleteForSearchResultsFetch(
  searchTerms: SearchQuery[],
): Promise<SearchQuery[]>[] {
  return searchTerms.map((searchTerm) => {
    return fetchWithCache(
      '/api/autocomplete?limit=50&input=' + searchQueryLabel(searchTerm),
      cacheIndexGrades,
      expireTime,
      {
        // use the search terms to fetch all the result course-professor combinations
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      },
    ).then((data) => {
      if (data.message !== 'success') {
        throw new Error(data.message);
      }
      return data.data as SearchQuery[];
    });
  });
}

//Get all course+prof combos for searchTerms and keep only the ones that match filterTerms
//When filterTerms is blank, just gets all searchTerms
//When both paramaters are defined this validates that a combo exists
function fetchSearchResults(
  searchTerms: SearchQuery[],
  filterTerms: SearchQuery[],
) {
  return new Promise<SearchQuery[]>((resolve) => {
    Promise.all(autocompleteForSearchResultsFetch(searchTerms)).then(
      (allSearchTermResults: SearchQuery[][]) => {
        const results: SearchQuery[] = [];
        allSearchTermResults.map((searchTermResults) =>
          searchTermResults.map((searchTermResult) => {
            if (filterTerms.length > 0) {
              filterTerms.map((filterTerm) => {
                if (
                  (filterTerm.profFirst === searchTermResult.profFirst &&
                    filterTerm.profLast === searchTermResult.profLast) ||
                  (filterTerm.prefix === searchTermResult.prefix &&
                    filterTerm.number === searchTermResult.number)
                ) {
                  results.push(searchTermResult);
                }
              });
            } else {
              results.push(searchTermResult);
            }
          }),
        );
        resolve(results);
      },
    );
  });
}

//Find GPA, total, and grade_distribution based on including some set of semesters
function calculateGrades(grades: GradesData, academicSessions?: string[]) {
  let grade_distribution = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (const session of grades) {
    if (
      typeof academicSessions === 'undefined' ||
      academicSessions.includes(session._id)
    ) {
      grade_distribution = grade_distribution.map(
        (item, i) => item + session.grade_distribution[i],
      );
    }
  }

  const total: number = grade_distribution.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0,
  );

  const GPALookup = [
    4, 4, 3.67, 3.33, 3, 2.67, 2.33, 2, 1.67, 1.33, 1, 0.67, 0,
  ];
  let gpa = -1;
  if (total !== 0) {
    gpa =
      GPALookup.reduce(
        (accumulator, currentValue, index) =>
          accumulator + currentValue * grade_distribution[index],
        0,
      ) /
      (total - grade_distribution[grade_distribution.length - 1]);
  }

  return {
    gpa: gpa,
    total: total,
    grade_distribution: grade_distribution,
  };
}
export type GradesType = {
  gpa: number;
  total: number;
  grade_distribution: number[];
  grades: GradesData;
};
//Fetch grades by academic session from nebula api
function fetchGradesData(course: SearchQuery, controller: AbortController) {
  return new Promise<GradesType>((resolve, reject) => {
    fetchWithCache(
      '/api/grades?' +
        Object.keys(course)
          .map(
            (key) =>
              key +
              '=' +
              encodeURIComponent(String(course[key as keyof SearchQuery])),
          )
          .join('&'),
      cacheIndexGrades,
      expireTime,
      {
        signal: controller.signal,
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      },
    ).then((response) => {
      response = response.data;

      if (response == null) {
        reject();
        return;
      }

      resolve({
        ...calculateGrades(response),
        grades: response,
      });
      return;
    });
  });
}

//Fetch RMP data from RMP
function fetchRmpData(professor: SearchQuery, controller: AbortController) {
  return new Promise<RateMyProfessorData>((resolve, reject) => {
    fetchWithCache(
      '/api/ratemyprofessorScraper?profFirst=' +
        encodeURIComponent(String(professor.profFirst)) +
        '&profLast=' +
        encodeURIComponent(String(professor.profLast)),
      cacheIndexRmp,
      expireTime,
      {
        signal: controller.signal,
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      },
    ).then((response) => {
      if (response.found === 'false') {
        reject();
        return;
      }
      resolve(response.data.data);
      return;
    });
  });
}

export const Dashboard: NextPage = () => {
  const router = useRouter();

  //Searches seperated into courses and professors to create combos
  const [courses, setCourses] = useState<SearchQuery[]>([]);
  const [professors, setProfessors] = useState<SearchQuery[]>([]);

  //State for loading list of results
  const [state, setState] = useState('loading');
  //List of course+prof combos, data on each still needs to be fetched
  const [results, setResults] = useState<SearchQuery[]>([]);

  //On search change, seperate into courses and profs, clear data, and fetch new results
  useEffect(() => {
    if (router.isReady) {
      let array = router.query.searchTerms ?? [];
      if (!Array.isArray(array)) {
        array = array.split(',');
      }
      const searchTerms = array.map((el) => decodeSearchQueryLabel(el));

      const courseSearchTerms: SearchQuery[] = [];
      const professorSearchTerms: SearchQuery[] = [];

      // split the search terms into professors and courses
      searchTerms.map((searchTerm) => {
        if (searchTerm.profLast !== undefined) {
          professorSearchTerms.push(searchTerm);
        }
        if (searchTerm.prefix !== undefined) {
          courseSearchTerms.push(searchTerm);
        }
      });
      setCourses(courseSearchTerms);
      setProfessors(professorSearchTerms);

      //Clear fetched data
      setState('loading');
      setAcademicSessions([]);
      _setChosenSessions([]);
      setGrades({});
      setRmp({});
      setGradesLoading({});
      setRmpLoading({});

      //Get results from autocomplete
      if (courseSearchTerms.length > 0) {
        fetchSearchResults(courseSearchTerms, professorSearchTerms)
          .then((res) => {
            setResults(res);
            setState('done');
          })
          .catch((error) => {
            setState('error');
            console.error('Search Results', error);
          });
      } else if (professorSearchTerms.length > 0) {
        fetchSearchResults(professorSearchTerms, courseSearchTerms)
          .then((res) => {
            setResults(res);
            setState('done');
          })
          .catch((error) => {
            setState('error');
            console.error('Search Results', error);
          });
      }
    }
  }, [router.isReady, router.query.searchTerms]);

  //Compiled list of academic sessions grade data is available for
  const [academicSessions, setAcademicSessions] = useState<string[]>([]);
  //Selected sessions to perform calculations with, starts as all of them
  const [chosenSessions, _setChosenSessions] = useState<string[]>([]);

  //A wrapper on the setter function for chosenSessions that also recalculates GPA and such data for saved grade data based on the new set of chosen sessions
  function setChosenSessions(func: (arg0: string[]) => string[]) {
    _setChosenSessions((old) => {
      const newVal = func(old);
      setGrades((grades) => {
        Object.keys(grades).forEach((key) => {
          grades[key] = {
            ...grades[key],
            ...calculateGrades(grades[key].grades, newVal),
          };
        });
        return grades;
      });
      setCompareGrades((grades) => {
        Object.keys(grades).forEach((key) => {
          grades[key] = {
            ...grades[key],
            ...calculateGrades(grades[key].grades, newVal),
          };
        });
        return grades;
      });
      return newVal;
    });
  }

  //Add a set of sessions to the compiled list, removing duplicates and keeping a sorted order
  function addAcademicSessions(sessions: string[]) {
    setAcademicSessions((oldSessions) => {
      oldSessions = oldSessions.concat(sessions);
      //Remove duplicates
      oldSessions = oldSessions.filter(
        (value, index, array) => array.indexOf(value) === index,
      );
      //Sort by year and term
      oldSessions.sort((a, b) => {
        let aNum = parseInt(a);
        if (a.includes('S')) {
          aNum += 0.1;
        } else if (a.includes('U')) {
          aNum += 0.2;
        } else {
          aNum += 0.3;
        }
        let bNum = parseInt(b);
        if (b.includes('S')) {
          bNum += 0.1;
        } else if (b.includes('U')) {
          bNum += 0.2;
        } else {
          bNum += 0.3;
        }
        return aNum - bNum;
      });
      return oldSessions;
    });
    //Have new sessions be automatically checked
    setChosenSessions((oldSessions) => {
      oldSessions = oldSessions.concat(sessions);
      //Remove duplicates
      oldSessions = oldSessions.filter(
        (value, index, array) => array.indexOf(value) === index,
      );
      //No need to sort as this does not display to the user
      return oldSessions;
    });
  }

  //Store grades by course+prof combo
  const [grades, setGrades] = useState<{ [key: string]: GradesType }>({});
  //Store rmp scores by profs
  const [rmp, setRmp] = useState<{ [key: string]: RateMyProfessorData }>({});

  //Loading states for each result and prof in results
  const [gradesLoading, setGradesLoading] = useState<{
    [key: string]: 'loading' | 'done' | 'error';
  }>({});
  const [rmpLoading, setRmpLoading] = useState<{
    [key: string]: 'loading' | 'done' | 'error';
  }>({});

  //On change to results, load new data
  useEffect(() => {
    //To cancel on rerender
    const controller = new AbortController();

    //Grade data
    //Set loading states to loading
    const blankGradesLoading: { [key: string]: 'loading' | 'done' | 'error' } =
      {};
    for (const result of results) {
      blankGradesLoading[searchQueryLabel(result)] = 'loading';
    }
    setGradesLoading(blankGradesLoading);
    //Remove previous data
    setGrades({});
    //Fetch each result
    for (const result of results) {
      fetchGradesData(result, controller)
        .then((res) => {
          //Add to storage
          setGrades((old) => {
            return { ...old, [searchQueryLabel(result)]: res };
          });
          //Set loading status to done, unless total was 0 in calculateGrades
          setGradesLoading((old) => {
            old[searchQueryLabel(result)] = res.gpa !== -1 ? 'done' : 'error';
            return old;
          });
          addAcademicSessions(res.grades.map((session) => session._id));
        })
        .catch((error) => {
          //Set loading status to error
          setGradesLoading((old) => {
            old[searchQueryLabel(result)] = 'error';
            return old;
          });
          console.error('Grades data for ' + searchQueryLabel(result), error);
        });
    }

    //RMP data
    //Get lsit of profs from results
    let professorsInResults = results
      //Remove course data from each
      .map((result) => convertToProfOnly(result))
      //Remove empty objects (used to be only course data)
      .filter((obj) => Object.keys(obj).length !== 0);
    //Remove duplicates so as not to fetch multiple times
    professorsInResults = removeDuplicates(professorsInResults);
    //Set loading states to loading
    const blankRmpLoading: { [key: string]: 'loading' | 'done' | 'error' } = {};
    for (const professor of professorsInResults) {
      blankRmpLoading[searchQueryLabel(professor)] = 'loading';
    }
    setRmpLoading(blankRmpLoading);
    //Remove previous data
    setRmp({});
    //Fetch each professor
    for (const professor of professorsInResults) {
      fetchRmpData(professor, controller)
        .then((res) => {
          //Add to storage
          setRmp((old) => {
            return { ...old, [searchQueryLabel(professor)]: res };
          });
          //Set loading status to done
          setRmpLoading((old) => {
            old[searchQueryLabel(professor)] = 'done';
            return old;
          });
        })
        .catch((error) => {
          //Set loading status to error
          setRmpLoading((old) => {
            old[searchQueryLabel(professor)] = 'error';
            return old;
          });
          console.error('RMP data for ' + searchQueryLabel(professor), error);
        });
    }

    return () => {
      controller.abort();
    };
  }, [results]);

  //Filtered results
  const [includedResults, setIncludedResults] = useState<SearchQuery[]>([]);

  //On change to filters, results, or what to filter them by: filter list
  useEffect(() => {
    if (router.isReady) {
      setIncludedResults(
        results.filter((result) => {
          //Remove if over threshold
          const courseGrades = grades[searchQueryLabel(result)];
          if (
            typeof router.query.minGPA === 'string' &&
            typeof courseGrades !== 'undefined' &&
            courseGrades.gpa < parseFloat(router.query.minGPA)
          ) {
            return false;
          }
          const courseRmp = rmp[searchQueryLabel(convertToProfOnly(result))];
          if (
            typeof router.query.minRating === 'string' &&
            typeof courseRmp !== 'undefined' &&
            courseRmp.averageRating < parseFloat(router.query.minRating)
          ) {
            return false;
          }
          if (
            typeof router.query.maxDiff === 'string' &&
            typeof courseRmp !== 'undefined' &&
            courseRmp.averageDifficulty > parseFloat(router.query.maxDiff)
          ) {
            return false;
          }
          return true;
        }),
      );
    } else {
      setIncludedResults(results);
    }
  }, [
    router.isReady,
    router.query.minGPA,
    router.query.minRating,
    router.query.maxDiff,
    results,
    grades,
    rmp,
  ]);

  //List of course+prof combos saved for comparison
  const [compare, setCompare] = useState<SearchQuery[]>([]);
  //Their saved grade data
  const [compareGrades, setCompareGrades] = useState<{
    [key: string]: GradesType;
  }>({});
  //Saved data for their professors
  const [compareRmp, setCompareRmp] = useState<{
    [key: string]: RateMyProfessorData;
  }>({});

  //Add a course+prof combo to compare (happens from search results)
  function addToCompare(searchQuery: SearchQuery) {
    //If not already there
    if (compare.findIndex((obj) => searchQueryEqual(obj, searchQuery)) === -1) {
      //Add to list
      setCompare((old) => old.concat([searchQuery]));
      //Save grade data
      setCompareGrades((old) => {
        return {
          ...old,
          [searchQueryLabel(searchQuery)]:
            grades[searchQueryLabel(searchQuery)],
        };
      });
      //Save prof data
      setCompareRmp((old) => {
        return {
          ...old,
          [searchQueryLabel(convertToProfOnly(searchQuery))]:
            rmp[searchQueryLabel(convertToProfOnly(searchQuery))],
        };
      });
    }
  }

  //Remove a course+prof combo from compare
  function removeFromCompare(searchQuery: SearchQuery) {
    //If already there
    if (compare.findIndex((obj) => searchQueryEqual(obj, searchQuery)) !== -1) {
      //Remove from list
      setCompare((old) =>
        old.filter((el) => !searchQueryEqual(el, searchQuery)),
      );
      //Remove from saved grade data
      setCompareGrades((old) => {
        delete old[searchQueryLabel(searchQuery)];
        return old;
      });
      //If no other courses in compare have the same professor
      if (
        !compare
          .filter((el) => !searchQueryEqual(el, searchQuery))
          .some((el) => searchQueryEqual(el, convertToProfOnly(searchQuery)))
      ) {
        //Remove from saved rmp data
        setCompareRmp((old) => {
          delete old[searchQueryLabel(convertToProfOnly(searchQuery))];
          return old;
        });
      }
    }
  }

  //Main content: loading, error, or normal
  let contentComponent;

  if (state === 'loading') {
    contentComponent = <LinearProgress className="mt-8 h-2"></LinearProgress>;
  } else if (state === 'error') {
    contentComponent = (
      <div className="mt-8 flex flex-col items-center">
        <Typography
          variant="h2"
          gutterBottom
          className="text-gray-600 font-semibold"
        >
          Error fetching results.
        </Typography>
        <Button variant="outlined" onClick={() => router.reload()}>
          Reload the page
        </Button>
      </div>
    );
  } else {
    //Add RHS tabs, only add overview tab is one course/prof
    const names = [];
    const tabs = [];
    if (professors.length === 1) {
      names.push('Professor');
      tabs.push(
        <ProfessorOverview
          key="professor"
          professor={professors[0]}
          grades={grades[searchQueryLabel(professors[0])]}
          rmp={rmp[searchQueryLabel(professors[0])]}
        />,
      );
    }
    if (courses.length === 1) {
      names.push('Class');
      tabs.push(
        <CourseOverview
          key="course"
          course={courses[0]}
          grades={grades[searchQueryLabel(courses[0])]}
        />,
      );
    }
    names.push('Compare');
    tabs.push(
      <Compare
        key="compare"
        courses={compare}
        grades={compareGrades}
        rmp={compareRmp}
      />,
    );
    contentComponent = (
      <Grid container component="main" wrap="wrap-reverse" spacing={2}>
        <Grid item xs={12} sm={7} md={7}>
          <SearchResultsTable
            includedResults={includedResults}
            grades={grades}
            rmp={rmp}
            gradesLoading={gradesLoading}
            rmpLoading={rmpLoading}
            compare={compare}
            addToCompare={addToCompare}
            removeFromCompare={removeFromCompare}
          />
        </Grid>
        <Grid item xs={false} sm={5} md={5}>
          <Card className="h-96 px-4 py-2">
            <Carousel names={names}>{tabs}</Carousel>
          </Card>
        </Grid>
      </Grid>
    );
  }

  /* Final page */

  return (
    <>
      <Head>
        <link
          rel="canonical"
          href="https://trends.utdnebula.com/dashboard"
          key="canonical"
        />
        <meta
          property="og:url"
          content="https://trends.utdnebula.com/dashboard"
        />
      </Head>
      <div className="w-full bg-light h-full">
        <TopMenu />
        <main className="p-4">
          {courses.length === 0 && professors.length === 0 ? (
            <Typography
              variant="h2"
              className="mt-8 text-center text-gray-600 font-semibold"
            >
              Search for a course or professor above.
            </Typography>
          ) : (
            <>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={7} md={7}>
                  <Filters
                    manageQuery
                    academicSessions={academicSessions}
                    chosenSessions={chosenSessions}
                    setChosenSessions={setChosenSessions}
                  />
                </Grid>
                <Grid item xs={false} sm={5} md={5}></Grid>
              </Grid>
              {contentComponent}
            </>
          )}
        </main>
      </div>
    </>
  );
};

export default Dashboard;
