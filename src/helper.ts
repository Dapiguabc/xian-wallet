import historyStorage from '@root/src/shared/storages/historyStorage';
import Xian from 'xian-js';

export type ICallArgs = {
  network: NetworkMeta;
  account: string;
  privateKey: string;
  contract: string;
  method: string;
  kwargs: any;
  stampLimit?: number;
};

const call = async (args: ICallArgs) => {
  const tx = new Xian.TransactionBuilder(
    {
      chain_id: args.network.chainId,
      type: 'testnet', // useless
      masternode_hosts: args.network.masternodeHosts,
    },
    {
      chain_id: args.network.chainId,
      senderVk: args.account,
      contractName: args.contract,
      methodName: args.method,
      kwargs: args.kwargs,
      stampLimit: args.stampLimit ?? 50000,
    },
  );
  const txRes = await tx.send(args.privateKey);
  historyStorage.add({
    hash: txRes.hash,
    contract: args.contract,
    method: args.method,
    kwargs: args.kwargs,
    status: txRes.success ? 'success' : 'error',
    timestamp: new Date().getTime(),
  });
  return txRes;
};

function getLocalTime(timestamp: number) {
  return new Date(timestamp).toLocaleString().replace(/:\d{1,2}$/, ' ');
}

async function getBase64Image(url: string) {
  const response = await fetch(url);
  const blob = await response.blob();
  const reader = new FileReader();
  await new Promise((resolve, reject) => {
    reader.onload = resolve;
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
  return reader.result.toString().replace(/^data:.+;base64,/, '');
}

export default { call, getLocalTime, getBase64Image };
