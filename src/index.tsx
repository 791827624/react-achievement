import "react-app-polyfill/ie11";
import "react-app-polyfill/stable";
import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import KeepAliveDemo from "./pages/KeepAliveDemo/index";

// import

const router = createBrowserRouter([
  {
    path: "/keep-alive",
    element: <KeepAliveDemo />,
  },
]);

const App: React.FC = () => {
  return (
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
};

const root = createRoot(document.getElementById("root"));

root.render(<App />);
