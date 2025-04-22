'use client';

import { useState, Fragment } from 'react';
import useUploadStore from '../stores/uploadStore'; // adjust path if needed
import { Edit2, Trash2, X } from 'lucide-react';
import Link from 'next/link'


export default function Dashboard() {
  const items = useUploadStore((s) => s.items);
  const addStudyObject = useUploadStore((s) => s.addStudyObject);
  const editStudyObject = useUploadStore((s) => s.editStudyObject);
  const removeStudyObject = useUploadStore((s) => s.removeStudyObject);

  // Local UI state
  const [editingId, setEditingId] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newObject, setNewObject] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const startEditing = (id) => {
    setEditingId(id);
    setEditingIndex(null);
    setNewObject('');
    setNewDesc('');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingIndex(null);
  };

  const handleSubmit = () => {
    if (!newObject || !newDesc || editingId === null) return;

    const obj = { object: newObject, description: newDesc };
    if (editingIndex !== null) {
      // update existing
      editStudyObject(editingId, editingIndex, obj);
    } else {
      // add new
      addStudyObject(editingId, obj);
    }

    // reset input but keep editor open
    setEditingIndex(null);
    setNewObject('');
    setNewDesc('');
  };

  const handleEditExisting = (id, idx) => {
    const item = items.find((i) => i.id === id);
    const so = item.study_objects[idx];
    setEditingId(id);
    setEditingIndex(idx);
    setNewObject(so.object);
    setNewDesc(so.description);
  };

  const handleDeleteExisting = (id, idx) => {
    removeStudyObject(id, idx);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-8">
          Dataset & Folder Dashboard
        </h1>

        <table className="w-full table-auto bg-white shadow-md rounded-2xl overflow-hidden">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-2 md:px-4 py-2 text-left">Name</th>
              <th className="px-2 md:px-4 py-2 text-left">Type</th>
              <th className="px-2 md:px-4 py-2 text-left">Schema Preview</th>
              <th className="px-2 md:px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <Fragment key={item.id}>
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{item.name}</td>
                  <td className="px-4 py-3 capitalize">{item.type}</td>
                  <td className="px-4 py-3">
                    {item.study_objects.length > 0
                      ? `${JSON.stringify(item.study_objects).slice(0, 50)}...`
                      : <span className="text-gray-400 italic">No objects</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => startEditing(item.id)}
                      className="text-brand hover:underline"
                    >
                      {item.study_objects.length > 0 ? 'Edit' : 'Add'}
                    </button>
                  </td>
                </tr>

                {editingId === item.id && (
                  <tr>
                    <td colSpan={4} className="bg-gray-100 px-4 py-4">
                      <div className="relative space-y-4 pt-10">
                        <button
                        onClick={cancelEditing}
                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                        aria-label="Close editor"
                        >
                        <X className="w-5 h-5" />
                        </button>

                        {/* Existing objects with edit/delete */}
                        {item.study_objects.length > 0 && (
                          <ul className="list-disc list-inside text-gray-700 space-y-2">
                            {item.study_objects.map((so, idx) => (
                              <li key={idx} className="flex justify-between items-center">
                                <span>
                                  <strong>{so.object}</strong>: {so.description}
                                </span>
                                <div className="flex space-x-2">
                                  <button onClick={() => handleEditExisting(item.id, idx)}>
                                    <Edit2 className="w-4 h-4 text-brand hover:text-blue-800" />
                                  </button>
                                  <button onClick={() => handleDeleteExisting(item.id, idx)}>
                                    <Trash2 className="w-4 h-4 text-red-600 hover:text-red-800" />
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* Input fields for new or editing object */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Object Name
                            </label>
                            <input
                              type="text"
                              value={newObject}
                              onChange={(e) => setNewObject(e.target.value)}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Description
                            </label>
                            <input
                              type="text"
                              value={newDesc}
                              onChange={(e) => setNewDesc(e.target.value)}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                            />
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex space-x-2">
                          <button
                            onClick={handleSubmit}
                            className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
                            disabled={!newObject || !newDesc}
                          >
                            {editingIndex !== null ? 'Update' : 'Add'}
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-xl hover:bg-gray-400 transition"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      <Link href="/graph" passHref>
        <p
        className="inline-block mt-8 px-6 py-3 bg-brand hover:bg-brand-dark text-white text-lg rounded-xl shadow transition"
        >
        Step 3: Construct The Graph
        </p>
    </Link>
    </div>
    </div>
  );
}