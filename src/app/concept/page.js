'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function ConceptPage() {
  const steps = [
    {
      title: 'Upload your datasets',
      imgSrc: '/upload.png',
      imgAlt: 'Uploading datasets',
    },
    {
      title: 'Define what you want to analyze (cells, genes etc.)',
      imgSrc: '/dashboard.png',
      imgAlt: 'Defining analysis targets',
    },
    {
      title: 'Wait until your graph is constructed',
      imgSrc: '/graph_view.svg',
      imgAlt: 'Building graph',
    },
    {
      title: 'Analyze your data',
      imgSrc: '/chat.png',
      imgAlt: 'Analyzing data',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
       {/* Info box */}
      <div className="absolute top-4 right-4 bg-yellow-100 border border-yellow-300 text-yellow-800 text-sm px-4 py-2 rounded-lg shadow max-w-xs">
        Uploading not available yet — only{' '}
        <Link href="/chat" className="underline font-medium hover:text-yellow-900">
          chat
        </Link>{' '}
        works.
      </div>
      <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-12">
          Understand your data and make them <span className="text-brand">FAIR</span>
        </h1>

        <div className="grid gap-8 md:grid-cols-2">
          {steps.map((step, idx) => (
            <div 
            key={idx}
            className="bg-white shadow-lg rounded-2xl p-6 flex flex-col items-start text-left hover:shadow-xl transition">
            <div className="w-60 h-40 md:w-90 md:h-40 mb-4 relative self-center">
              <Image
                src={step.imgSrc}
                alt={step.imgAlt}
                fill
                className="object-contain"
              />
            </div>

            {/* Badge + title left‑aligned */}
            <div className="flex items-center mb-2">
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-brand text-white text-lg font-semibold">
                {idx + 1}
              </div>
              <h3 className="ml-3 text-xl font-semibold text-gray-800">
                {step.title}
              </h3>
            </div>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <Link
            href="/upload"
            className="inline-block mt-8 px-6 py-3 bg-brand hover:bg-brand-dark text-white text-lg rounded-xl shadow transition"
          >
            Step 1: Upload
          </Link>
        </div>
      </div>
    </div>
  );
}
