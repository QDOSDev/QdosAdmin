import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client'
import { NextUIProvider } from '@nextui-org/react'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LinkHandler from './Model wrapper/Model wrapper';
// Perfect Scrollbar
import 'react-perfect-scrollbar/dist/css/styles.css';

// Tailwind css
import './tailwind.css';
import './global.css';

// i18n (needs to be bundled)
import './i18n';

// Router
import { RouterProvider } from 'react-router-dom';
import router from './router/index';

// Redux
import { Provider } from 'react-redux';
import store from './store/index';


ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(

        <NextUIProvider>
            <Suspense>
                <Provider store={store}>
                    <RouterProvider router={router} />
                </Provider>
            </Suspense>
            <ToastContainer position="top-right" autoClose={3000} />
        </NextUIProvider>

  
);

