"use client";
import { create } from "zustand";

interface UIState {
  theme: "dark" | "light";
  isStoryViewerOpen: boolean;
  currentStoryIndex: number;
  storyViewerIds: string[];
  isCreateModalOpen: boolean;
  isAIModalOpen: boolean;
  toggleTheme: () => void;
  openStoryViewer: (ids: string[], index: number) => void;
  closeStoryViewer: () => void;
  nextStory: () => void;
  prevStory: () => void;
  setCreateModal: (open: boolean) => void;
  setAIModal: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  theme: "dark",
  isStoryViewerOpen: false,
  currentStoryIndex: 0,
  storyViewerIds: [],
  isCreateModalOpen: false,
  isAIModalOpen: false,

  toggleTheme: () =>
    set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" })),

  openStoryViewer: (ids, index) =>
    set({ isStoryViewerOpen: true, storyViewerIds: ids, currentStoryIndex: index }),

  closeStoryViewer: () =>
    set({ isStoryViewerOpen: false, storyViewerIds: [], currentStoryIndex: 0 }),

  nextStory: () => {
    const { currentStoryIndex, storyViewerIds, closeStoryViewer } = get();
    if (currentStoryIndex < storyViewerIds.length - 1) {
      set({ currentStoryIndex: currentStoryIndex + 1 });
    } else {
      closeStoryViewer();
    }
  },

  prevStory: () => {
    const { currentStoryIndex } = get();
    if (currentStoryIndex > 0) {
      set({ currentStoryIndex: currentStoryIndex - 1 });
    }
  },

  setCreateModal: (open) => set({ isCreateModalOpen: open }),
  setAIModal: (open) => set({ isAIModalOpen: open }),
}));
