import { create } from 'zustand'

interface AppStore {
  // UI state
  isAdminPanelOpen: boolean
  setAdminPanelOpen: (open: boolean) => void

  // Optimistic updates
  pendingPalpiteJogoId: string | null
  setPendingPalpiteJogoId: (jogoId: string | null) => void
}

export const useAppStore = create<AppStore>((set) => ({
  isAdminPanelOpen: false,
  setAdminPanelOpen: (open) => set({ isAdminPanelOpen: open }),

  pendingPalpiteJogoId: null,
  setPendingPalpiteJogoId: (jogoId) => set({ pendingPalpiteJogoId: jogoId }),
}))
