import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import {
  RouterProvider,
  createHashRouter
} from 'react-router-dom'

import Me from './routes/Me';
import Explore from './routes/Explore';
import Friends from './routes/Friends';
import Search from './routes/Search';
import Settings from './routes/Settings';
import Landing from './routes/Landing';
import ViewUser from './routes/ViewUser';


const router = createHashRouter([
  {
    path: "/me",
    element: <Me />,
  },
  { path: "/",
    element: <Landing />,
  },
  {
    path: "/explore",
    element: <Explore />,
  },
  {
    path: "/friends",
    element: <Friends />,
  },
  {
    path: "/search",
    element: <Search />,
  },
  {
    path: "/settings",
    element: <Settings />,
  },
  {
    path: "/view/:userId",
    element: <ViewUser />,
  }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
