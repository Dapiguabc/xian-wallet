import { DefaultNetwork } from '@root/src/constant';
import { BaseStorage, createStorage, StorageType } from '@src/shared/storages/base';
import { createWebStorage, WebStorageType } from '@src/shared/storages/webStorage';
import lodash from 'lodash';
import Xian, { Network } from 'xian-js';

type NetworkData = {
  currentChainId: string;
  networkList: NetworkMeta[];
};

type NetworkStorage = BaseStorage<NetworkData> & {
  addNetwork: (chain: NetworkMeta) => Promise<boolean>;
  updateNetwork: (chainId: string, url: string) => Promise<boolean>;
  changeNetwork: (chainId: string) => Promise<void>;
  getCustomNetwork: () => Promise<NetworkMeta[]>;
  getCurrentChainId: () => Promise<string>;
  getCurrentNetwork: () => Promise<Network>;
  deleteNetwork: (chainId: string) => Promise<boolean>;
};

const defaultProfile: NetworkData = {
  currentChainId: DefaultNetwork[0].chainId,
  networkList: DefaultNetwork,
};

const storage = __WEBPAGE__
  ? createWebStorage<NetworkData>('Network', defaultProfile, {
      storageType: WebStorageType.Local,
      liveUpdate: true,
      serialization: {
        serialize: data => JSON.stringify(data),
        deserialize: dataStr => (dataStr === '' || !dataStr ? undefined : JSON.parse(dataStr)),
      },
    })
  : createStorage<NetworkData>('Network', defaultProfile, {
      storageType: StorageType.Local,
      liveUpdate: true,
      serialization: {
        serialize: data => JSON.stringify(data),
        deserialize: dataStr => (dataStr === '' || !dataStr ? undefined : JSON.parse(dataStr)),
      },
    });

const networkStorage: NetworkStorage = {
  ...storage,
  addNetwork: async (chain: NetworkMeta) => {
    const res = await storage.get();
    // check 
    const data = lodash.cloneDeep(res);
    const index = data.networkList.findIndex(r => r.chainId === chain.chainId);
    if (index === -1) {
        chain.isCustom = true;
        data.networkList.push(chain);
        await storage.set(data);
        return true;
    } else {
        return false;
    }
  },
  updateNetwork: async (chainId: string, url: string) => {
    const res = await storage.get();
    // check 
    const data = lodash.cloneDeep(res);
    const index = data.networkList.findIndex(r => r.chainId === chainId);
    if (index === -1) {
        return false;
    } else {
        data.networkList[index].masternodeHosts = [url];
        await storage.set(data);
        return true;
    }
  },
  getCustomNetwork: async () => {
    const res = await storage.get();
    const data = lodash.cloneDeep(res);
    return data.networkList.filter(r => !!r.isCustom);
  },
  changeNetwork: async (chainId: string) => {
    const res = await storage.get();
    if (res.currentChainId !== chainId) {
      await storage.set({
        ...res,
        currentChainId: chainId,
      });
    }
  },
  getCurrentChainId: async () => {
    const res = await storage.get();
    return res.currentChainId;
  },
  getCurrentNetwork: async () => {
    const res = await storage.get();
    const currentNetworkMeta = res.networkList.find(item => item.chainId === res.currentChainId) ?? res.networkList[0];
    const currentNetwork = new Xian.Network({
      chain_id: currentNetworkMeta.chainId,
      type: 'testnet',
      masternode_hosts: currentNetworkMeta.masternodeHosts,
    });
    return currentNetwork;
  },
  deleteNetwork: async (chainId: string) => {
    const res = await storage.get();
    const data = lodash.cloneDeep(res);
    const item = data.networkList.find(r => r.chainId === chainId);
    if (item && item.isCustom) {
       data.networkList =  data.networkList.filter(r => r.chainId !== chainId);
       // check current chainid
       if (data.currentChainId === chainId) {
            data.currentChainId = data.networkList[0].chainId;
       }
       await storage.set(data);
       return true
    } else {
        return false;
    }
  }
};

export default networkStorage;
