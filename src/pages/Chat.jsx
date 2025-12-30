import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { socketConnection } from "../config/socket";
import { useSelector } from "react-redux";
import { apiFetch } from "../api/apiFetch";

const Chat = () => {
  const socket = socketConnection;
  const { targetUserId } = useParams();
  const user = useSelector((store) => store.user);
  const userId = user?._id;
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!userId || !targetUserId) return;
    getPreviousChats();

    socket.emit("join-room", {
      firstName: user.firstName,
      userId,
      targetUserId,
    });

    socket.on("receive-message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
    socket.off("receive-message");
  };
  }, [userId, targetUserId]);

  const getPreviousChats=async()=>{
    try {
      const chats=await apiFetch("/chat/"+`${targetUserId}`);

      const formattedChat=chats.map((chat)=>({
        userId:chat.senderId._id,
        firstName:chat.senderId.firstName,
        message:chat.text,
      }));
      
      setMessages(formattedChat);
    } catch (error) {
      console.error("Failed to load previous chats", error);
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const input = e.target.elements[0];
    const message = input.value.trim();
    if (!message) return;

    socket.emit("send-message", {
      firstName: user.firstName,
      userId,
      targetUserId,
      message,
    });

    input.value = "";
  };

  return (
    <div className="text-white">
      {/* <div className="chat-messages border p-4 h-64 overflow-y-auto mb-4">
        {messages?.map((msg, index) => (
          <div
            key={index}
            className={`py-1 px-2 my-1 rounded  ${
              msg.userId === userId ? "bg-blue-500 text-right w-1/3 " : "bg-gray-700"
            }`}
          >
            <strong>{msg.userId === userId ? "You" : msg.firstName}:</strong>{" "}
            {msg.message}
          </div>
        ))}
      </div> */}
      <div className="chat-messages border p-4 h-64 overflow-y-auto mb-4 space-y-2">
        {messages?.map((msg, index) => {
          const isMe = msg.userId === userId;

          return (
            <div
              key={index}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div className={`px-3 py-2 rounded-3xl max-w-[60%] ${
                  isMe ? "bg-blue-500 text-white" : "bg-gray-700 text-white"
                }`}>
                {/* <strong className="block text-xs opacity-80">
                  {isMe ? "You" : msg.firstName}
                </strong> */}
                <span>{msg.message}</span>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          className="input input-bordered w-full text-black"
          placeholder="Type..."
        />
        <button className="btn btn-primary ml-2">Send</button>
      </form>
    </div>
  );
};

export default Chat;
