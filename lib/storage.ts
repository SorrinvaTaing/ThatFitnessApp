// lib/storage.ts
import { Platform } from 'react-native'

let Storage: {
  getItem: (key: string) => Promise<string | null>
  setItem: (key: string, value: string) => Promise<void>
  removeItem: (key: string) => Promise<void>
}

if (Platform.OS === 'web') {
  const safeLocalStorage = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
    ? window.localStorage
    : null

  Storage = {
    getItem: async (key) => safeLocalStorage?.getItem(key) ?? null,
    setItem: async (key, value) => { safeLocalStorage?.setItem(key, value) },
    removeItem: async (key) => { safeLocalStorage?.removeItem(key) },
  }
} else {
  const AsyncStorage = require('@react-native-async-storage/async-storage').default
  Storage = {
    getItem: AsyncStorage.getItem,
    setItem: AsyncStorage.setItem,
    removeItem: AsyncStorage.removeItem,
  }
}

export default Storage
