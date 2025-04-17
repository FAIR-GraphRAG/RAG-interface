import React from 'react';

const ConceptPage = () => {
  const steps = [
    'Step 1: Upload your datasets',
    'Step 2: Define what you want to analyze (cells, genes etc.)',
    'Step 3: Wait until your graph is constructed',
    'Step 4: Analyze your data',
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-12">
          Understand your data and make them <span className="text-blue-600">FAIR</span>
        </h1>
        <div className="space-y-8">
          {steps.map((text, idx) => (
            <div key={idx} className="flex items-center">
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-blue-600 text-white text-xl font-bold">
                {idx + 1}
              </div>
              <p className="ml-4 text-lg text-gray-700">{text}</p>
            </div>
          ))}
        </div>
        <div className="mt-12">
        <a
          href="/upload"
          className="inline-block px-6 py-3 bg-blue-600 text-white text-lg rounded-xl shadow hover:bg-blue-700 transition"
        >
          Upload Your Dataset
        </a>
        </div>
      </div>
    </div>
  );
};

export default ConceptPage;
