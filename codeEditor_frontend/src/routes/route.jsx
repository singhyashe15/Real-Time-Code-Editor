import { createBrowserRouter } from 'react-router-dom';
import Home from "../pages/home.jsx";
import Login from "../pages/login.jsx";
import SignUp from "../pages/signup.jsx";
import CreateRoom from "../components/room.jsx";
import Error from "../auth/error.jsx";
import WaitingRoom from "../components/waiting-room.jsx";
import ProtectedRoute from "../auth/protectedRoute.jsx";

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
    errorElement: <Error />
  },
  {
    path: 'login',
    element: <Login />,
    errorElement: <Error />
  },
  {
    path: 'register',
    element: <SignUp />,
    errorElement: <Error />
  },
  {
    path: 'r/:roomId',
    element: (
      <ProtectedRoute>
        <CreateRoom />
      </ProtectedRoute>
    ),
    errorElement: <Error />
  },
  {
    path: 'waiting-room/r/:roomId',
    element: (
      <ProtectedRoute>
        <WaitingRoom />
      </ProtectedRoute>
    ),
    errorElement: <Error />
  }
])

export default router;