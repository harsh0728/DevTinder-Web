// import { useEffect, useState } from "react";
// import { useParams } from "react-router";
// import { socketConnection } from "../config/socket";
// import { useSelector } from "react-redux";
// import { apiFetch } from "../api/apiFetch";

// const Chat = () => {
//   const socket = socketConnection;
//   const { targetUserId } = useParams();
//   const user = useSelector((store) => store.user);
//   const userId = user?._id;
//   const [messages, setMessages] = useState([]);

//   useEffect(() => {
//     if (!userId || !targetUserId) return;
//     getPreviousChats();

//     socket.emit("join-room", {
//       firstName: user.firstName,
//       userId,
//       targetUserId,
//     });

//     socket.on("receive-message", (data) => {
//       setMessages((prev) => [...prev, data]);
//     });

//     return () => {
//     socket.off("receive-message");
//   };
//   }, [userId, targetUserId]);

//   const getPreviousChats=async()=>{
//     try {
//       const chats=await apiFetch("/chat/"+`${targetUserId}`);

//       const formattedChat=chats.map((chat)=>({
//         userId:chat.senderId._id,
//         firstName:chat.senderId.firstName,
//         message:chat.text,
//       }));
      
//       setMessages(formattedChat);
//     } catch (error) {
//       console.error("Failed to load previous chats", error);
//     }
//   }

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const input = e.target.elements[0];
//     const message = input.value.trim();
//     if (!message) return;

//     socket.emit("send-message", {
//       firstName: user.firstName,
//       userId,
//       targetUserId,
//       message,
//     });

//     input.value = "";
//   };

//   return (
//     <div className="text-white">
//       {/* <div className="chat-messages border p-4 h-64 overflow-y-auto mb-4">
//         {messages?.map((msg, index) => (
//           <div
//             key={index}
//             className={`py-1 px-2 my-1 rounded  ${
//               msg.userId === userId ? "bg-blue-500 text-right w-1/3 " : "bg-gray-700"
//             }`}
//           >
//             <strong>{msg.userId === userId ? "You" : msg.firstName}:</strong>{" "}
//             {msg.message}
//           </div>
//         ))}
//       </div> */}
//       <div className="chat-messages border p-4 h-64 overflow-y-auto mb-4 space-y-2">
//         {messages?.map((msg, index) => {
//           const isMe = msg.userId === userId;

//           return (
//             <div
//               key={index}
//               className={`flex ${isMe ? "justify-end" : "justify-start"}`}
//             >
//               <div className={`px-3 py-2 rounded-3xl max-w-[60%] ${
//                   isMe ? "bg-blue-500 text-white" : "bg-gray-700 text-white"
//                 }`}>
//                 {/* <strong className="block text-xs opacity-80">
//                   {isMe ? "You" : msg.firstName}
//                 </strong> */}
//                 <span>{msg.message}</span>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       <form onSubmit={handleSubmit} className="flex">
//         <input
//           type="text"
//           className="input input-bordered w-full text-black"
//           placeholder="Type..."
//         />
//         <button className="btn btn-primary ml-2">Send</button>
//       </form>
//     </div>
//   );
// };

// export default Chat;

// CHatGpt
// import { useEffect, useState, useRef } from "react";
// import { useParams } from "react-router";
// import { socketConnection } from "../config/socket";
// import { useSelector } from "react-redux";
// import { apiFetch } from "../api/apiFetch";

// const Chat = () => {
//   const socket = socketConnection;
//   const { targetUserId } = useParams();
//   const user = useSelector((store) => store.user);
//   const userId = user?._id;

//   const [messages, setMessages] = useState([]);
//   const [text, setText] = useState("");
//   const [targetUser, setTargetUser] = useState(null);
//   const [isTyping, setIsTyping] = useState(false);

//   const scrollRef = useRef(null);
//   const typingTimeoutRef = useRef(null);

//   /* ------------------- AUTO SCROLL ------------------- */
//   const scrollToBottom = () => {
//     setTimeout(() => {
//       scrollRef.current?.scrollIntoView({ behavior: "smooth" });
//     }, 80);
//   };

//   /* ------------------- LOAD PREVIOUS CHATS ------------------- */
//   const getPreviousChats = async () => {
//     try {
//       const chats = await apiFetch("/chat/" + targetUserId);

//       const formattedChat = chats.map((chat) => ({
//         _id: chat._id,
//         userId: chat.senderId._id,
//         firstName: chat.senderId.firstName,
//         message: chat.text,
//       }));

//       setMessages(formattedChat);
//       scrollToBottom();
//     } catch (err) {
//       console.log("Failed to load chats");
//     }
//   };

//   /* ------------------- LOAD TARGET USER INFO ------------------- */
//   const getTargetUserInfo = async () => {
//     try {
//       const data = await apiFetch("/user/" + targetUserId);
//       setTargetUser(data.data);
//     } catch {}
//   };

//   /* ------------------- SOCKET SETUP ------------------- */
//   useEffect(() => {
//     if (!userId || !targetUserId) return;

//     getPreviousChats();
//     getTargetUserInfo();

//     socket.emit("join-room", {
//       userId,
//       targetUserId,
//       firstName: user.firstName,
//     });

//     socket.on("receive-message", (data) => {
//       setMessages((prev) => [...prev, data]);
//       scrollToBottom();
//     });

//     socket.on("user-typing", ({ userId: u }) => {
//       if (u === targetUserId) setIsTyping(true);

//       clearTimeout(typingTimeoutRef.current);
//       typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 1500);
//     });

//     return () => {
//       socket.off("receive-message");
//       socket.off("user-typing");
//     };
//   }, [userId, targetUserId]);

//   /* ------------------- SEND MESSAGE ------------------- */
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!text.trim()) return;

//     socket.emit("send-message", {
//       userId,
//       targetUserId,
//       message: text.trim(),
//       firstName: user.firstName,
//     });

//     setText("");
//     scrollToBottom();
//   };

//   /* ------------------- TYPING EVENT ------------------- */
//   const onTyping = (e) => {
//     setText(e.target.value);

//     socket.emit("typing", { userId, targetUserId });
//   };

//   return (
//     <div className="flex flex-col h-[90vh] max-w-10xl mx-auto bg-[#121212] rounded-xl shadow-xl border border-gray-700 overflow-hidden">

//       {/* 🔹 HEADER */}
//       <div className="p-4 bg-[#1F1F1F] border-b border-gray-700 flex items-center gap-3">
//         <div className="w-10 h-10 rounded-full bg-gray-500"></div>

//         <div>
//           <h2 className="text-white text-lg font-semibold">
//             {targetUser?.firstName || "User"}
//           </h2>

//           <p className="text-sm text-gray-400">
//             {isTyping ? "Typing..." : "Online"}
//           </p>
//         </div>
//       </div>

//       {/* 🔹 MESSAGES SECTION */}
//       <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
//         {messages.map((msg, index) => {
//           const isMe = msg.userId === userId;

//           return (
//             <div key={index} className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
              
//               {!isMe && (
//                 <div className="w-8 h-8 rounded-full bg-gray-600"></div>
//               )}

//               <div
//                 className={`px-4 py-2 max-w-[65%] rounded-2xl text-sm ${
//                   isMe
//                     ? "bg-blue-600 text-white rounded-br-none"
//                     : "bg-gray-800 text-white rounded-bl-none"
//                 }`}
//               >
//                 {msg.message}
//               </div>

//               {isMe && (
//                 <div className="w-8 h-8 rounded-full bg-blue-700"></div>
//               )}
//             </div>
//           );
//         })}

//         <div ref={scrollRef}></div>
//       </div>

//       {/* 🔹 INPUT BOX */}
//       <form onSubmit={handleSubmit} className="p-3 bg-[#1F1F1F] border-t border-gray-700 flex items-center gap-3">
//         <input
//           type="text"
//           value={text}
//           onChange={onTyping}
//           placeholder="Type a message…"
//           className="flex-1 bg-[#2A2A2A] text-white px-4 py-2 rounded-full outline-none border border-gray-600 focus:border-blue-500"
//         />

//         <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full">
//           Send
//         </button>
//       </form>
//     </div>
//   );
// };

// export default Chat;


// // Claude
// import { useEffect, useState, useRef } from "react";
// import { useParams, useNavigate } from "react-router";
// import { socketConnection } from "../config/socket";
// import { useSelector } from "react-redux";
// import { apiFetch } from "../api/apiFetch";

// const Chat = () => {
//   const socket = socketConnection;
//   const { targetUserId } = useParams();
//   const navigate = useNavigate();
//   const user = useSelector((store) => store.user);
//   const userId = user?._id;
//   const [messages, setMessages] = useState([]);
//   const [inputMessage, setInputMessage] = useState("");
//   const [targetUser, setTargetUser] = useState(null);
//   const [isTyping, setIsTyping] = useState(false);
//   const [showEmoji, setShowEmoji] = useState(false);
//   const [showMenu, setShowMenu] = useState(false);
//   const [showMessageMenu, setShowMessageMenu] = useState(null);
//   const [onlineStatus, setOnlineStatus] = useState({
//     isOnline: false,
//     lastSeen: null,
//   });
//   const messagesEndRef = useRef(null);
//   const inputRef = useRef(null);
//   const typingTimeoutRef = useRef(null);

//   // Emoji list
//   const emojis = [
//     "😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊", "😇", "🙂",
//     "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛",
//     "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🥳", "😏", "😒",
//     "😞", "😔", "😟", "😕", "🙁", "😣", "😖", "😫", "😩", "🥺",
//     "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶",
//     "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🤭", "🤫", "🤥",
//     "😶", "😐", "😑", "😬", "🙄", "😯", "😦", "😧", "😮", "😲",
//     "🥱", "😴", "🤤", "😪", "😵", "🤐", "🥴", "🤢", "🤮", "🤧",
//     "😷", "🤒", "🤕", "🤑", "🤠", "👍", "👎", "👏", "🙌", "👋",
//     "🤝", "🙏", "✌️", "🤞", "🤟", "🤘", "🤙", "💪", "🦾", "❤️",
//     "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️",
//     "💕", "💞", "💓", "💗", "💖", "💘", "💝", "🔥", "✨", "⭐"
//   ];

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   useEffect(() => {
//     if (!userId || !targetUserId) return;
//     getPreviousChats();
//     getTargetUserInfo();

//     socket.emit("join-room", {
//       firstName: user.firstName,
//       userId,
//       targetUserId,
//     });

//     // Listen for messages
//     socket.on("receive-message", (data) => {
//       setMessages((prev) => [
//         ...prev,
//         { ...data, timestamp: new Date().toISOString() },
//       ]);
//     });

//     // Listen for typing status
//     socket.on("user-typing", ({ userId: typingUserId }) => {
//       if (typingUserId === targetUserId) {
//         setIsTyping(true);
//       }
//     });

//     socket.on("user-stop-typing", ({ userId: typingUserId }) => {
//       if (typingUserId === targetUserId) {
//         setIsTyping(false);
//       }
//     });

//     // Listen for online status
//     socket.on("user-online", ({ userId: onlineUserId }) => {
//       if (onlineUserId === targetUserId) {
//         setOnlineStatus({ isOnline: true, lastSeen: null });
//       }
//     });

//     socket.on("user-offline", ({ userId: offlineUserId, lastSeen }) => {
//       if (offlineUserId === targetUserId) {
//         setOnlineStatus({ isOnline: false, lastSeen });
//       }
//     });

//     // Listen for message updates
//     socket.on("message-deleted", ({ messageId }) => {
//       setMessages((prev) =>
//         prev.filter((msg) => msg._id !== messageId)
//       );
//     });

//     socket.on("message-edited", ({ messageId, newText }) => {
//       setMessages((prev) =>
//         prev.map((msg) =>
//           msg._id === messageId ? { ...msg, message: newText, edited: true } : msg
//         )
//       );
//     });

//     return () => {
//       socket.off("receive-message");
//       socket.off("user-typing");
//       socket.off("user-stop-typing");
//       socket.off("user-online");
//       socket.off("user-offline");
//       socket.off("message-deleted");
//       socket.off("message-edited");
//     };
//   }, [userId, targetUserId]);

//   // TODO
//   const getTargetUserInfo = async () => {
//     try {
//       const response = await apiFetch(`/user/${targetUserId}`);
//       setTargetUser(response.data);
//       //console.log("response: ",response);
//     } catch (error) {
//       console.error("Failed to load user info", error);
//     }
//   };

//   const getPreviousChats = async () => {
//     try {
//       const chats = await apiFetch("/chat/" + `${targetUserId}`);

//       const formattedChat = chats.map((chat) => ({
//         _id: chat._id,
//         userId: chat.senderId._id,
//         firstName: chat.senderId.firstName,
//         message: chat.text,
//         timestamp: chat.createdAt,
//         edited: chat.edited || false,
//       }));

//       setMessages(formattedChat);
//     } catch (error) {
//       console.error("Failed to load previous chats", error);
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const message = inputMessage.trim();
//     if (!message) return;

//     const newMessage = {
//       userId,
//       firstName: user.firstName,
//       message,
//       timestamp: new Date().toISOString(),
//     };

//     socket.emit("send-message", {
//       firstName: user.firstName,
//       userId,
//       targetUserId,
//       message,
//     });

//     setMessages((prev) => [...prev, newMessage]);
//     setInputMessage("");
//     socket.emit("stop-typing", { userId, targetUserId });
//   };

//   const handleTyping = (e) => {
//     setInputMessage(e.target.value);

//     // Clear previous timeout
//     if (typingTimeoutRef.current) {
//       clearTimeout(typingTimeoutRef.current);
//     }

//     if (e.target.value.length > 0) {
//       socket.emit("typing", { userId, targetUserId });

//       // Stop typing after 2 seconds of inactivity
//       typingTimeoutRef.current = setTimeout(() => {
//         socket.emit("stop-typing", { userId, targetUserId });
//       }, 2000);
//     } else {
//       socket.emit("stop-typing", { userId, targetUserId });
//     }
//   };

//   const handleEmojiClick = (emoji) => {
//     setInputMessage((prev) => prev + emoji);
//     inputRef.current?.focus();
//   };

//   const handleDeleteMessage = async (messageId) => {
//     try {
//       await apiFetch(`/chat/${messageId}`, {
//         method: "DELETE",
//       });
//       socket.emit("delete-message", { messageId, targetUserId });
//       setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
//       setShowMessageMenu(null);
//     } catch (error) {
//       console.error("Failed to delete message", error);
//     }
//   };

//   const handleEditMessage = async (messageId, currentText) => {
//     const newText = prompt("Edit message:", currentText);
//     if (newText && newText.trim() !== currentText) {
//       try {
//         await apiFetch(`/chat/${messageId}`, {
//           method: "PATCH",
//           body: JSON.stringify({ text: newText.trim() }),
//         });
//         socket.emit("edit-message", { messageId, newText: newText.trim(), targetUserId });
//         setMessages((prev) =>
//           prev.map((msg) =>
//             msg._id === messageId ? { ...msg, message: newText.trim(), edited: true } : msg
//           )
//         );
//         setShowMessageMenu(null);
//       } catch (error) {
//         console.error("Failed to edit message", error);
//       }
//     }
//   };

//   const formatTime = (timestamp) => {
//     if (!timestamp) return "";
//     const date = new Date(timestamp);
//     return date.toLocaleTimeString("en-US", {
//       hour: "numeric",
//       minute: "2-digit",
//       hour12: true,
//     });
//   };

//   const formatLastSeen = (lastSeen) => {
//     if (!lastSeen) return "";
//     const date = new Date(lastSeen);
//     const now = new Date();
//     const diffMs = now - date;
//     const diffMins = Math.floor(diffMs / 60000);
//     const diffHours = Math.floor(diffMs / 3600000);
//     const diffDays = Math.floor(diffMs / 86400000);

//     if (diffMins < 1) return "just now";
//     if (diffMins < 60) return `${diffMins}m ago`;
//     if (diffHours < 24) return `${diffHours}h ago`;
//     if (diffDays < 7) return `${diffDays}d ago`;
//     return date.toLocaleDateString();
//   };

//   return (
//     <div className="h-full w-full relative bg-gradient-to-b from-gray-900 via-gray-900 to-black flex flex-col">
//       {/* Chat Header */}
//       <div className=" bg-gray-800/50 backdrop-blur-lg border-b border-gray-700/50 px-4 sm:px-6 py-4 flex items-center gap-3 sm:gap-4 shadow-lg flex-shrink-0">
//         {/* Back Button */}
//         <button
//           onClick={() => navigate(-1)}
//           className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700/50 rounded-lg lg:hidden"
//         >
//           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//           </svg>
//         </button>

//         <div className="relative">
//           <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg ring-2 ring-purple-500/20">
//             {targetUser?.firstName?.[0]?.toUpperCase() || "?"}
//           </div>
//           {onlineStatus.isOnline && (
//             <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-green-500 rounded-full border-2 border-gray-800 shadow-sm"></div>
//           )}
//         </div>

//         <div className="flex-1 min-w-0">
//           <h2 className="text-white font-semibold text-base sm:text-lg truncate">
//             {targetUser?.firstName || "Loading..."}
//           </h2>
//           <p className="text-xs sm:text-sm">
//             {isTyping ? (
//               <span className="text-green-400 flex items-center gap-1">
//                 <span>typing</span>
//                 <span className="flex gap-0.5">
//                   <span className="w-1 h-1 bg-green-400 rounded-full animate-bounce"></span>
//                   <span className="w-1 h-1 bg-green-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
//                   <span className="w-1 h-1 bg-green-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
//                 </span>
//               </span>
//             ) : onlineStatus.isOnline ? (
//               <span className="text-green-400">online</span>
//             ) : (
//               <span className="text-gray-400">
//                 {onlineStatus.lastSeen
//                   ? `last seen ${formatLastSeen(onlineStatus.lastSeen)}`
//                   : "offline"}
//               </span>
//             )}
//           </p>
//         </div>

//         {/* Menu Button */}
//         <div className="relative">
//           <button
//             onClick={() => setShowMenu(!showMenu)}
//             className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700/50 rounded-lg"
//           >
//             <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
//             </svg>
//           </button>

//           {/* Dropdown Menu */}
//           {showMenu && (
//             <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden z-50">
//               <button
//                 onClick={() => {
//                   alert("View Profile");
//                   setShowMenu(false);
//                 }}
//                 className="w-full px-4 py-3 text-left text-white hover:bg-gray-700 transition-colors flex items-center gap-3"
//               >
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                 </svg>
//                 View Profile
//               </button>
//               <button
//                 onClick={() => {
//                   alert("Search in Chat");
//                   setShowMenu(false);
//                 }}
//                 className="w-full px-4 py-3 text-left text-white hover:bg-gray-700 transition-colors flex items-center gap-3"
//               >
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                 </svg>
//                 Search
//               </button>
//               <button
//                 onClick={() => {
//                   if (confirm("Clear all messages?")) {
//                     setMessages([]);
//                   }
//                   setShowMenu(false);
//                 }}
//                 className="w-full px-4 py-3 text-left text-white hover:bg-gray-700 transition-colors flex items-center gap-3"
//               >
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                 </svg>
//                 Clear Chat
//               </button>
//               <button
//                 onClick={() => {
//                   alert("Block User");
//                   setShowMenu(false);
//                 }}
//                 className="w-full px-4 py-3 text-left text-red-400 hover:bg-gray-700 transition-colors flex items-center gap-3"
//               >
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
//                 </svg>
//                 Block
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Messages Container */}
//       <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3 sm:space-y-4 scroll-smooth">
//         {messages.length === 0 ? (
//           <div className="flex flex-col items-center justify-center h-full text-gray-500">
//             <svg className="w-16 h-16 sm:w-20 sm:h-20 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
//             </svg>
//             <p className="text-sm sm:text-base">No messages yet</p>
//             <p className="text-xs sm:text-sm mt-1">Start the conversation!</p>
//           </div>
//         ) : (
//           messages?.map((msg, index) => {
//             const isMe = msg.userId === userId;
//             const showAvatar = index === 0 || messages[index - 1]?.userId !== msg.userId;

//             return (
//               <div
//                 key={index}
//                 className={`flex gap-2 ${isMe ? "justify-end" : "justify-start"} opacity-0 animate-[fadeIn_0.3s_ease-out_forwards]`}
//                 style={{ animationDelay: `${Math.min(index * 0.05, 1)}s` }}
//               >
//                 {/* Avatar for other user */}
//                 {!isMe && (
//                   <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white text-xs sm:text-sm font-semibold shadow-lg flex-shrink-0 ring-2 ring-purple-500/20 ${showAvatar ? "opacity-100" : "opacity-0"}`}>
//                     {showAvatar ? msg.firstName?.[0]?.toUpperCase() : ""}
//                   </div>
//                 )}

//                 {/* Message Bubble */}
//                 <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[75%] sm:max-w-[70%] group`}>
//                   <div className="relative">
//                     <div
//                       className={`px-3 sm:px-4 py-2 rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl ${
//                         isMe
//                           ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md"
//                           : "bg-gray-800 text-white rounded-bl-md border border-gray-700/50"
//                       }`}
//                     >
//                       <p className="text-xs sm:text-sm leading-relaxed break-words">
//                         {msg.message}
//                         {msg.edited && <span className="text-[10px] opacity-60 ml-2">(edited)</span>}
//                       </p>
//                     </div>

//                     {/* Message Options - Only for own messages */}
//                     {isMe && msg._id && (
//                       <div className="absolute -right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
//                         <button
//                           onClick={() => setShowMessageMenu(showMessageMenu === index ? null : index)}
//                           className="p-1 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
//                         >
//                           <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
//                             <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
//                           </svg>
//                         </button>

//                         {/* Message Menu Dropdown */}
//                         {showMessageMenu === index && (
//                           <div className="absolute right-0 mt-1 w-32 bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden z-50">
//                             <button
//                               onClick={() => handleEditMessage(msg._id, msg.message)}
//                               className="w-full px-3 py-2 text-left text-sm text-white hover:bg-gray-700 transition-colors flex items-center gap-2"
//                             >
//                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                               </svg>
//                               Edit
//                             </button>
//                             <button
//                               onClick={() => handleDeleteMessage(msg._id)}
//                               className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-700 transition-colors flex items-center gap-2"
//                             >
//                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                               </svg>
//                               Delete
//                             </button>
//                           </div>
//                         )}
//                       </div>
//                     )}
//                   </div>

//                   <span className="text-[10px] sm:text-xs text-gray-500 mt-1 px-2">
//                     {formatTime(msg.timestamp)}
//                   </span>
//                 </div>

//                 {/* Avatar for current user */}
//                 {isMe && (
//                   <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs sm:text-sm font-semibold shadow-lg flex-shrink-0 ring-2 ring-blue-500/20 ${showAvatar ? "opacity-100" : "opacity-0"}`}>
//                     {showAvatar ? user.firstName?.[0]?.toUpperCase() : ""}
//                   </div>
//                 )}
//               </div>
//             );
//           })
//         )}
//         <div ref={messagesEndRef} />
//       </div>

//       {/* Emoji Picker */}
//       {showEmoji && (
//         <div className="bg-gray-800 border-t border-gray-700 p-3 max-h-60 overflow-y-auto">
//           <div className="grid grid-cols-8 sm:grid-cols-10 gap-2">
//             {emojis.map((emoji, index) => (
//               <button
//                 key={index}
//                 onClick={() => handleEmojiClick(emoji)}
//                 className="text-2xl hover:bg-gray-700 rounded p-1 transition-colors"
//               >
//                 {emoji}
//               </button>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Input Area */}
//       <div className="bg-gray-800/50 backdrop-blur-lg border-t border-gray-700/50 px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
//         <form onSubmit={handleSubmit} className="flex items-center gap-2 sm:gap-3">
//           {/* Emoji Button */}
//           <button
//             type="button"
//             onClick={() => setShowEmoji(!showEmoji)}
//             className={`transition-all duration-200 flex-shrink-0 p-2 hover:bg-gray-700/50 rounded-lg ${
//               showEmoji ? "text-yellow-400" : "text-gray-400 hover:text-yellow-400"
//             }`}
//           >
//             <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
//               <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
//             </svg>
//           </button>

//           {/* Input Field */}
//           <input
//             ref={inputRef}
//             type="text"
//             value={inputMessage}
//             onChange={handleTyping}
//             className="flex-1 bg-gray-700/50 text-white placeholder-gray-400 px-3 sm:px-4 py-2.5 sm:py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm sm:text-base border border-gray-700/30"
//             placeholder="Type a message..."
//           />

//           {/* Send Button */}
//           <button
//             type="submit"
//             disabled={!inputMessage.trim()}
//             className={`p-2.5 sm:p-3 rounded-full transition-all duration-200 flex-shrink-0 ${
//               inputMessage.trim()
//                 ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
//                 : "bg-gray-700/50 text-gray-500 cursor-not-allowed"
//             }`}
//           >
//             <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
//             </svg>
//           </button>
//         </form>
//       </div>

//       {/* Click outside to close menus */}
//       {(showMenu || showEmoji || showMessageMenu !== null) && (
//         <div
//           className="fixed inset-0 z-40"
//           onClick={() => {
//             setShowMenu(false);
//             setShowEmoji(false);
//             setShowMessageMenu(null);
//           }}
//         />
//       )}
//     </div>
//   );
// };

// export default Chat;

// v0.dev

import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { socketConnection } from "../config/socket";
import { useSelector } from "react-redux";
import { apiFetch } from "../api/apiFetch";
import CallPage from "./CallPage";

const Chat = () => {
  const socket = socketConnection;
  const { targetUserId } = useParams();
  const navigate = useNavigate();
  const user = useSelector((store) => store.user);
  const userId = user?._id;
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [targetUser, setTargetUser] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showMessageMenu, setShowMessageMenu] = useState(null);
  const [onlineStatus, setOnlineStatus] = useState({
    isOnline: false,
    lastSeen: null,
  });
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Emoji list
  const emojis = [
    "😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊", "😇", "🙂",
    "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛",
    "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🥳", "😏", "😒",
    "😞", "😔", "😟", "😕", "🙁", "😣", "😖", "😫", "😩", "🥺",
    "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶",
    "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🤭", "🤫", "🤥",
    "😶", "😐", "😑", "😬", "🙄", "😯", "😦", "😧", "😮", "😲",
    "🥱", "😴", "🤤", "😪", "😵", "🤐", "🥴", "🤢", "🤮", "🤧",
    "😷", "🤒", "🤕", "🤑", "🤠", "👍", "👎", "👏", "🙌", "👋",
    "🤝", "🙏", "✌️", "🤞", "🤟", "🤘", "🤙", "💪", "🦾", "❤️",
    "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️",
    "💕", "💞", "💓", "💗", "💖", "💘", "💝", "🔥", "✨", "⭐"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!userId || !targetUserId) return;
    getPreviousChats();
    getTargetUserInfo();

    socket.emit("join-room", {
      firstName: user.firstName,
      userId,
      targetUserId,
    });

    // NEW: Emit user online status
    socket.emit("user-online", { userId });

    // Listen for messages
    socket.on("receive-message", (data) => {
      setMessages((prev) => [
        ...prev,
        { ...data, timestamp: new Date().toISOString() },
      ]);
    });

    // Listen for typing status
    socket.on("user-typing", ({ userId: typingUserId }) => {
      if (typingUserId === targetUserId) {
        setIsTyping(true);
      }
    });

    socket.on("user-stop-typing", ({ userId: typingUserId }) => {
      if (typingUserId === targetUserId) {
        setIsTyping(false);
      }
    });

    // Listen for online status
    socket.on("user-online", ({ userId: onlineUserId }) => {
      if (onlineUserId === targetUserId) {
        setOnlineStatus({ isOnline: true, lastSeen: null });
      }
    });

    socket.on("user-offline", ({ userId: offlineUserId, lastSeen }) => {
      if (offlineUserId === targetUserId) {
        setOnlineStatus({ isOnline: false, lastSeen });
      }
    });

    // Listen for message updates
    socket.on("message-deleted", ({ messageId }) => {
      setMessages((prev) =>
        prev.filter((msg) => msg._id !== messageId)
      );
    });

    socket.on("message-edited", ({ messageId, newText }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, message: newText, edited: true } : msg
        )
      );
    });

    return () => {
      socket.off("receive-message");
      socket.off("user-typing");
      socket.off("user-stop-typing");
      socket.off("user-online");
      socket.off("user-offline");
      socket.off("message-deleted");
      socket.off("message-edited");
    };
  }, [userId, targetUserId]);

  // TODO
  const getTargetUserInfo = async () => {
    try {
      const response = await apiFetch(`/user/${targetUserId}`);
      setTargetUser(response.data);
      //console.log("response: ",response);
    } catch (error) {
      console.error("Failed to load user info", error);
    }
  };

  const getPreviousChats = async () => {
    try {
      const chats = await apiFetch("/chat/" + `${targetUserId}`);

      const formattedChat = chats.map((chat) => ({
        _id: chat._id,
        userId: chat.senderId._id,
        firstName: chat.senderId.firstName,
        message: chat.text,
        timestamp: chat.createdAt,
        edited: chat.edited || false,
      }));

      setMessages(formattedChat);
    } catch (error) {
      console.error("Failed to load previous chats", error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const message = inputMessage.trim();
    if (!message) return;

    const newMessage = {
      userId,
      firstName: user.firstName,
      message,
      timestamp: new Date().toISOString(),
    };

    socket.emit("send-message", {
      firstName: user.firstName,
      userId,
      targetUserId,
      message,
    });

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");
    socket.emit("stop-typing", { userId, targetUserId });
  };

  const handleTyping = (e) => {
    setInputMessage(e.target.value);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (e.target.value.length > 0) {
      socket.emit("typing", { userId, targetUserId });

      // Stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stop-typing", { userId, targetUserId });
      }, 2000);
    } else {
      socket.emit("stop-typing", { userId, targetUserId });
    }
  };

  const handleEmojiClick = (emoji) => {
    setInputMessage((prev) => prev + emoji);
    setShowEmoji(false);
    inputRef.current?.focus();
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await apiFetch(`/chat/${messageId}`, {
        method: "DELETE",
      });
      socket.emit("delete-message", { messageId, targetUserId });
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      setShowMessageMenu(null);
    } catch (error) {
      console.error("Failed to delete message", error);
    }
  };

  const handleEditMessage = async (messageId, currentText) => {
    const newText = prompt("Edit message:", currentText);
    if (newText && newText.trim() !== currentText) {
      try {
        await apiFetch(`/chat/${messageId}`, {
          method: "PATCH",
          body: JSON.stringify({ text: newText.trim() }),
        });
        socket.emit("edit-message", { messageId, newText: newText.trim(), targetUserId });
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId ? { ...msg, message: newText.trim(), edited: true } : msg
          )
        );
        setShowMessageMenu(null);
      } catch (error) {
        console.error("Failed to edit message", error);
      }
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return "";
    const date = new Date(lastSeen);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleAudioCall = () => {
  // Navigate to call page for audio call
    navigate(`/call/${userId}/${targetUserId}?type=audio`);
  };

  const handleVideoCall = () => {
    // Navigate to call page for video call  
    navigate(`/call/${userId}/${targetUserId}?type=video`);
  };
 
  
  return (
    <div className="h-full w-full relative bg-gradient-to-b from-gray-900 via-gray-900 to-black flex flex-col">
      {/* Chat Header */}
      <div className=" bg-gray-800/50 backdrop-blur-lg border-b border-gray-700/50 px-4 sm:px-6 py-4 flex items-center gap-3 sm:gap-4 shadow-lg flex-shrink-0">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700/50 rounded-lg lg:hidden"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="relative">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg ring-2 ring-purple-500/20">
            {targetUser?.firstName?.[0]?.toUpperCase() || "?"}
          </div>
          {onlineStatus.isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-green-500 rounded-full border-2 border-gray-800 shadow-sm"></div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-white font-semibold text-base sm:text-lg truncate">
            {targetUser?.firstName || "Loading..."}
          </h2>
          <p className="text-xs sm:text-sm">
            {isTyping ? (
              <span className="text-green-400 flex items-center gap-1">
                <span>typing</span>
                <span className="flex gap-0.5">
                  <span className="w-1 h-1 bg-green-400 rounded-full animate-bounce"></span>
                  <span className="w-1 h-1 bg-green-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1 h-1 bg-green-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </span>
              </span>
            ) : onlineStatus.isOnline ? (
              <span className="text-green-400">online</span>
            ) : (
              <span className="text-gray-400">
                {onlineStatus.lastSeen
                  ? `last seen ${formatLastSeen(onlineStatus.lastSeen)}`
                  : "offline"}
              </span>
            )}
          </p>
        </div>

        {/* Audio Call Button */}
        <button 
          onClick={handleAudioCall} 
          className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700/50 rounded-lg"
          title="Audio Call"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </button>

        {/* Video Call Button */}
        <button 
          onClick={handleVideoCall} 
          className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700/50 rounded-lg"
          title="Video Call"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>

        {/* Menu Button */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700/50 rounded-lg"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden z-50">
              <button
                onClick={() => {
                  alert("View Profile");
                  setShowMenu(false);
                }}
                className="w-full px-4 py-3 text-left text-white hover:bg-gray-700 transition-colors flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                View Profile
              </button>
              <button
                onClick={() => {
                  alert("Search in Chat");
                  setShowMenu(false);
                }}
                className="w-full px-4 py-3 text-left text-white hover:bg-gray-700 transition-colors flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
              </button>
              <button
                onClick={() => {
                  if (confirm("Clear all messages?")) {
                    setMessages([]);
                  }
                  setShowMenu(false);
                }}
                className="w-full px-4 py-3 text-left text-white hover:bg-gray-700 transition-colors flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear Chat
              </button>
              <button
                onClick={() => {
                  alert("Block User");
                  setShowMenu(false);
                }}
                className="w-full px-4 py-3 text-left text-red-400 hover:bg-gray-700 transition-colors flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                Block
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3 sm:space-y-4 scroll-smooth">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <svg className="w-16 h-16 sm:w-20 sm:h-20 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm sm:text-base">No messages yet</p>
            <p className="text-xs sm:text-sm mt-1">Start the conversation!</p>
          </div>
        ) : (
          messages?.map((msg, index) => {
            const isMe = msg.userId === userId;
            const showAvatar = index === 0 || messages[index - 1]?.userId !== msg.userId;

            return (
              <div
                key={index}
                className={`flex gap-2 ${isMe ? "justify-end" : "justify-start"} opacity-0 animate-[fadeIn_0.3s_ease-out_forwards]`}
                style={{ animationDelay: `${Math.min(index * 0.05, 1)}s` }}
              >
                {/* Avatar for other user */}
                {!isMe && (
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white text-xs sm:text-sm font-semibold shadow-lg flex-shrink-0 ring-2 ring-purple-500/20 ${showAvatar ? "opacity-100" : "opacity-0"}`}>
                    {showAvatar ? msg.firstName?.[0]?.toUpperCase() : ""}
                  </div>
                )}

                {/* Message Bubble */}
                <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[75%] sm:max-w-[70%] group`}>
                  <div className="relative">
                    <div
                      className={`px-3 sm:px-4 py-2 rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl ${
                        isMe
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md"
                          : "bg-gray-800 text-white rounded-bl-md border border-gray-700/50"
                      }`}
                    >
                      <p className="text-xs sm:text-sm leading-relaxed break-words">
                        {msg.message}
                        {msg.edited && <span className="text-[10px] opacity-60 ml-2">(edited)</span>}
                      </p>
                    </div>

                    {/* Message Options - Only for own messages */}
                    {isMe && msg._id && (
                      <div className="absolute -right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setShowMessageMenu(showMessageMenu === index ? null : index)}
                          className="p-1 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
                        >
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                          </svg>
                        </button>

                        {/* Message Menu Dropdown */}
                        {showMessageMenu === index && (
                          <div className="absolute right-0 mt-1 w-32 bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden z-50">
                            <button
                              onClick={() => handleEditMessage(msg._id, msg.message)}
                              className="w-full px-3 py-2 text-left text-sm text-white hover:bg-gray-700 transition-colors flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteMessage(msg._id)}
                              className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-700 transition-colors flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] sm:text-xs text-gray-500 mt-1 px-2">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>

                {/* Avatar for current user */}
                {isMe && (
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs sm:text-sm font-semibold shadow-lg flex-shrink-0 ring-2 ring-blue-500/20 ${showAvatar ? "opacity-100" : "opacity-0"}`}>
                    {showAvatar ? user.firstName?.[0]?.toUpperCase() : ""}
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Emoji Picker */}
      {showEmoji && (
        <div className="bg-gray-800 border-t border-gray-700 p-3 max-h-60 overflow-y-auto">
          <div className="grid grid-cols-8 sm:grid-cols-10 gap-2">
            {emojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => handleEmojiClick(emoji)}
                className="text-2xl hover:bg-gray-700 rounded p-1 transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-gray-800/50 backdrop-blur-lg border-t border-gray-700/50 px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 sm:gap-3">
          {/* Emoji Button */}
          <button
            type="button"
            onClick={() => setShowEmoji(!showEmoji)}
            className={`transition-all duration-200 flex-shrink-0 p-2 hover:bg-gray-700/50 rounded-lg ${
              showEmoji ? "text-yellow-400" : "text-gray-400 hover:text-yellow-400"
            }`}
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
            </svg>
          </button>

          {/* Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={handleTyping}
            className="flex-1 bg-gray-700/50 text-white placeholder-gray-400 px-3 sm:px-4 py-2.5 sm:py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm sm:text-base border border-gray-700/30"
            placeholder="Type a message..."
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className={`p-2.5 sm:p-3 rounded-full transition-all duration-200 flex-shrink-0 ${
              inputMessage.trim()
                ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                : "bg-gray-700/50 text-gray-500 cursor-not-allowed"
            }`}
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>

      {/* Click outside to close menus */}
      {(showMenu || showEmoji || showMessageMenu !== null) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowMenu(false);
            setShowEmoji(false);
            setShowMessageMenu(null);
          }}
        />
      )}
    </div>
  );
};

export default Chat;
