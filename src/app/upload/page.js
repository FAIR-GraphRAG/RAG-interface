'use client';

import { useRef } from 'react';

export default function Upload() {
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const files = e.target.files;
    console.log('Uploaded files:', files);
    // You can add upload logic here (e.g., API call to your backend or cloud)
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-12">
            Upload your dataset or data collection
        </h1>


        {/* Upload Section */}
        <div className="bg-white shadow-md rounded-2xl p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Upload your dataset or data collection</h2>
          <p className="text-gray-600 mb-6">Upload your files as CSV or PDF</p>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
            >
              Upload Files
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".csv,application/pdf"
              multiple
              onChange={handleFileUpload}
            />

            <button
              onClick={() => folderInputRef.current?.click()}
              className="text-blue-600 underline hover:text-blue-800 transition text-sm"
            >
              or Upload a folder
            </button>
            <input
              type="file"
              ref={folderInputRef}
              className="hidden"
              webkitdirectory="true"
              directory="true"
              multiple
              onChange={handleFileUpload}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
