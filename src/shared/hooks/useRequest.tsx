import { useEffect, useState } from 'react';

export type RequestFunc<D, P extends any[]> = (...args: P) => Promise<D>;

export interface Options<D, P extends any[]> {
  manual?: boolean;
  defaultParams?: P;
  onSuccess?: (data: D, params: P) => void;
  onError?: (e: Error, params: P) => void;
}

// hooks for data request
export function useRequest<D, P extends any[]>(requestFunc: RequestFunc<D, P>, options: Options<D, P> = {}) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<D>();
  const [err, setErr] = useState<Error>();

  const { defaultParams } = options;
  const run = async (...params: P) => {
    setErr(undefined);
    setData(undefined);
    setLoading(true);
    let res: D;
    try {
      res = await requestFunc(...params);

      setData(res);
      options.onSuccess?.(res, params);
    } catch (error) {
      setErr(error);
      options.onError?.(error, params);
    }
    setLoading(false);
    return res;
  };

  const { manual = false } = options;

  // only run when it is loaded
  useEffect(() => {
    if (!manual) {
      run(...defaultParams);
    }
  }, [manual]);

  return {
    loading,
    data,
    err,
    run,
  };
}
