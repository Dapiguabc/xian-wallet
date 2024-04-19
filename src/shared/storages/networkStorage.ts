import { DefaultNetwork } from '@root/src/constant';
import { BaseStorage, createStorage, StorageType } from '@src/shared/storages/base';
import { createWebStorage, WebStorageType } from '@src/shared/storages/webStorage';
import Xian, { Network } from 'xian-js';

type NetworkData = {
  currentChainId: string;
  networkList: NetworkMeta[];
};

type NetworkStorage = BaseStorage<NetworkData> & {
  changeNetwork: (chainId: string) => Promise<void>;
  getCurrentChainId: () => Promise<string>;
  getCurrentNetwork: () => Promise<Network>;
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
};

export default networkStorage;
