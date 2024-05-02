import refreshOnUpdate from 'virtual:reload-on-update-in-view';

refreshOnUpdate('pages/content/isolated/messageForward');

function messageForward() {
  window.addEventListener(
    'message',
    e => {
      if (window.location.href.indexOf(e.origin) === 0 && e.source === window && e.data.target === 'xian-contentjs') {
        console.log('forward:', e.data);
        e.data.target = undefined;
        chrome.runtime.sendMessage(e.data).then(msg => {
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
      return;
    },
    false,
  );
}

void messageForward();
