import { BaseStorage, createStorage, StorageType } from '@src/shared/storages/base';
import { createWebStorage, WebStorageType } from '@src/shared/storages/webStorage';

export type Theme = 'light' | 'dark';

type ThemeStorage = BaseStorage<Theme> & {
  toggle: () => Promise<void>;
};

const storage = __WEBPAGE__ ? createWebStorage<Theme>('theme-storage-key', 'light', {
    storageType: WebStorageType.Local,
    liveUpdate: true, 
}) : createStorage<Theme>('theme-storage-key', 'light', {
  storageType: StorageType.Local,
  liveUpdate: true,
});

const themeStorage: ThemeStorage = {
  ...storage,
  // TODO: extends your own methods
  toggle: async () => {
    await storage.set(currentTheme => {
      return currentTheme === 'light' ? 'dark' : 'light';
    });
  },
};

export default themeStorage;
