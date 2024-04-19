declare type NetworkMeta = {
  chainId: string;
  masternodeHosts: string[];
};

declare interface RequestArguments {
  method: string;
  params?: unknown[] | object;
}

declare interface XianNet {
  request(args: RequestArguments): Promise<unknown>;
}

declare interface Window {
  xianNet: XianNet;
}

declare type XianWalletMeta = {
  sk: string;
  vk: string;
  derivationIndex: number;
  seed: any;
  mnemonic: any;
};

declare type AccountMeta = {
  publicKey: string;
  encryptedPrivateKey: string;
};

declare type HistoryMeta = {
  hash: string;
  contract: string;
  method: string;
  kwargs: any;
  status: 'success' | 'error';
  timestamp: number;
};

declare type TokenMeta = {
  name: string;
  amount: string;
  symbol: string;
  contract: string;
};

/*Requests and events*/
declare type DappMeta = {
  name?: string;
  url: string;
  icon: string;
};

declare type ConnectInfo = {
  readonly chainId: string;
  readonly account: string;
};

declare type CallInfo = {
  contract: string;
  method: string;
  kwargs: any;
};
