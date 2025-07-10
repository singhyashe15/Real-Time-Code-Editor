import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ChakraProvider } from '@chakra-ui/react';
import { SocketProvider } from './context/socket.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <ChakraProvider>
        <SocketProvider>
          <App />
        </SocketProvider>
      </ChakraProvider>
  </StrictMode>
)
