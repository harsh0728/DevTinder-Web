// import { useEffect } from "react";
// import { io } from "socket.io-client";
// import { apiFetch } from "../api/apiFetch";
// import { useParams } from "react-router";


// const socket = io("http://localhost:3000", {
// });

// const Chat=()=> {
//     const {userId}=useParams();

//   useEffect(() => {
//     socket.on("connect", () => {
//       console.log("Connected from frontend:", socket.id);
//     });

//     return () => {
//       socket.disconnect();
//     };
//   }, []);

//   const handleSubmit=(e)=>{
//     e.preventDefault();
//     const messageInput = e.target.querySelector('input[type="text"]');
//     const message = messageInput.value;
//     socket.emit("chat message", {userId, message});
//     messageInput.value = '';
//   }

//   return <div className="text-white">
//     Chat with {userId}
//     <div className="">
//         {/* Chat messages will be displayed here */}
//         <div className="chat-messages"></div>

//         {/* Input field to send new messages */}
//         <form onSubmit={handleSubmit} className="chat-input">
//             <input type="text" placeholder="Type your message..." className="input input-bordered w-full max-w-xs text-black" />
//             <button className="btn btn-primary ml-2">Send</button>
//         </form>
//     </div>
//   </div>;
// }

// export default Chat;

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useParams } from "react-router";

const socket = io("http://localhost:3000",{});

const Chat = () => {
  const { userId } = useParams();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected from frontend:", socket.id);
    });

    // Listen for incoming messages
    socket.on("chat message", (data) => {
      setMessages((prev) => [...prev, data]); // Add new message to state
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const messageInput = e.target.querySelector('input[type="text"]');
    const message = messageInput.value.trim();
    if (!message) return;

    // Emit message to server
    socket.emit("chat message", { userId, message });

    // Also update locally
    setMessages((prev) => [...prev, { userId: "me", message }]);
    messageInput.value = "";
  };

  return (
    <div className="text-white">
      <h2>Chat with {userId}</h2>

      <div className="chat-messages border p-4 h-64 overflow-y-auto mb-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`py-1 px-2 my-1 rounded ${
              msg.userId === "me" ? "bg-blue-500 self-end" : "bg-gray-700"
            }`}
          >
            <strong>{msg.userId === "me" ? "You" : msg.userId}:</strong> {msg.message}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="chat-input flex">
        <input
          type="text"
          placeholder="Type your message..."
          className="input input-bordered w-full max-w-xs text-black"
        />
        <button className="btn btn-primary ml-2">Send</button>
      </form>
    </div>
  );
};

export default Chat;
