import refreshOnUpdate from 'virtual:reload-on-update-in-view';

refreshOnUpdate('pages/content/isolated/messageForward');

let port = chrome.runtime.connect({ name: 'xian-background-content-connect' });

port.onDisconnect.addListener(() => {
    port = null;
});

function messageForward() {
  window.addEventListener(
    'message',
    e => {
      if (window.location.href.indexOf(e.origin) === 0 && e.source === window && e.data.target === 'xian-contentjs') {
        console.log('forward:', e.data);
        e.data.target = undefined;
        if (!port) {
            port = chrome.runtime.connect({ name: 'xian-background-content-connect' });
        }
        port.postMessage(e.data);
      }
      return;
    },
    false,
  );

  port.onMessage.addListener(function (msg) {
    console.log('content.js receive from background: ', msg);
    window.postMessage(
      {
        ...msg,
        target: 'xian-inpage',
      },
      window.location.origin,
    );
  });
}

void messageForward();
