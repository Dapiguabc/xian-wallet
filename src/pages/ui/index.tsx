import React from 'react';
import { createRoot } from 'react-dom/client';
import '@pages/ui/index.css';
import App from '@root/src/pages/ui/App';
import { ChakraProvider, StyleFunctionProps, extendTheme } from '@chakra-ui/react';
import { ReducerContextProvider } from '@pages/ui/context/loginContext';
import "@fontsource-variable/inter";
import { mode } from '@chakra-ui/theme-tools'

const theme = extendTheme({
    styles: {
      global: (props: StyleFunctionProps) => ({
        body: {
          fontSize: '100%',
          fontFamily: `'Inter', sans-serif`,
          bg: mode('#f4f4f4', '#121212')(props),
        },
        nav: {
          bg: mode('white', '#1e1e1e')(props),
          borderColor: mode('#ced4da', '#343a40')(props),
        },
        '.chakra-card': {
            '--card-bg': mode('white!important', '#1e1e1e!important')(props),
            '--card-border-color': mode('#ced4da!important', '#343a40!important')(props),
        }
      }),
    },
  })

function init() {
  const appContainer = document.querySelector('#app-container');
  if (!appContainer) {
    throw new Error('Can not find #app-container');
  }
  const root = createRoot(appContainer);
  root.render(
    <ChakraProvider theme={theme}>
        <ReducerContextProvider>
            <App />
        </ReducerContextProvider>
    </ChakraProvider>,
  );
}

init();

