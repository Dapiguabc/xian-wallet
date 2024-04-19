import { BaseStorage, ValueOrUpdate, updateCache } from '@src/shared/storages/base';

/**
 * Web Storage area type .
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API
 */
export enum WebStorageType {
  /**
   * Persists even when the browser is closed and reopened.
   * @default
   */
  Local = 'local',

  /**
   * maintains a separate storage area for each given origin that's available for the duration of the page session
   */
  Session = 'session',
}

export type WebStorageConfig<D = string> = {
  /**
   * Assign the {@link StorageType} to use.
   * @default Local
   */
  storageType?: WebStorageType;
  liveUpdate?: boolean;
  /**
   * An optional props for converting values from storage and into it.
   * @default undefined
   */
  serialization?: {
    /**
     * convert non-native values to string to be saved in storage
     */
    serialize: (value: D) => string;
    /**
     * convert string value from storage to non-native values
     */
    deserialize: (text: string) => D;
  };
};

/**
 * Web Storage
 * Creates a storage area for persisting and exchanging data.
 */
export function createWebStorage<D = string>(key: string, fallback: D, config?: WebStorageConfig<D>): BaseStorage<D> {
  let cache: D | null = null;
  let listeners: Array<() => void> = [];
  const storageType = config?.storageType ?? WebStorageType.Local;
  const liveUpdate = config?.liveUpdate ?? false;
  const serialize = config?.serialization?.serialize ?? (v => v as string);
  const deserialize = config?.serialization?.deserialize ?? (v => v as D);
  const storage = storageType === 'local' ? localStorage : sessionStorage;

  const _getDataFromStorage = async (): Promise<D> => {
    return new Promise(reslove => {
      const value = storage.getItem(key);
      const res = deserialize(value) ?? fallback;
      reslove(res);
    });
  };

  const _emitChange = () => {
    listeners.forEach(listener => listener());
  };

  const set = async (valueOrUpdate: ValueOrUpdate<D>) => {
    cache = await updateCache(valueOrUpdate, cache);
    storage.setItem(key, serialize(cache));
    _emitChange();
  };

  const subscribe = (listener: () => void) => {
    listeners = [...listeners, listener];
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  };

  const getSnapshot = () => {
    return cache;
  };

  _getDataFromStorage().then(data => {
    cache = data;
    _emitChange();
  });

  async function _updateFromStorageOnChanged(e: StorageEvent) {
    // Check if the key we are listening for is in the StorageEvent object
    if (e[key] === undefined) return;

    const valueOrUpdate: ValueOrUpdate<D> = deserialize(e.newValue);

    if (cache === valueOrUpdate) return;

    cache = await updateCache(valueOrUpdate, cache);

    _emitChange();
  }

  // Register listener for live updates for our storage area
  if (liveUpdate) {
    window.addEventListener('storage', _updateFromStorageOnChanged);
  }

  return {
    get: _getDataFromStorage,
    set,
    getSnapshot,
    subscribe,
  };
}
