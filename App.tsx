
import React, { useState, useEffect, useCallback } from 'react';
import FileBrowser from './components/FileBrowser';
import NoteEditor from './components/NoteEditor';
import { type NoteFile, type FileSystem } from './types';
import { getInitialFileSystem } from './services/storageService';

const App: React.FC = () => {
  const [fileSystem, setFileSystem] = useState<FileSystem>(getInitialFileSystem);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('vector-notes-app', JSON.stringify(fileSystem));
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  }, [fileSystem]);

  const updateNote = useCallback((updatedNote: NoteFile) => {
    setFileSystem(prevFs => ({
      ...prevFs,
      notes: {
        ...prevFs.notes,
        [updatedNote.id]: updatedNote,
      },
    }));
  }, []);

  const handleSelectNote = (noteId: string) => {
    setActiveNoteId(noteId);
  };

  const handleCloseNote = () => {
    setActiveNoteId(null);
  };

  const activeNote = activeNoteId ? fileSystem.notes[activeNoteId] : null;

  return (
    <div className="h-screen w-screen bg-gray-900 text-gray-100 font-sans">
      {activeNote ? (
        <NoteEditor
          note={activeNote}
          onClose={handleCloseNote}
          onUpdate={updateNote}
        />
      ) : (
        <FileBrowser
          fileSystem={fileSystem}
          setFileSystem={setFileSystem}
          onSelectNote={handleSelectNote}
        />
      )}
    </div>
  );
};

export default App;
