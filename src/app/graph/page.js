'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function GraphConstructionPage() {
  const totalSteps = 6;
  const buildDurationMs = 5000;
  const intervalMs = buildDurationMs / totalSteps; // ~833ms per step
  const finishDelayMs = 10000; // show success after 10s

  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    // animate the construction frames
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % totalSteps);
    }, intervalMs);

    // after finishDelayMs, stop the animation and show success
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setFinished(true);
    }, finishDelayMs);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 px-4">
      {!finished ? (
        <>
          <img
            src={`/graph_step${step + 1}.svg`}
            alt={`Graph construction step ${step + 1}`}
            className="w-48 md:w-96 h-auto mb-16"
          />
          <h1 className="text-2xl font-semibold text-gray-800  text-center">
            Wait until your graph is constructed…
          </h1>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-semibold text-green-700 mb-8 text-center">
            🎉 Your graph is ready!
          </h1>
          <Link
            href="/chat"
            className="inline-block px-8 py-4 bg-green-600 hover:bg-green-700 text-white text-lg font-medium rounded-xl shadow transition"
          >
            Chat With Your Data
          </Link>
        </>
      )}
    </div>
  );
}
