"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { GifPile } from "@/components/mean-girls/gif-pile";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  CHARACTER_IDS,
  CHARACTERS,
  EMPTY_PROBABILITIES,
  type Probabilities,
} from "@/lib/characters";

type ClassifyResult = {
  choice: string | null;
  confidence: number;
  probabilities: Probabilities;
};

async function classify([, text]: readonly [
  string,
  string,
]): Promise<ClassifyResult> {
  const response = await fetch("/api/classify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "Classification failed");
  return data;
}

export function MeanGirlQuiz() {
  const [text, setText] = useState("");
  const trimmed = text.trim();
  const query = useDebouncedValue(trimmed, 250);

  const { data, error } = useSWR(
    query ? (["classify", query] as const) : null,
    classify,
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
      dedupingInterval: 60_000,
    },
  );

  const probabilities =
    trimmed && data ? data.probabilities : EMPTY_PROBABILITIES;
  const targetsRef = useRef<Probabilities>(EMPTY_PROBABILITIES);
  const magnetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    targetsRef.current = probabilities;
  }, [probabilities]);

  const top = useMemo(() => {
    const id = CHARACTER_IDS.reduce((best, next) =>
      probabilities[next] > probabilities[best] ? next : best,
    );
    return probabilities[id] > 0
      ? {
          name: CHARACTERS[id].name,
          percent: Math.round(probabilities[id] * 100),
        }
      : null;
  }, [probabilities]);

  const sticker =
    error && trimmed
      ? "Jev is being so un-fetch"
      : top
        ? `${top.percent}% ${top.name}`
        : null;

  return (
    <main className="burn-book-bg relative h-dvh w-full touch-manipulation overflow-hidden">
      <h1 className="sr-only">Which Mean Girl are you?</h1>

      <GifPile targetsRef={targetsRef} magnetRef={magnetRef} />

      <div className="pointer-events-none absolute inset-x-0 top-[36%] z-50 flex -translate-y-1/2 justify-center px-4">
        <div
          ref={magnetRef}
          className="pointer-events-auto relative w-full max-w-5xl"
        >
          <label htmlFor="mean-girl-input" className="sr-only">
            Type something a Mean Girl would say
          </label>
          <input
            id="mean-girl-input"
            type="text"
            autoFocus
            autoComplete="off"
            spellCheck={false}
            maxLength={200}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="that's so fetch"
            className="w-full rounded-full border-[6px] border-primary bg-card px-8 py-3 text-center font-display text-[clamp(2.25rem,7vw,6rem)] leading-tight text-primary shadow-[0_10px_0_var(--foreground)] outline-none placeholder:text-primary/30 focus-visible:shadow-[0_10px_0_var(--foreground),0_0_0_10px_color-mix(in_oklab,var(--primary)_35%,transparent)] md:px-12"
          />
          {sticker && (
            <div
              aria-hidden="true"
              className="sticker-wiggle absolute -top-7 -right-1 rounded-full border-4 border-card bg-foreground px-4 py-1.5 font-display text-lg whitespace-nowrap text-primary-foreground shadow-[0_4px_0_var(--primary)] md:-top-9 md:right-6 md:px-6 md:py-2 md:text-3xl"
            >
              {sticker}
            </div>
          )}
          <p role="status" aria-live="polite" className="sr-only">
            {sticker ?? ""}
          </p>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        <a
          href="https://github.com/The-Best-Codes/jev-mean-girls"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View this project on GitHub"
          className="grid size-7 place-items-center rounded-full bg-card text-foreground shadow-[0_3px_0_var(--foreground)] transition-transform hover:-translate-y-0.5"
        >
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.726-4.043-1.61-4.043-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.304-5.467-1.333-5.467-5.93 0-1.31.467-2.38 1.235-3.22-.123-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.3 1.23a11.5 11.5 0 013.003-.404c1.02.005 2.047.138 3.003.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.652.242 2.873.12 3.176.77.84 1.233 1.91 1.233 3.22 0 4.61-2.807 5.624-5.48 5.922.43.372.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .32.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
          </svg>
        </a>
        <a
          href="https://docs.typesafe.ai"
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-card px-3 py-1 text-sm font-semibold text-foreground shadow-[0_3px_0_var(--foreground)] transition-transform hover:-translate-y-0.5"
        >
          classified live by Jev
        </a>
      </div>
    </main>
  );
}
