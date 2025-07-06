'use client';

import React from 'react';

function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 text-gray-800">
      <h1 className="text-3xl font-bold mb-4">About</h1>
      <p className="mb-4">
        This app lets you interact with your data using natural language. You can ask questions, explore relationships,
        and inspect underlying graph structures — powered by Neo4j and a conversational AI.
      </p>
      <p className="mb-4">
        Upload your dataset, and the assistant will help you extract insights by generating Cypher queries, visualizing
        connections, and surfacing important metadata.
      </p>
      <p className="mb-4">
        This app was developed in the context of the master thesis <em>FAIR-by-Design: FAIR Graph Retrieval-Augmented
        Generation for Dataset Analysis</em> at the chair of Datastream Management and Analysis, Computer Science 5, 
        RWTH Aachen University.
      </p>
      <p className="text-sm text-gray-500 mt-8">
        Built with ❤️ using React, Next.js, Neo4j, and OpenAI.
      </p>
    </div>
  );
}

export default AboutPage;
