import { create } from 'zustand';

const useUploadStore = create((set) => ({
  items: [],

  // Add one or more individual files
  addFiles: (files) =>
    set((state) => ({
      items: [
        ...state.items,
        ...files.map((file) => ({
          id: `${Date.now()}-${Math.random()}`,
          name: file.name,
          type: 'file',
          file,
          study_objects: []  // initialize empty schema
        })),
      ],
    })),

  // Add an entire folder as one entry
  addFolder: (files) => {
    if (files.length === 0) return;
    const rootName = files[0].webkitRelativePath.split('/')[0];
    set((state) => ({
      items: [
        ...state.items,
        {
          id: `${Date.now()}-${Math.random()}`,
          name: rootName,
          type: 'folder',
          files: Array.from(files),
          study_objects: []  // initialize empty schema
        },
      ],
    }));
  },

  // Add a single study object to the schema
  addStudyObject: (id, obj) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id
          ? { ...item, study_objects: [...item.study_objects, obj] }
          : item
      ),
    })),

  // Edit a single study object at index
  editStudyObject: (id, index, obj) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id
          ? {
              ...item,
              study_objects: item.study_objects.map((so, i) =>
                i === index ? obj : so
              ),
            }
          : item
      ),
    })),

  // Remove a study object at index
  removeStudyObject: (id, index) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id
          ? {
              ...item,
              study_objects: item.study_objects.filter((_, i) => i !== index),
            }
          : item
      ),
    })),

  // (Optional) replace entire schema
  updateStudyObjects: (id, newStudyObjects) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id
          ? { ...item, study_objects: newStudyObjects }
          : item
      ),
    })),

  clearAll: () => set({ items: [] }),
}));

export default useUploadStore;