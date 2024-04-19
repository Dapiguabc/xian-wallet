import dappStorage from '@src/shared/storages/dappStorage';
import accountStorage from '../storages/accountStorage';
import networkStorage from '../storages/networkStorage';
import helper, { ICallArgs } from '@root/src/helper';


type Messenger = {
    postMessage: (message: any) => void;
}

const connectRequestHandle = async (dapp: DappMeta, messenger: Messenger, msgId?: string) => {
    //const isAuthorized = await dappStorage.isAuthorized(dapp.url);
    const chainId = await networkStorage.getCurrentChainId();
    const account = await accountStorage.getCurrentAccount();
    // store it
    await dappStorage.add(dapp);
    const data = {
        chainId: chainId,
        account: account,
    }
    // event
    messenger.postMessage({ type: 'connect', data: data, id: msgId });

    // // return connection info if already authorized
    // if (isAuthorized) {
    //     const chainId = await networkStorage.getCurrentChainId();
    //     const account = await accountStorage.getCurrentAccount();
    //     // store it
    //     await dappStorage.add(dapp);
    //     return {
    //         chainId: chainId,
    //         account: account,
    //     }
    // } else {
    //     // popup a popup
    //     chrome.windows.create({
    //         url: 'src/pages/popup/index.html',
    //         width: 375,
    //         height: 700,
    //         type: "popup",
    //     });
    // }
}


const callRequestHandle = async (args: CallInfo, password: string,  messenger: Messenger, msgId?: string) => {
    const network = await networkStorage.get();
    const chainId = network.currentChainId;
    const account = await accountStorage.getCurrentAccount();
    const privateKey = await accountStorage.getCurrentAccountVK(password);
    const callArgs: ICallArgs = {
        network: {
            chainId: chainId,
            masternodeHosts: network.networkList.find(t => t.chainId === chainId).masternodeHosts,
        },
        account: account,
        privateKey: privateKey,
        contract: args.contract,
        method: args.method,
        kwargs: args.kwargs,
    }
    const res = await helper.call(callArgs);
    // event
    messenger.postMessage({ type: 'call', data: res, id: msgId });
}

const unsupportedHandle = (messenger: Messenger, msgId?: string) => {
    // event
    messenger.postMessage({ type: 'unsupported', id: msgId });
}

const lockedHandle = (messenger: Messenger, msgId?: string) => {
    // event
    messenger.postMessage({ type: 'locked', id: msgId });
}


export default { connectRequestHandle, callRequestHandle, unsupportedHandle, lockedHandle};