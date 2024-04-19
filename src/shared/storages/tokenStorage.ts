import { BaseStorage, createStorage, StorageType } from '@src/shared/storages/base';
import  { createWebStorage, WebStorageType} from '@src/shared/storages/webStorage';
import networkStorage from './networkStorage';
import accountStorage from './accountStorage';
import lodash from 'lodash';

type TokenData = {
    [key: string]: TokenMeta[];
}

type TokenStorage = BaseStorage<TokenData> & {
  refresh: (tokenContract: string) => Promise<void>;
  refreshAll: () => Promise<void>;
  addToken: (tokenContract: string) => Promise<{
    success: boolean;
    message: string;
  }>;
};


const storage = __WEBPAGE__? createWebStorage<TokenData>('Token', {}, {
    storageType: WebStorageType.Local,
    liveUpdate: true, 
    serialization: {
        serialize: data => JSON.stringify(data),
        deserialize: dataStr => dataStr === '' || !dataStr ? undefined : JSON.parse(dataStr),
    },
}) : createStorage<TokenData>('Token', {}, {
  storageType: StorageType.Local,
  liveUpdate: true,
  serialization: {
    serialize: data => JSON.stringify(data),
    deserialize: dataStr => dataStr === '' || !dataStr ? undefined : JSON.parse(dataStr)
  },
});

const tokenStorage: TokenStorage = {
  ...storage,
  refresh: async (tokenContract: string) => {
    const result = await storage.get();
    const tokenData = lodash.cloneDeep(result); 
    const net = await networkStorage.getCurrentNetwork();
    const account = await accountStorage.getCurrentAccount();
    const res = await net.getVariable(tokenContract, 'balances', account).then(v => v.value.toString());
    if (!tokenData[account]) tokenData[account] = [];
    tokenData[account]?.forEach(t => {
        if (t.contract === tokenContract ) t.amount = res;
    })
    await storage.set(tokenData);
  },
  refreshAll: async () => {
    const result = await storage.get();
    const tokenData = lodash.cloneDeep(result); 
    const net = await networkStorage.getCurrentNetwork();
    const account = await accountStorage.getCurrentAccount();
    if (!tokenData[account]) tokenData[account] = [];

    for (let i=0;i<tokenData[account].length;i++) {
        const res = await net.getVariable(tokenData[account][i].contract, 'balances', account).then(v => v.value.toString());
        tokenData[account][i].amount = res; 
    }
    await storage.set(tokenData);
  },
  addToken: async (tokenContract: string) => {
    const res = await storage.get();
    const tokenData = lodash.cloneDeep(res); 
    const account = await accountStorage.getCurrentAccount();
    const net = await networkStorage.getCurrentNetwork(); 
    if (!tokenData[account]) tokenData[account] = [];

    let token;

    if (tokenContract === 'currency') {
        token = {
            contract: 'currency',
            name: 'Xian',
            symbol: 'Xian',
        }
    } else {   
        const res1 = await net.getVariable(tokenContract, 'metadata', 'token_name');
        
        if (res1.error) {
            return {
                success: false,
                message: "Contract name is invalid.",
            }
        }
        const tokenName = res1.value.toString();
        const tokenSymbol = await net.getVariable(tokenContract, 'metadata', 'token_symbol').then(v => v.value) as string;  

        token = {
            contract: tokenContract,
            name: tokenName,
            symbol: tokenSymbol,
        }
    }

    const balances = await net.getVariable(tokenContract, 'balances', account).then(v => v.value) as string;
    token.amount = balances ?? 0;

    const index = tokenData[account].findIndex(t => t.contract === tokenContract);
    if (index === -1) {
        tokenData[account].push(token);
    } else {
        return {
            success: false,
            message: "Token already exists!",
        }
    }
    await storage.set(tokenData);
    return {
        success: true,
        message: "Token already added!",
    }
  }
};

export default tokenStorage;
