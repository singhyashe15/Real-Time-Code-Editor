import { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";

const SocketContext = createContext();

export function useSocket() {
  return useContext(SocketContext);
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const url = import.meta.env.VITE_SERVER_URL;
 

  useEffect(() => {
    const newSocket = io(url, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 2000,
      timeout: 20000,
    },[]);

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [url]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
