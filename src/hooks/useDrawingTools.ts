import { useState, useCallback } from 'react';
import { DrawingTool, generateToolId } from '@/lib/drawingTools';

export const useDrawingTools = () => {
  const [tools, setTools] = useState<DrawingTool[]>([]);
  const [selectedTool, setSelectedTool] = useState<DrawingTool | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const addTool = useCallback((tool: Omit<DrawingTool, 'id'>) => {
    const newTool: DrawingTool = {
      ...tool,
      id: generateToolId(),
    };
    setTools((prev) => [...prev, newTool]);
    return newTool;
  }, []);

  const updateTool = useCallback((id: string, updates: Partial<DrawingTool>) => {
    setTools((prev) =>
      prev.map((tool) => (tool.id === id ? { ...tool, ...updates } : tool))
    );
  }, []);

  const removeTool = useCallback((id: string) => {
    setTools((prev) => prev.filter((tool) => tool.id !== id));
  }, []);

  const clearAllTools = useCallback(() => {
    setTools([]);
    setSelectedTool(null);
  }, []);

  const toggleToolVisibility = useCallback((id: string) => {
    updateTool(id, { visible: !tools.find((t) => t.id === id)?.visible });
  }, [tools, updateTool]);

  return {
    tools,
    selectedTool,
    setSelectedTool,
    isDrawing,
    setIsDrawing,
    addTool,
    updateTool,
    removeTool,
    clearAllTools,
    toggleToolVisibility,
  };
};
