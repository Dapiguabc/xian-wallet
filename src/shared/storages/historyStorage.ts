import { BaseStorage, createStorage, StorageType } from '@src/shared/storages/base';
import { createWebStorage, WebStorageType } from '@src/shared/storages/webStorage';

type HistoryStorage = BaseStorage<HistoryData> & {
  clear: () => void;
  add: (record: HistoryMeta) => Promise<void>;
};

type HistoryData = HistoryMeta[];

const serialization = {
  serialize: data => JSON.stringify(data),
  deserialize: dataStr => (dataStr === '' || !dataStr ? undefined : JSON.parse(dataStr)),
};

const storage = __WEBPAGE__
  ? createWebStorage<HistoryData>('History', [], {
      storageType: WebStorageType.Local,
      liveUpdate: true,
      serialization,
    })
  : createStorage<HistoryData>('History', [], {
      storageType: StorageType.Local,
      liveUpdate: true,
      serialization,
    });

const historyStorage: HistoryStorage = {
  ...storage,
  clear: () => storage.set([]),
  add: async (record: HistoryMeta) => {
    const data = await storage.get();
    data.push(record);
    await storage.set(data);
  },
};

export default historyStorage;
