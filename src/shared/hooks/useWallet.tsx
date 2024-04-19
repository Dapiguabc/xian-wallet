import themeStorage from '@src/shared/storages/themeStorage';
import networkStorage from '@src/shared/storages/networkStorage';
import accountStorage from '@src/shared/storages/accountStorage';
import Xian from 'xian-js';
import useStorage from '@src/shared/hooks/useStorage';

export default function useWallet() {
  const network = useStorage(networkStorage);
  const theme = useStorage(themeStorage);
  const account = useStorage(accountStorage);

  const currentNetworkMeta =
    network.networkList.find(item => item.chainId === network.currentChainId) ?? network.networkList[0];

  const currentNetwork = new Xian.Network({
    chain_id: currentNetworkMeta.chainId,
    type: 'testnet',
    masternode_hosts: currentNetworkMeta.masternodeHosts,
  });

  const currentTheme = theme;

  const currentAccount = account.currentAccount;

  return {
    currentNetwork,
    currentTheme,
    currentAccount,
    networkList: network.networkList,
  };
}
