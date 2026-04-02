import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { initializeApp } from "firebase/app";

import HomePage from "./lib/pages/home/home";
import { Problem } from "./lib/pages/problem/problem";
import ProfilePage from "./lib/pages/profile/profile";
import { SignIn } from "./lib/pages/auth/signin";
import { Provider } from 'react-redux'
import { store } from "./store";
import Error from "./lib/pages/error/error";
import Landing from "./lib/pages/landing/landing";

function App() {
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };
  initializeApp(firebaseConfig);

  const route = createBrowserRouter(
    [
      { path: "/", element: <Landing /> },
      { path: "/home", element: <HomePage /> },
      { path: "/problem/:id", element: <Problem />},
      { path: "/signin", element: <SignIn /> },
      { path: "/profile", element: <ProfilePage /> },
      {path: "*", element: <Error />}
    ]
  );

  return (
    <Provider store={store}>
      <RouterProvider router={route} />
    </Provider>
  );
}

export default App;
