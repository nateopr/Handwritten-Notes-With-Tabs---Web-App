
import React, { useState } from 'react';
import { type FileSystem, type NoteFile } from '../types';
import { createNewNote } from '../services/storageService';
import { FolderIcon, DocumentPlusIcon } from './Icons';

interface FileBrowserProps {
  fileSystem: FileSystem;
  setFileSystem: React.Dispatch<React.SetStateAction<FileSystem>>;
  onSelectNote: (noteId: string) => void;
}

const FileBrowser: React.FC<FileBrowserProps> = ({ fileSystem, setFileSystem, onSelectNote }) => {
  const [newNoteName, setNewNoteName] = useState('');

  const handleCreateNote = () => {
    const name = newNoteName.trim() || `New Note ${Object.keys(fileSystem.notes).length + 1}`;
    const newNote = createNewNote(name);
    setFileSystem(prevFs => ({
      ...prevFs,
      notes: {
        ...prevFs.notes,
        [newNote.id]: newNote,
      },
    }));
    setNewNoteName('');
    onSelectNote(newNote.id);
  };
  
  // Fix: Explicitly typed `a` and `b` as NoteFile to resolve type inference errors, and corrected the sorting logic to sort by the `updatedAt` field.
  const sortedNotes = Object.values(fileSystem.notes).sort((a: NoteFile, b: NoteFile) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-white">My Notes</h1>
      </header>
      
      <div className="bg-gray-800 rounded-lg p-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={newNoteName}
            onChange={(e) => setNewNoteName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreateNote()}
            placeholder="Enter new note name..."
            className="flex-grow bg-gray-700 text-white placeholder-gray-400 rounded-md px-4 py-3 border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleCreateNote}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-md transition duration-200 ease-in-out transform hover:scale-105"
          >
            <DocumentPlusIcon className="w-6 h-6" />
            <span>Create Note</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {/* Fix: Explicitly type `note` to resolve type inference errors. */}
        {sortedNotes.map((note: NoteFile) => (
          <div
            key={note.id}
            onClick={() => onSelectNote(note.id)}
            className="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-700 hover:shadow-lg transition-all duration-200 aspect-w-1 aspect-h-1 flex flex-col justify-between"
          >
              <FolderIcon className="w-16 h-16 mx-auto text-indigo-400" />
              <p className="text-center font-medium mt-2 break-words line-clamp-2">{note.name}</p>
          </div>
        ))}
      </div>
       {sortedNotes.length === 0 && (
         <div className="text-center py-16 text-gray-500">
            <p className="text-lg">No notes yet.</p>
            <p>Create your first note above to get started!</p>
         </div>
       )}
    </div>
  );
};

export default FileBrowser;