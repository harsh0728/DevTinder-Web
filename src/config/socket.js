import {io} from "socket.io-client";
import { API_BASE } from "../api/apiFetch";

export const socketConnection=io(import.meta.VITE_CLIENT_ENV==="production"?"https://devtinder-1-pqv8.onrender.com":'http://localhost:3000',
    {
        withCredentials:true,
    }
);