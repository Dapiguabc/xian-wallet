import refreshOnUpdate from 'virtual:reload-on-update-in-view';
import { nanoid } from 'nanoid';

refreshOnUpdate('pages/content/main/provider');

class ProviderError extends Error {
  code: number;
  data?: unknown;

  constructor(code: number, message: string, data?: unknown) {
    super(message);
    this.name = 'ProviderError';
    this.code = code;
    this.data = data;
  }
}

async function request(args: RequestArguments) {
  const msgId = nanoid();
  window.postMessage(
    {
      id: msgId,
      target: 'xian-contentjs',
      data: args,
    },
    window.location.origin,
  );

  return new Promise((reslove, reject) => {
    const getResponse = (e: MessageEvent): void => {
      if (
        window.location.href.indexOf(e.origin) === 0 &&
        e.source === window &&
        e.data.target === 'xian-inpage' &&
        e.data.id === msgId
      ) {
        console.log('page receive from contentjs: ', e.data);

        e.data.target = undefined;
        e.data.id = undefined;

        if (e.data.type === 'rejected') {
          reject(new ProviderError(101, 'user rejected the request', e.data.data));
        } else if (e.data.type === 'unauthorized') {
          reject(new ProviderError(102, 'account has not been authorized', e.data.data));
        } else if (e.data.type === 'unsupported') {
          reject(new ProviderError(103, 'method not supported', e.data.data));
        } else if (e.data.type === 'disconnected') {
          reject(new ProviderError(104, 'account disconnect', e.data.data));
        } else if (e.data.type === 'locked') {
          reject(new ProviderError(106, 'wallet is locked', e.data.data));
        } else {
          reslove(e.data.data);
        }
        // remove the listener
        window.removeEventListener('message', getResponse);
      }
    };

    window.addEventListener('message', getResponse, false);
  });
}

// iniject it into main world
function injectProvider() {
  // inject provider
  if (typeof window.xianNet === 'undefined') {
    window.xianNet = {
      request,
    };
  }
  console.log('Xian provider injected');
}

void injectProvider();
