import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction, MetaFunction } from "@remix-run/node";

import "./tailwind.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export const meta: MetaFunction = () => {
  return [
    { title: "MorseMuse - Learn Morse Code" },
    { name: "description", content: "Learn Morse code efficiently and engagingly with MorseMuse." },
  ];
};


export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-blue-600 dark:bg-blue-800 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold text-center">MorseMuse</h1>
      </header>
      <main className="flex-grow container mx-auto p-4">
        <Outlet />
      </main>
      <footer className="bg-gray-200 dark:bg-gray-800 text-center p-4 mt-auto text-sm text-gray-600 dark:text-gray-400">
        © {new Date().getFullYear()} MorseMuse. All rights reserved.
      </footer>
    </div>
  );
}
