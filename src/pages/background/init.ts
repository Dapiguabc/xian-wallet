import { DefaultNetwork } from '@root/src/constant';
import networkStorage from '@root/src/shared/storages/networkStorage';

export default async function initProflie() {
  // load default network info when extension installed.
  await networkStorage.set({
    currentChainId: DefaultNetwork[0].chainId,
    networkList: DefaultNetwork,
  });
}
