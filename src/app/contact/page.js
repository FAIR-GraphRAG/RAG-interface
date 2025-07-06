'use client';

import React from 'react';

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto p-6 text-gray-800">
      <h1 className="text-3xl font-bold mb-4">Contact</h1>
      <p className="mb-6 text-gray-700">
        This application is part of a master's thesis project. If you have questions about the research, the technical implementation, or would like to provide feedback, please feel free to reach out.
      </p>

      <div className="space-y-4 text-gray-700">
        <p>
          📧 <span className="font-medium">Email:</span>{' '}
          <a href="mailto:your.email@university.edu" className="text-brand underline">
            marlena.flueh@rwth-aachen.de
          </a>
        </p>
        <p>
          🏫 <span className="font-medium">Institution:</span>{' '}
          <span className="italic">RWTH Aachen University</span>
        </p>
        <p>
          👤 <span className="font-medium">Author:</span>{' '}
          <span>Marlena Flüh</span>
        </p>
        <p>
          📁 <span className="font-medium">Thesis Title:</span>{' '}
          <span className="italic">"FAIR-by-Design: FAIR Graph Retrieval-Augmented Generation for Dataset Analysis"</span>
        </p>
      </div>

      <p className="text-sm text-gray-500 mt-10">
        Thank you for your interest in this project.
      </p>
    </div>
  );
}
