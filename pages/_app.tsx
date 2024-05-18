import '../styles/globals.css';

import { useMediaQuery } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Analytics } from '@vercel/analytics/react';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';
import Head from 'next/head';
import React from 'react';

import FeedbackPopup from '../components/common/FeedbackPopup/feedbackPopup';
import GitHubButton from '../components/common/GitHubButton/gitHubButton';

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

  const muiTheme = createTheme({
    palette: {
      mode: prefersDarkMode ? 'dark' : 'light',
      //copied from tailwind.config.js
      primary: {
        main: '#573dff',
      },
      secondary: {
        main: '#573dff',
        light: '#c2c8ff',
      },
      error: {
        main: '#ff5743',
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
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="icon" href="/logoIcon.svg" type="image/svg+xml" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>
      <ThemeProvider theme={muiTheme}>
        <div
          className={
            inter.variable +
            ' ' +
            kallisto.variable +
            ' h-full text-haiti dark:text-white'
          }
        >
          <Component {...pageProps} />
          <FeedbackPopup />
          <GitHubButton />
        </div>
      </ThemeProvider>
      <Analytics />
    </>
  );
}

export default MyApp;
