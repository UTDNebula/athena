import { Card } from '@mui/material';
import type { NextPage, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Carousel from '../../components/common/Carousel/carousel';
import { GraphChoice } from '../../components/graph/GraphChoice/GraphChoice';
import TopMenu from '../../components/navigation/topMenu/topMenu';
import { ExpandableSearchGrid } from '../../components/common/ExpandableSearchGrid/expandableSearchGrid';

type SearchQuery = {
  prefix?: string;
  number?: number;
  professorName?: string;
  sectionNumber?: string;
};

type NodeAttributes = {
  character: string;
  data?: SearchQuery;
  visited: boolean;
};

export const Dashboard: NextPage = () => {
  type datType = {
    name: string;
    data: number[];
  };
  const [dat, setDat] = useState<datType[]>([]);
  const [GPAdat, setGPADat] = useState<datType[]>([]);
  const [averageDat, setAverageDat] = useState<datType[]>([]);
  const [stdevDat, setStdevDat] = useState<datType[]>([]);
  function round(val: number) {
    return Math.round((val + Number.EPSILON) * 100) / 100;
  }
  const router = useRouter();
  const [state, setState] = useState('loading');

  useEffect(() => {
    fetch('/api/ratemyprofessorScraper?professors=Greg%20Ozbirn,John%20Cole', {
      method: 'GET',
    })
      .then((response) => response.json())
      .then((data) => console.log(data));
  });

  function searchTermsChange(searchTerms: SearchQuery[]) {
    //called from expandableSearchGrid when data being compared is changed
    console.log('Index search terms: ', searchTerms);
    /*if (searchTerms.length === 0) {
      setState('loading');
    }*/
    Promise.all(
      searchTerms.map((searchTerm: SearchQuery) => {
        let apiRoute = '';
        if (
          'prefix' in searchTerm &&
          typeof searchTerm.prefix === 'string' &&
          'number' in searchTerm &&
          typeof searchTerm.number === 'number' &&
          'professorName' in searchTerm &&
          typeof searchTerm.professorName === 'string' &&
          'sectionNumber' in searchTerm &&
          typeof searchTerm.sectionNumber === 'string'
        ) {
          //section
          apiRoute = 'section';
        } /*else if (
          'prefix' in searchTerm &&
          typeof searchTerm.prefix === 'string' &&
          'number' in searchTerm &&
          typeof searchTerm.number === 'number' &&
          'professorName' in searchTerm &&
          typeof searchTerm.professorName === 'string'
        ) { //course+professor
          apiRoute = '';
        }*/ else if (
          'prefix' in searchTerm &&
          typeof searchTerm.prefix === 'string' &&
          'number' in searchTerm &&
          typeof searchTerm.number === 'number'
        ) {
          //course
          apiRoute = 'course';
        } else if (
          'professorName' in searchTerm &&
          typeof searchTerm.professorName === 'string'
        ) {
          //professor
          apiRoute = 'professor';
        }
        //console.log('apiRoute', apiRoute, typeof searchTerm.number);
        return fetch(
          '/api/nebulaAPI/' +
            apiRoute +
            '?' +
            Object.keys(searchTerm)
              .map(
                (key) =>
                  key +
                  '=' +
                  encodeURIComponent(
                    String(searchTerm[key as keyof SearchQuery]),
                  ),
              )
              .join('&'),
          {
            method: 'GET',
            headers: {
              Accept: 'application/json',
            },
          },
        ).then((response) => response.json());
      }),
    )
      .then((responses) => {
        console.log('data from grid: ', responses);
      })
      .catch((error) => {
        setState('error');
        console.error('Nebula API Error', error);
      });
  }

  useEffect(() => {
    setState('loading');
    if (!router.isReady) return;
    if (
      'sections' in router.query &&
      typeof router.query.sections === 'string'
    ) {
      Promise.all(
        router.query.sections.split(',').map((section) =>
          fetch('/api/nebulaAPI/section?id=' + section, {
            method: 'GET',
            headers: {
              Accept: 'application/json',
            },
          }).then((response) => response.json()),
        ),
      )
        .then((responses) => {
          setDat(
            responses.map((data) => {
              let newDat: datType = {
                name: data.data.name,
                data: data.data.grade_distribution,
              };
              return newDat;
            }),
          );

          let newGPADat: datType[] = [];
          let newAverageDat: datType[] = [];
          let newStdevDat: datType[] = [];
          for (let i = 0; i < responses.length; i++) {
            const GPALookup = [
              4, 4, 3.67, 3.33, 3, 2.67, 2.33, 2, 1.67, 1.33, 1, 0.67, 0,
            ];
            let GPAGrades: number[] = [];
            for (
              let j = 0;
              j < responses[i].data.grade_distribution.length - 1;
              j++
            ) {
              GPAGrades = GPAGrades.concat(
                Array(responses[i].data.grade_distribution[j]).fill(
                  GPALookup[j],
                ),
              );
            }
            newGPADat.push({ name: responses[i].data.name, data: GPAGrades });
            const mean =
              GPAGrades.reduce((partialSum, a) => partialSum + a, 0) /
              GPAGrades.length;
            newAverageDat.push({
              name: responses[i].data.name,
              data: [round(mean)],
            });
            const stdev = Math.sqrt(
              GPAGrades.reduce(
                (partialSum, a) => partialSum + (a - mean) ** 2,
                0,
              ) / GPAGrades.length,
            );
            newStdevDat.push({
              name: responses[i].data.name,
              data: [round(stdev)],
            });
          }
          setGPADat(newGPADat);
          setAverageDat(newAverageDat);
          setStdevDat(newStdevDat);

          setState('success');
        })
        .catch((error) => {
          setState('error');
          console.error('Nebula API Error', error);
        });
    }
  }, [router.isReady, router.query, router.query.sections]);

  if (state === 'error' || state === 'loading') {
    return (
      <>
        <div className=" w-full bg-light h-full">
          <TopMenu />
          <ExpandableSearchGrid
            onChange={searchTermsChange}
          />
          <div className="w-full h-5/6 justify-center">
            <div className="w-full h-5/6 relative min-h-full">
              <Carousel>
                <div className="h-full m-4 ">
                  <Card className="h-96 p-4 m-4"></Card>
                </div>
                <div className="p-4 h-full">
                  <Card className="h-96 p-4 m-4"></Card>
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    <Card className="h-96 p-4 m-4"></Card>
                    <Card className="h-96 p-4 m-4"></Card>
                  </div>
                </div>
                <div className=" ">Hi</div>
              </Carousel>
            </div>
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      <div className=" w-full bg-light h-full">
        <TopMenu />
        <ExpandableSearchGrid
          onChange={searchTermsChange}
        />
        <div className="w-full h-5/6 justify-center">
          <div className="w-full h-5/6 relative min-h-full">
            <Carousel>
              <div className="h-full m-4 ">
                <Card className="h-96 p-4 m-4">
                  <GraphChoice
                    form="Bar"
                    title="Grades"
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
                    series={dat}
                  />
                </Card>
              </div>
              <div className="p-4 h-full">
                <Card className="h-96 p-4 m-4">
                  <GraphChoice
                    form="BoxWhisker"
                    title="GPA Box and Whisker"
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
                    series={GPAdat}
                  />
                </Card>
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <Card className="h-96 p-4 m-4">
                    <GraphChoice
                      form="Bar"
                      title="GPA Averages"
                      xaxisLabels={['Average']}
                      series={averageDat}
                    />
                  </Card>
                  <Card className="h-96 p-4 m-4">
                    <GraphChoice
                      form="Bar"
                      title="GPA Standard Deviations"
                      xaxisLabels={['Standard Deviation']}
                      series={stdevDat}
                    />
                  </Card>
                </div>
              </div>
              <div className=" ">Hi</div>
            </Carousel>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
