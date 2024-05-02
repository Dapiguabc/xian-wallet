import requestHandlers from '@root/src/shared/handler/requestHandler';
import reloadOnUpdate from 'virtual:reload-on-update-in-background-script';

reloadOnUpdate('pages/background');

const wrapAsyncFunction = (listener) => (msg: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
    Promise.resolve(listener(msg, sender)).then(sendResponse);
    return true; 
};

export default function handler() {
  let password: string = '';
  // for contentjs
  chrome.runtime.onMessage.addListener(wrapAsyncFunction( async (msg: any, sender: chrome.runtime.MessageSender) => {
    console.log('background receive: ', msg, 'from:', sender);

    const { method } = msg.data;

    if (method === 'sign') {
        // to do: verify the password
        password = msg.data.data;
        return true;
    } else if (method === 'signOut') {
        password = undefined;
        return true;
    } else if (method === 'isLogin') {
        return password;
    }

    if (password === '') {
        return requestHandlers.lockedHandle(msg.id);
    }

    if (method === 'connect') {
      return await requestHandlers.connectRequestHandle(
        {
          url: new URL(sender.origin).host,
          icon: sender.tab.favIconUrl,
        },
        msg.id,
      );
    } else if (method === 'call') {
      return await requestHandlers.callRequestHandle(msg.data.params, password, msg.id);
    } else {
      return  requestHandlers.unsupportedHandle(msg.id);
    }
  }));
}
