// Fix: Create `NoteEditor.tsx` component.
import React, { useState, useMemo, useRef } from 'react';
import { type NoteFile, type Tab, type Stroke, Tool } from '../types';
import Canvas from './Canvas';
import { PlusIcon, ArrowUturnLeftIcon, ArrowLeftIcon } from './Icons';
import ToolPalette from './ToolPalette';

interface NoteEditorProps {
  note: NoteFile;
  onClose: () => void;
  onUpdate: (updatedNote: NoteFile) => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onClose, onUpdate }) => {
  const [noteName, setNoteName] = useState(note.name);
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingTabName, setEditingTabName] = useState('');
  const tabNameInputRef = useRef<HTMLInputElement>(null);

  // Tool State
  const [currentTool, setCurrentTool] = useState<Tool>(Tool.Pen);
  const [currentColor, setCurrentColor] = useState<string>('#FFFFFF');
  const [currentWidth, setCurrentWidth] = useState<number>(3);

  const activeTab = useMemo(() => {
    return note.tabs.find(t => t.id === note.activeTabId) || note.tabs[0];
  }, [note.tabs, note.activeTabId]);

  const handleNoteNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNoteName(e.target.value);
  };

  const handleNoteNameBlur = () => {
    if (noteName.trim() && noteName.trim() !== note.name) {
      onUpdate({ ...note, name: noteName.trim(), updatedAt: new Date().toISOString() });
    } else {
      setNoteName(note.name);
    }
  };

  const handleTabClick = (tabId: string) => {
    if (tabId !== note.activeTabId) {
      onUpdate({ ...note, activeTabId: tabId, updatedAt: new Date().toISOString() });
    }
  };

  const handleAddTab = () => {
    const newTabId = `tab-${Date.now()}`;
    const newTab: Tab = {
      // Fix: Corrected typo from `new_tab_id` to `newTabId`.
      id: newTabId,
      name: `Tab ${note.tabs.length + 1}`,
      strokes: [],
      height: 2000,
    };
    onUpdate({
      ...note,
      tabs: [...note.tabs, newTab],
      activeTabId: newTabId,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleStrokesChange = (newStrokes: Stroke[]) => {
    const updatedTabs = note.tabs.map(tab =>
      tab.id === activeTab.id ? { ...tab, strokes: newStrokes } : tab
    );
    onUpdate({ ...note, tabs: updatedTabs, updatedAt: new Date().toISOString() });
  };
  
  const handleUndo = () => {
    if (activeTab.strokes.length === 0) return;
    
    // Deselect all strokes before undoing a creation
    const newStrokes = activeTab.strokes.map(s => ({...s, selected: false})).slice(0, -1);
    handleStrokesChange(newStrokes);
  }

  const handleStartTabRename = (tab: Tab) => {
    setEditingTabId(tab.id);
    setEditingTabName(tab.name);
    setTimeout(() => tabNameInputRef.current?.select(), 0);
  };

  const handleTabNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingTabName(e.target.value);
  };
  
  const handleSaveTabName = () => {
    if (editingTabId) {
      const trimmedName = editingTabName.trim();
      if (trimmedName) {
        const updatedTabs = note.tabs.map(tab =>
          tab.id === editingTabId ? { ...tab, name: trimmedName } : tab
        );
        onUpdate({ ...note, tabs: updatedTabs, updatedAt: new Date().toISOString() });
      }
    }
    setEditingTabId(null);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <header className="flex-shrink-0 bg-gray-800 text-white shadow-md z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700" title="Back to file browser">
                <ArrowLeftIcon className="w-6 h-6" />
              </button>
              <input
                type="text"
                value={noteName}
                onChange={handleNoteNameChange}
                onBlur={handleNoteNameBlur}
                onKeyPress={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                className="bg-transparent text-xl font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md px-2 py-1"
              />
            </div>
            <div className="flex items-center gap-4">
              <button onClick={handleUndo} className="p-2 rounded-full hover:bg-gray-700" title="Undo last stroke" disabled={activeTab.strokes.length === 0}>
                <ArrowUturnLeftIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center border-t border-gray-700 overflow-x-auto">
            {note.tabs.map(tab => (
              <div key={tab.id} onDoubleClick={() => handleStartTabRename(tab)} className="flex-shrink-0">
                {editingTabId === tab.id ? (
                    <input
                        ref={tabNameInputRef}
                        type="text"
                        value={editingTabName}
                        onChange={handleTabNameChange}
                        onBlur={handleSaveTabName}
                        onKeyPress={(e) => e.key === 'Enter' && handleSaveTabName()}
                        className="bg-gray-700 text-white px-4 py-2 text-sm font-medium outline-none"
                        autoFocus
                    />
                ) : (
                    <button
                        onClick={() => handleTabClick(tab.id)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap ${
                        tab.id === activeTab.id
                            ? 'border-indigo-500 text-indigo-400'
                            : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'
                        }`}
                    >
                        {tab.name}
                    </button>
                )}
              </div>
            ))}
            <button onClick={handleAddTab} className="p-2 ml-2 rounded-full hover:bg-gray-700" title="Add new tab">
              <PlusIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow overflow-y-auto relative">
        {activeTab && (
          <Canvas
            key={activeTab.id}
            strokes={activeTab.strokes}
            onStrokesChange={handleStrokesChange}
            height={activeTab.height}
            tool={currentTool}
            color={currentColor}
            width={currentWidth}
          />
        )}
        <ToolPalette
          tool={currentTool}
          setTool={setCurrentTool}
          color={currentColor}
          setColor={setCurrentColor}
          width={currentWidth}
          setWidth={setCurrentWidth}
        />
      </main>
    </div>
  );
};

export default NoteEditor;