import { BaseStorage, createStorage, StorageType } from '@src/shared/storages/base';
import { createWebStorage, WebStorageType } from '@src/shared/storages/webStorage';
import Xian from 'xian-js';

type AccountStorage = BaseStorage<AccountData> & {
  isFirst: () => Promise<boolean>;
  clear: () => void;
  getCurrentAccount: () => Promise<string>;
  getCurrentAccountVK: (password: string) => Promise<string | undefined>; 
};

type AccountData = {
    currentAccount: string | undefined;
    accountList: AccountMeta[];
};

const defaultAccount = {
    currentAccount: undefined,
    accountList: []
}

const serialization = {
    serialize: data => JSON.stringify(data),
    deserialize: dataStr => dataStr === '' || !dataStr ? undefined : JSON.parse(dataStr)
}

const storage = __WEBPAGE__ ? createWebStorage<AccountData>('Account', defaultAccount, {
    storageType: WebStorageType.Local,
    liveUpdate: true, 
    serialization,
}) : createStorage<AccountData>('Account', defaultAccount, {
  storageType: StorageType.Local,
  liveUpdate: true,
  serialization,
});

const accountStorage: AccountStorage = {
  ...storage,
  // TODO: extends your own methods
  isFirst: async () => {
    const accountData = await storage.get();
    return accountData.accountList.length === 0;
  },
  getCurrentAccountVK: async (password: string) => {
    const accountData = await storage.get();
    const account = accountData.accountList.find(val => val.publicKey === accountData.currentAccount);
    if (account) {
        return Xian.Utils.decryptStrHash(password, account.encryptedPrivateKey);
    } else {
        return undefined;
    }
  },
  getCurrentAccount: async () => {
    const accountData = await storage.get();
    return accountData.currentAccount;
  },
  clear: () => storage.set({
    currentAccount: undefined,
    accountList: []
  })
};

export default accountStorage;
