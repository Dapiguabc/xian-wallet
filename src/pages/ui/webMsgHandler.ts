import requestHandlers from '@root/src/shared/handler/requestHandler';

export default async function handler(password: string, e: MessageEvent) {
  const getMessager = () => {
    return {
      postMessage: (msg: any) => {
        e.source.postMessage(msg, {
          targetOrigin: e.origin,
        });
      },
    };
  };
  const messenger = getMessager();
  if (e.data.target === 'xian-wallet') {
    const locked = !password || password === '';
    const { method } = e.data.data;
    if (method && locked) {
      requestHandlers.lockedHandle(messenger);
    }
    if (method === 'connect') {
      await requestHandlers.connectRequestHandle(
        {
          url: new URL(e.origin).host,
          icon: '',
        },
        messenger,
      );
    } else if (method === 'call') {
      await requestHandlers.callRequestHandle(e.data.data?.params, password, messenger);
    } else {
      requestHandlers.unsupportedHandle(messenger);
    }
  }
  return;
}
