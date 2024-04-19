import requestHandlers from "@root/src/shared/handler/requestHandler";
import reloadOnUpdate from 'virtual:reload-on-update-in-background-script';

reloadOnUpdate('pages/background');

export default function handler() {
  let password: string = '';
  // for contentjs
  chrome.runtime.onConnect.addListener(function (port) {
    console.log('port conn ready');
    if (port.name === 'xian-background-content-connect') {
      port.onMessage.addListener(async function (msg) {
        console.log('background receive: ', msg);
    
        if (password === '') {
            requestHandlers.lockedHandle(port, msg.id)
        }
        const { method } = msg.data;
        if (method === 'connect'){
            await requestHandlers.connectRequestHandle({
                url: new URL(port.sender.origin).host,
                icon: port.sender.tab.favIconUrl,
            }, port, msg.id);
        } else if (method === 'call') {
           await requestHandlers.callRequestHandle(msg.data.params, password, port, msg.id);
        } else {
            requestHandlers.unsupportedHandle(port, msg.id);
        }
      });
    } else if (port.name === 'xian-background-page-connect'){
        // for background page
        port.onMessage.addListener(async (msg) => {
            const { method } = msg;
            if (method === 'sign') {
                // to do: verify the password
                password = msg.data
            } else if (method === 'signOut') {
                password = undefined;
            }
        });
    }
  });
}