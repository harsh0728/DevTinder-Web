import {io} from "socket.io-client";
import { API_BASE } from "../api/apiFetch";

export const socketConnection=io("https://devtinder-1-pqv8.onrender.com",
    {
        withCredentials:true,
    }
);