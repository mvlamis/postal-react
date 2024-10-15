import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import {
  RouterProvider,
  createHashRouter
} from 'react-router-dom'

import Me from './routes/Me';
import SignIn from './routes/SignIn';
import SignUp from './routes/SignUp';
import Explore from './routes/Explore';
import Friends from './routes/Friends';
import Search from './routes/Search';
import Settings from './routes/Settings';


const router = createHashRouter([
  {
    path: "/me",
    element: <Me />,
  },
  { path: "/",
    element: <SignIn />,
  },
  {
    path: "/signin",
    element: <SignIn />,
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
    path: "/signup",
    element: <SignUp />,
  },
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
