import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AudioState {
  sfxEnabled: boolean;
  bgmEnabled: boolean;
  toggleSfx: () => void;
  toggleBgm: () => void;
}

export const useAudioStore = create<AudioState>()(
  persist(
    (set, get) => ({
      sfxEnabled: true,
      bgmEnabled: true,
      toggleSfx: () => set({ sfxEnabled: !get().sfxEnabled }),
      toggleBgm: () => set({ bgmEnabled: !get().bgmEnabled }),
    }),
    {
      name: 'cat-merge-audio',
    }
  )
);
