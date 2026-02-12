import { create } from 'zustand';
import { api } from '../utils/api';
import type { Board, List, Card } from '../types';

interface BoardStore {
  currentBoard: Board | null;
  boards: Board[];
  isLoading: boolean;
  error: string | null;
  fetchBoards: () => Promise<void>;
  fetchBoard: (boardId: string) => Promise<void>;
  createBoard: (title: string) => Promise<void>;
  createList: (boardId: string, title: string) => Promise<void>;
  createCard: (listId: string, title: string) => Promise<void>;
  moveCard: (cardId: string, targetId: string) => Promise<void>;
  moveList: (listId: string, targetId: string) => Promise<void>;
  updateCard: (cardId: string, updates: Partial<Card>) => Promise<void>;
}

export const useBoardStore = create<BoardStore>((set, get) => ({
  currentBoard: null,
  boards: [],
  isLoading: false,
  error: null,

  fetchBoards: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/boards');
      set({ boards: response.data, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch boards', isLoading: false });
    }
  },

  fetchBoard: async (boardId: string) => {
    set({ isLoading: true });
    try {
      const response = await api.get(`/boards/${boardId}`);
      set({ currentBoard: response.data, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch board', isLoading: false });
    }
  },

  createBoard: async (title: string) => {
    try {
      const response = await api.post('/boards', { title });
      set((state) => ({
        boards: [...state.boards, response.data]
      }));
    } catch (error) {
      set({ error: 'Failed to create board' });
    }
  },

  createList: async (boardId: string, title: string) => {
    try {
      const response = await api.post(`/boards/${boardId}/lists`, { title });
      set((state) => ({
        currentBoard: state.currentBoard ? {
          ...state.currentBoard,
          lists: [...state.currentBoard.lists, response.data]
        } : null
      }));
    } catch (error) {
      set({ error: 'Failed to create list' });
    }
  },

  createCard: async (listId: string, title: string) => {
    try {
      const response = await api.post(`/lists/${listId}/cards`, { title });
      set((state) => {
        if (!state.currentBoard) return state;
        
        const updatedLists = state.currentBoard.lists.map(list => {
          if (list.id === listId) {
            return {
              ...list,
              cards: [...list.cards, response.data]
            };
          }
          return list;
        });

        return {
          currentBoard: {
            ...state.currentBoard,
            lists: updatedLists
          }
        };
      });
    } catch (error) {
      set({ error: 'Failed to create card' });
    }
  },

  moveCard: async (cardId: string, targetId: string) => {
    try {
      await api.put(`/cards/${cardId}/move`, { targetId });
      // Optimistic update will be handled by socket
    } catch (error) {
      set({ error: 'Failed to move card' });
    }
  },

  moveList: async (listId: string, targetId: string) => {
    try {
      await api.put(`/lists/${listId}/move`, { targetId });
      // Optimistic update will be handled by socket
    } catch (error) {
      set({ error: 'Failed to move list' });
    }
  },

  updateCard: async (cardId: string, updates: Partial<Card>) => {
    try {
      await api.put(`/cards/${cardId}`, updates);
      // Optimistic update
      set((state) => {
        if (!state.currentBoard) return state;
        
        const updatedLists = state.currentBoard.lists.map(list => ({
          ...list,
          cards: list.cards.map(card => 
            card.id === cardId ? { ...card, ...updates } : card
          )
        }));

        return {
          currentBoard: {
            ...state.currentBoard,
            lists: updatedLists
          }
        };
      });
    } catch (error) {
      set({ error: 'Failed to update card' });
    }
  }
}));
