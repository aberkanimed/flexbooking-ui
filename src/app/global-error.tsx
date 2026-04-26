"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 antialiased">
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <button
          onClick={reset}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm text-white hover:opacity-90 dark:bg-white dark:text-gray-900"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
