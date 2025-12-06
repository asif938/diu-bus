import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css'
import App from './App.jsx'
import Home from './pages/Home.jsx';
import SendLocation from './pages/SendLocation.jsx';
import MainLayout from './layouts/MainLayout.jsx';

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout></MainLayout>,
    children:[
      {
        path: "/",
        element: <Home></Home>,
      },
      {
        path: "send-location/:busId",
        element: <SendLocation></SendLocation>,
      }
    ]
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
