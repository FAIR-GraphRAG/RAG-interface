'use client'

import { useRef } from 'react'
import useUploadStore from '../stores/uploadStore'
import { Folder, FileText } from 'lucide-react'
import Link from 'next/link'

export default function Upload() {
  const fileInputRef = useRef(null)
  const folderInputRef = useRef(null)

  // Zustand store actions & state
  const addFiles = useUploadStore((s) => s.addFiles)
  const addFolder = useUploadStore((s) => s.addFolder)
  const items = useUploadStore((s) => s.items)

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files)
    addFiles(files)
  }

  const handleFolderUpload = (e) => {
    const files = Array.from(e.target.files)
    addFolder(files)
  }

  const goToDashboard = () => {
    if (items.length > 0) {
      router.push('/dashboard');
    } else {
      alert('Please upload at least one file or folder first.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-12">
          Upload your dataset or data collection
        </h1>

        {/* Upload Section */}
        <div className="bg-white shadow-md rounded-2xl p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Upload your dataset or data collection
          </h2>
          <p className="text-gray-600 mb-6">Upload your files as CSV or PDF</p>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2 border-2 border-brand text-brand rounded-xl hover:bg-blue-50 transition"
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
              className="text-brand underline hover:text-blue-800 transition text-sm"
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
              onChange={handleFolderUpload}
            />
          </div>
        </div>

        {/* Display uploaded items */}
        <div className="mt-8 rounded-2xl p-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Uploaded Items</h2>
          {items.length === 0 ? (
            <p className="text-gray-500 italic">No items uploaded yet.</p>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {item.type === 'folder' ? (
                      <Folder className="w-6 h-6 text-blue-500" />
                    ) : (
                      <FileText className="w-6 h-6 text-green-500" />
                    )}
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <span className="text-sm text-gray-500 capitalize">{item.type}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Check if items uploaded: */}
        {items.length > 0 ? (
          <Link href="/dashboard">
            <p className="inline-block px-6 py-3 bg-brand text-white text-lg rounded-xl shadow hover:bg-brand-dark transition">
              Step 2: Define
            </p>
          </Link>
        ) : (
          <button
            onClick={goToDashboard}
            disabled
            className="inline-block px-6 py-3 border border-brand text-brand text-lg rounded-xl opacity-50 cursor-not-allowed"
          >
            Step 2: Define
          </button>
        )}
      </div>
    </div>
  )
}
