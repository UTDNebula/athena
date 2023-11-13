import '../styles/globals.css';

import GitHub from '@mui/icons-material/GitHub';
import { Card, IconButton, Tooltip, useMediaQuery } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Analytics } from '@vercel/analytics/react';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';
import Head from 'next/head';
import React from 'react';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});
const kallisto = localFont({
  src: [
    {
      path: '../fonts/Kallisto/Kallisto Thin.otf',
      weight: '100',
      style: 'normal',
    },
    {
      path: '../fonts/Kallisto/Kallisto Thin Italic.otf',
      weight: '100',
      style: 'italic',
    },
    {
      path: '../fonts/Kallisto/Kallisto Light.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../fonts/Kallisto/Kallisto Light Italic.otf',
      weight: '300',
      style: 'italic',
    },
    {
      path: '../fonts/Kallisto/Kallisto Medium.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../fonts/Kallisto/Kallisto Medium Italic.otf',
      weight: '500',
      style: 'italic',
    },
    {
      path: '../fonts/Kallisto/Kallisto Bold.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../fonts/Kallisto/Kallisto Bold Italic.otf',
      weight: '700',
      style: 'italic',
    },
    {
      path: '../fonts/Kallisto/Kallisto Heavy.otf',
      weight: '900',
      style: 'normal',
    },
    {
      path: '../fonts/Kallisto/Kallisto Heavy Italic.otf',
      weight: '900',
      style: 'italic',
    },
  ],
  variable: '--font-kallisto',
});

function MyApp({ Component, pageProps }: AppProps) {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const showGitInfo =
    typeof process.env.NEXT_PUBLIC_VERCEL_ENV !== 'undefined' &&
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview' &&
    typeof process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA !== 'undefined' &&
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA !== '';
  const darkModeElevation = prefersDarkMode ? 3 : 1;

  const muiTheme = createTheme({
    palette: {
      mode: prefersDarkMode ? 'dark' : 'light',
      primary: {
        main: '#7486ce',
      },
    },
    typography: {
      fontFamily: 'inherit',
    },
  });

  return (
    <>
      <Head>
        <title>UTD Trends</title>
        <link rel="icon" href="/Project_Nebula_Logo.svg" />
      </Head>
      <ThemeProvider theme={muiTheme}>
        <main className={inter.variable + ' ' + kallisto.variable}>
          <Component {...pageProps} />
        </main>
      </ThemeProvider>
      <Analytics />
      {showGitInfo ? (
        <>
          <Card
            className="w-fit h-fit bg-light fixed bottom-2 right-2 rounded-full"
            elevation={darkModeElevation}
          >
            <Tooltip title="Open GitHub commit for this instance">
              <a
                href={
                  'https://github.com/UTDNebula/utd-trends/commit/' +
                  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA
                }
                rel="noopener noreferrer"
                target="_blank"
              >
                <IconButton size="large">
                  <GitHub className="fill-dark text-3xl" />
                </IconButton>
              </a>
            </Tooltip>
          </Card>
        </>
      ) : null}
    </>
  );
}

export default MyApp;
