import { BaseStorage, createStorage, StorageType } from '@src/shared/storages/base';
import { createWebStorage, WebStorageType } from '@src/shared/storages/webStorage';

type DappStorage = BaseStorage<DappData> & {
  isAuthorized: (url: string) => Promise<boolean>;
  add: (dapp: DappMeta) => Promise<void>;
  remove: (domain: string) => Promise<void>;
  clear: () => void;
};

type DappData = DappMeta[];

const serialization = {
  serialize: data => JSON.stringify(data),
  deserialize: dataStr => (dataStr === '' || !dataStr ? undefined : JSON.parse(dataStr)),
};

const storage = __WEBPAGE__
  ? createWebStorage<DappData>('Dapp', [], {
      storageType: WebStorageType.Local,
      liveUpdate: true,
      serialization,
    })
  : createStorage<DappData>('Dapp', [], {
      storageType: StorageType.Local,
      liveUpdate: true,
      serialization,
    });

const dappStorage: DappStorage = {
  ...storage,
  isAuthorized: async url => {
    const data = await storage.get();
    const index = data.findIndex(d => d.url === url);
    return index === -1 ? false : true;
  },
  add: async dapp => {
    const data = await storage.get();
    const index = data.findIndex(d => d.url === dapp.url);
    if (index === -1) {
      data.push(dapp);
      await storage.set(data);
    }
  },
  remove: async domain => {
    const data = await storage.get();
    const newData = data.filter(item => item.url !== domain);
    await storage.set(newData);
  },
  clear: () => storage.set([]),
};

export default dappStorage;
