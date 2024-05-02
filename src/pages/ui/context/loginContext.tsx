// login.context.ts
import accountStorage from '@root/src/shared/storages/accountStorage';
import { PropsWithChildren, createContext, useContext, Dispatch, useReducer, useCallback, useEffect } from 'react';

interface ILogin {
  password: string | undefined;
  isLogin: boolean;
  isFirst: boolean;
}

interface IContext {
  state: ILogin;
  dispatch: Dispatch<{
    type: string;
    payload?: Partial<ILogin>;
  }>;
}

const initValue: ILogin = {
  password: undefined,
  isLogin: false,
  isFirst: false,
};

const Context = createContext<IContext>({
  state: initValue,
  dispatch: () => {},
});

export const ReducerContextProvider: React.FC<PropsWithChildren> = props => {
  const reducer = useCallback(
    (
      preState: ILogin,
      action: {
        type: string;
        payload?: Partial<ILogin>;
      },
    ) => {
      const { type, payload } = action;
      switch (type) {
        default:
          return preState;
        case 'update':
          if (!__WEBPAGE__) {
            if (payload.password) {
              chrome.runtime.sendMessage({data:{ method: 'sign', data: payload.password }});
            }
          }
          return {
            ...preState,
            ...payload,
          };
        case 'signOut':
          if (!__WEBPAGE__) {
            chrome.runtime.sendMessage({data:{ method: 'signout' }});
          }
          return {
            ...preState,
            password: undefined,
            isLogin: false,
          };
      }
    },
    [],
  );

  const [state, dispatch] = useReducer(reducer, initValue);

  useEffect(() => {
    (async () => {
      const res = await accountStorage.isFirst();
      dispatch({
        type: 'update',
        payload: { isFirst: res },
      });
    })();
  }, []);

  return <Context.Provider value={{ state, dispatch }}>{props.children}</Context.Provider>;
};

export const useLoginContext = () => {
  return useContext(Context);
};
