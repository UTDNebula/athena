import { Head, Html, Main, NextScript } from 'next/document';
import React from 'react';
import resolveConfig from 'tailwindcss/resolveConfig';

import tailwindConfig from '@/../tailwind.config.js';

const fullTailwindConfig = resolveConfig(tailwindConfig);

function Document() {
  return (
    <Html lang="en">
      <Head prefix="og: http://ogp.me/ns#">
        <meta
          name="description"
          content="Choose the perfect classes for you: Nebula Labs's data analytics platform to help you make informed decisions about your coursework with grade and Rate My Professors data."
        />
        <meta
          name="theme-color"
          // eslint-disable-next-line  @typescript-eslint/no-explicit-any
          content={(fullTailwindConfig.theme.colors as any).royal as string}
        />
        <meta
          property="og:description"
          content="Choose the perfect classes for you: Nebula Labs's data analytics platform to help you make informed decisions about your coursework with grade and Rate My Professors data."
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://trends.utdnebula.com/logoIcon.png"
        />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:alt" content="Nebula Labs Icon." />
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="512" />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:domain" content="trends.utdnebula.com" />
      </Head>
      <body className="font-inter bg-white dark:bg-black">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

export default Document;
