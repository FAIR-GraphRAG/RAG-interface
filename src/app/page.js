export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-20 px-4">
      <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-5xl font-extrabold text-gray-800 mb-6 leading-tight">
          <span className="text-blue-600">FAIR Graph RAG</span>: Make the Most of Your Data
        </h1>

        <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-10">
          Transform your datasets into powerful knowledge assets. FAIR Graph RAG empowers researchers, teams, and organizations to structure their data for findability, accessibility, and intelligent interaction — from the very beginning. Built for interoperability, driven by graph-based connections, and enhanced with a natural chatbot interface, this is data done right.
        </p>

        <a
          href="/concept"
          className="inline-block px-6 py-3 bg-blue-600 text-white text-lg rounded-xl shadow hover:bg-blue-700 transition"
        >
          Learn How It Works
        </a>
      </div>
    </div>
  );
}
