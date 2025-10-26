import { type } from "os";

// Fix: Create `types.ts` to define shared data structures for the application.
export interface Point {
  x: number;
  y: number;
  pressure: number;
}

export enum Tool {
  Pen,
  Lasso,
}

export interface Stroke {
  id: string;
  points: Point[];
  color: string;
  width: number;
  selected?: boolean;
}

export interface Tab {
  id: string;
  name: string;
  strokes: Stroke[];
  height: number;
}

export interface NoteFile {
  id: string;
  name: string;
  tabs: Tab[];
  activeTabId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FileSystem {
  notes: {
    [key: string]: NoteFile;
  };
}