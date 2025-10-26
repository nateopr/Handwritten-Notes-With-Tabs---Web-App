import { type FileSystem, type NoteFile, type Tab, type Point } from '../types';

const STORAGE_KEY = 'vector-notes-app';

const INITIAL_CANVAS_HEIGHT = 2000; // Default height for a new canvas

export const getInitialFileSystem = (): FileSystem => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      const fs = JSON.parse(storedData) as FileSystem;
      // Retroactively add properties for backward compatibility
      Object.values(fs.notes).forEach((note: any) => {
        note.tabs.forEach((tab: any) => {
          // Add height if missing
          if (tab.height === undefined) {
            tab.height = INITIAL_CANVAS_HEIGHT;
          }
          // Migrate old stroke format (Point[]) to new format (Stroke object)
          if (tab.strokes && tab.strokes.length > 0 && Array.isArray(tab.strokes[0])) {
            tab.strokes = tab.strokes.map((strokePoints: Point[], index: number) => ({
                id: `migrated-${tab.id}-${index}-${Date.now()}`,
                points: strokePoints,
                color: '#FFFFFF',
                width: 3,
                selected: false,
            }));
          }
        });
      });
      return fs as FileSystem;
    }
  } catch (error) {
    console.error("Failed to parse from localStorage:", error);
    localStorage.removeItem(STORAGE_KEY);
  }

  // Return a default structure if nothing is stored or parsing fails
  const initialTab: Tab = {
    id: 'default-tab-1',
    name: 'Tab 1',
    strokes: [],
    height: INITIAL_CANVAS_HEIGHT,
  };

  const initialNote: NoteFile = {
    id: 'welcome-note',
    name: 'Welcome Note',
    tabs: [initialTab],
    activeTabId: initialTab.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return {
    notes: {
      'welcome-note': initialNote,
    },
  };
};

export const createNewNote = (name: string): NoteFile => {
    const newTabId = `tab-${Date.now()}`;
    return {
        id: `note-${Date.now()}`,
        name,
        tabs: [{ id: newTabId, name: 'Tab 1', strokes: [], height: INITIAL_CANVAS_HEIGHT }],
        activeTabId: newTabId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
};