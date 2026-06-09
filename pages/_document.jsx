import { Html, Head, Main, NextScript } from 'next/document';

// DM Sans (all UI) + Newsreader (hero / question headings only), per the
// approved TCA Design System. Loaded from Google Fonts with preconnect.
export default function Document() {
  return (
    <Html lang="en-GB">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Newsreader:opsz,wght@6..72,600;6..72,700&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#F4F8F7" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
