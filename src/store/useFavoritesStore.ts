import { create } from 'zustand'

export interface FavoritesState {
  favIds: string[]
  isLoading: boolean
  error: string | null

  setFavIds(ids: string[]): void
  add(id: string): void
  remove(id: string): void
  setLoading(loading: boolean): void
  setError(err: string | null): void
}

export const useFavoritesStore = create<FavoritesState>(set => ({
  favIds: [],
  isLoading: false,
  error: null,

  setFavIds: favIds => set({ favIds }),
  add: id => set(state => ({ favIds: [...state.favIds, id] })),
  remove: id => set(state => ({ favIds: state.favIds.filter(x => x !== id) })),
  setLoading: isLoading => set({ isLoading }),
  setError: error => set({ error }),
}))