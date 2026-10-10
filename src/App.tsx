import { RouterProvider } from "react-router-dom";

import router from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
        <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;