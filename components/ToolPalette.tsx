import React, { useState } from 'react';
import { Tool } from '../types';
import { PaintBrushIcon, PenIcon, LassoIcon, XMarkIcon } from './Icons';

interface ToolPaletteProps {
  tool: Tool;
  setTool: (tool: Tool) => void;
  color: string;
  setColor: (color: string) => void;
  width: number;
  setWidth: (width: number) => void;
}

const COLORS = ['#FFFFFF', '#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#A855F7'];
const WIDTHS = [2, 3, 5, 8, 12];

const ToolPalette: React.FC<ToolPaletteProps> = ({ tool, setTool, color, setColor, width, setWidth }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleToolChange = (newTool: Tool) => {
    setTool(newTool);
  };

  return (
    <div className="fixed bottom-8 right-8 z-20 flex flex-col items-end gap-4">
      {/* Tool Options */}
      {isOpen && tool === Tool.Pen && (
        <div className="bg-gray-700 p-3 rounded-lg shadow-2xl flex flex-col gap-4 transition-all duration-300 ease-in-out">
          {/* Colors */}
          <div className="flex gap-2 justify-center">
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full border-2 transition-transform duration-150 ${color === c ? 'border-white scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>
          {/* Widths */}
          <div className="flex gap-2 justify-center items-center">
             {WIDTHS.map(w => (
                <button
                    key={w}
                    onClick={() => setWidth(w)}
                    className={`flex justify-center items-center w-8 h-8 rounded-full transition-colors duration-150 ${width === w ? 'bg-indigo-500' : 'bg-gray-600 hover:bg-gray-500'}`}
                >
                    <div className="bg-white rounded-full" style={{ width: `${w}px`, height: `${w}px` }}/>
                </button>
             ))}
          </div>
        </div>
      )}

      {/* Tool Selection */}
      <div className="flex flex-col items-end gap-4">
        {isOpen && (
          <>
            <button
              onClick={() => handleToolChange(Tool.Lasso)}
              title="Lasso Select"
              className={`p-3 rounded-full shadow-lg transition-all duration-300 ease-in-out transform ${
                tool === Tool.Lasso ? 'bg-indigo-600 text-white' : 'bg-gray-600 text-gray-200 hover:bg-indigo-500'
              } ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}
              style={{ transitionDelay: '50ms' }}
            >
              <LassoIcon className="w-6 h-6" />
            </button>
            <button
              onClick={() => handleToolChange(Tool.Pen)}
              title="Pen"
              className={`p-3 rounded-full shadow-lg transition-all duration-300 ease-in-out transform ${
                tool === Tool.Pen ? 'bg-indigo-600 text-white' : 'bg-gray-600 text-gray-200 hover:bg-indigo-500'
              } ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}
            >
              <PenIcon className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 bg-indigo-600 text-white rounded-full shadow-2xl hover:bg-indigo-500 transition-transform duration-200 ease-in-out transform hover:scale-110"
        title="Toggle Tools"
      >
        {isOpen ? <XMarkIcon className="w-8 h-8" /> : <PaintBrushIcon className="w-8 h-8" />}
      </button>
    </div>
  );
};

export default ToolPalette;
