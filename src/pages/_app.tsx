import '@/styles/globals.css';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { GoogleAnalytics } from '@next/third-parties/google';
import { SpeedInsights } from '@vercel/speed-insights/react';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import resolveConfig from 'tailwindcss/resolveConfig';

import tailwindConfig from '@/../tailwind.config.js';
import FeedbackPopup from '@/components/common/FeedbackPopup/feedbackPopup';
import GitHubButton from '@/components/common/GitHubButton/gitHubButton';

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

const fullTailwindConfig = resolveConfig(tailwindConfig);

function MyApp({ Component, pageProps }: AppProps) {
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  const colors = fullTailwindConfig.theme.colors as any;
  const palette = {
    palette: {
      //copied from tailwind.config.js
      primary: {
        main: colors.royal as string,
      },
      secondary: {
        main: colors.royal as string,
        light: colors.periwinkle as string,
      },
      error: {
        main: colors.persimmon['500'] as string,
      },
    },
  };
  const muiTheme = createTheme({
    cssVariables: true,
    colorSchemes: {
      light: palette,
      dark: palette,
    },
    typography: {
      fontFamily: 'inherit',
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: parseInt(fullTailwindConfig.theme.screens.sm),
        md: parseInt(fullTailwindConfig.theme.screens.md),
        lg: parseInt(fullTailwindConfig.theme.screens.lg),
        xl: parseInt(fullTailwindConfig.theme.screens.xl),
      },
    },
  });

  const router = useRouter();

  return (
    <>
      <GoogleAnalytics gaId="G-CC86XR1562" />
      <Head>
        <title>UTD TRENDS</title>
        <meta key="og:title" property="og:title" content="UTD TRENDS" />
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
      <SpeedInsights route={router.pathname} />
    </>
  );
}

export default MyApp;
