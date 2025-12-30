import {io} from "socket.io-client";
import { API_BASE } from "../api/apiFetch";

export const socketConnection=io("http://localhost:3000",
    {
        withCredentials:true,
    }
);