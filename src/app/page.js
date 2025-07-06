import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-20 px-4">
      <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-5xl font-extrabold text-gray-800 mb-6 leading-tight">
          <span className="text-brand">FAIR GraphRAG</span>: Make the Most of Your Data
        </h1>

        <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-10">
          Transform your datasets into powerful knowledge assets. FAIR GraphRAG empowers researchers, teams, and organizations to structure their data for findability, accessibility, interoperability and reusability — from the very beginning. Driven by graph-based connections and enhanced with a natural chatbot interface, this is data done right.
        </p>

        <Link href="/chat" passHref>
          <p className="inline-block mt-2 px-6 py-0 bg-brand hover:bg-brand-dark text-white text-lg rounded-xl shadow transition">
            Chat With Your Data
          </p>
        </Link>

        {/* —––––– Illustration Block –––––— */}
        <div className="mt-10 flex justify-center items-center space-x-10">
          {/* Files icon */}
          <img
            src="/files.svg"
            alt="Files"
            className="md:w-32 md:h-32 w-16 h-16"
          />

          {/* Inline SVG arrow */}
          <svg
            className="w-13 h-8 md:w-26 md:h-16 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="2" y1="12" x2="22" y2="12" />
            <polyline points="15 5 22 12 15 19" />
          </svg>

          {/* Graph icon */}
          <img
            src="/graph_view3.svg"
            alt="Graph View"
            className="w-36 h-36 md:w-50 md:h-50"
          />
        </div>
        {/* —––––– End Illustration –––––— */}

      </div>
    </div>
  )
}
