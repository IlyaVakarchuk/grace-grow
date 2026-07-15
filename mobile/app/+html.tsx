import { ScrollViewStyleReset } from "expo-router/html";
import { type PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="ru">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <title>GraceGrow — Plant Monitoring</title>
        <link rel="icon" href="/assets/favicon.png" />
        <ScrollViewStyleReset />
        <style>{`body { background-color: #121212; }`}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
