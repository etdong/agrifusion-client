import { io } from 'socket.io-client';

// create a singleton socket connection to the server
const socket = io(import.meta.env.VITE_SERVER_URL);

export default socket;