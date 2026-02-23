// import { useEffect, useState, useRef } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { socketConnection } from "../config/socket";
// import { useSelector } from "react-redux";
// import crypto from "crypto-js";

// const CallPage = () => {
//   const { userId, targetUserId } = useParams();
//   const navigate = useNavigate();
//   const socket = socketConnection;
//   const user = useSelector((store) => store.user);

//   // State
//   const [callStatus, setCallStatus] = useState("initiating");
//   const [callType, setCallType] = useState("video");
//   const [isMuted, setIsMuted] = useState(false);
//   const [isVideoOff, setIsVideoOff] = useState(false);
//   const [remoteVideoEnabled, setRemoteVideoEnabled] = useState(true);
//   const [callDuration, setCallDuration] = useState(0);
//   const [targetUserInfo, setTargetUserInfo] = useState(null);
//   const [incomingCall, setIncomingCall] = useState(null);

//   // Refs
//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);
//   const remoteAudioRef = useRef(null); // ✅ Separate ref for audio element
//   const peerConnectionRef = useRef(null);
//   const localStreamRef = useRef(null);
//   const callTimerRef = useRef(null);
//   const roomIdRef = useRef(null);
//   const isCallerRef = useRef(false); // ✅ Track if this user initiated the call
//   const pendingCandidatesRef = useRef([]); // ✅ Queue ICE candidates until remote desc is set

//   // WebRTC Configuration
//   const iceServers = {
//     iceServers: [
//       { urls: "stun:stun.l.google.com:19302" },
//       { urls: "stun:stun1.l.google.com:19302" },
//       { urls: "stun:stun2.l.google.com:19302" },
//     ],
//   };

//   // Generate room ID (must match server logic)
//   const getSecretRoomId = (userId1, userId2) => {
//     const ids = [userId1, userId2].sort().join("_");
//     return crypto.SHA256(ids).toString(crypto.enc.Hex);
//   };

//   // Initialize local media stream
//   const initializeLocalStream = async (isVideoCall = true) => {
//     // ✅ Don't re-initialize if already have a stream
//     if (localStreamRef.current) {
//       return localStreamRef.current;
//     }

//     try {
//       const constraints = {
//         audio: true,
//         video: isVideoCall
//           ? { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } }
//           : false,
//       };

//       const stream = await navigator.mediaDevices.getUserMedia(constraints);
//       localStreamRef.current = stream;

//       if (localVideoRef.current) {
//         localVideoRef.current.srcObject = stream;
//       }

//       console.log("Local stream initialized:", stream);
//       return stream;
//     } catch (error) {
//       console.error("Error accessing media devices:", error);
//       alert("Could not access camera/microphone. Please check permissions.");
//       navigate(-1);
//       throw error;
//     }
//   };

//   // Create peer connection
//   const createPeerConnection = () => {
//     // ✅ Close existing connection before creating a new one
//     if (peerConnectionRef.current) {
//       peerConnectionRef.current.close();
//     }

//     const peerConnection = new RTCPeerConnection(iceServers);
//     peerConnectionRef.current = peerConnection;

//     // Add local stream tracks
//     if (localStreamRef.current) {
//       localStreamRef.current.getTracks().forEach((track) => {
//         peerConnection.addTrack(track, localStreamRef.current);
//       });
//     }

//     // Handle incoming remote tracks
//     peerConnection.ontrack = (event) => {
//       console.log("Received remote track:", event.track.kind);
//       const [remoteStream] = event.streams;

//       if (remoteVideoRef.current) {
//         remoteVideoRef.current.srcObject = remoteStream;
//       }
//       // ✅ Also attach to audio element for audio-only calls
//       if (remoteAudioRef.current) {
//         remoteAudioRef.current.srcObject = remoteStream;
//       }
//     };

//     // Handle ICE candidates
//     peerConnection.onicecandidate = (event) => {
//       if (event.candidate) {
//         console.log("Sending ICE candidate");
//         socket.emit("webrtc-ice-candidate", {
//           roomId: roomIdRef.current,
//           candidate: event.candidate,
//         });
//       }
//     };

//     // Connection state changes
//     peerConnection.onconnectionstatechange = () => {
//       console.log("Connection state:", peerConnection.connectionState);

//       if (peerConnection.connectionState === "connected") {
//         setCallStatus("connected");
//         startCallTimer();
//       } else if (
//         ["disconnected", "failed", "closed"].includes(peerConnection.connectionState)
//       ) {
//         endCall();
//       }
//     };

//     return peerConnection;
//   };

//   // ✅ Flush queued ICE candidates after remote description is set
//   const flushPendingCandidates = async () => {
//     if (!peerConnectionRef.current) return;
//     while (pendingCandidatesRef.current.length > 0) {
//       const candidate = pendingCandidatesRef.current.shift();
//       try {
//         await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
//         console.log("Flushed queued ICE candidate");
//       } catch (err) {
//         console.error("Error flushing ICE candidate:", err);
//       }
//     }
//   };

//   // Start call timer
//   const startCallTimer = () => {
//     if (callTimerRef.current) clearInterval(callTimerRef.current);
//     callTimerRef.current = setInterval(() => {
//       setCallDuration((prev) => prev + 1);
//     }, 1000);
//   };

//   // Format call duration
//   const formatDuration = (seconds) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
//   };

//   // Create and send WebRTC offer (caller side)
//   const createOffer = async () => {
//     try {
//       const pc = peerConnectionRef.current;
//       if (!pc) {
//         console.error("No peer connection to create offer");
//         return;
//       }

//       const offer = await pc.createOffer();
//       await pc.setLocalDescription(offer);

//       socket.emit("webrtc-offer", {
//         roomId: roomIdRef.current,
//         offer,
//       });

//       console.log("Offer created and sent");
//     } catch (err) {
//       console.error("Error creating offer:", err);
//     }
//   };

//   // Handle incoming offer (receiver side)
//   const handleOffer = async (offer) => {
//     try {
//       // ✅ Create peer connection fresh for receiver (stream already initialized in acceptCall)
//       const peerConnection = createPeerConnection();

//       await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

//       // ✅ Flush any ICE candidates that arrived before the offer
//       await flushPendingCandidates();

//       const answer = await peerConnection.createAnswer();
//       await peerConnection.setLocalDescription(answer);

//       socket.emit("webrtc-answer", {
//         roomId: roomIdRef.current,
//         answer,
//       });

//       console.log("Answer created and sent");
//     } catch (error) {
//       console.error("Error handling offer:", error);
//     }
//   };

//   // Handle incoming answer (caller side)
//   const handleAnswer = async (answer) => {
//     try {
//       const pc = peerConnectionRef.current;
//       if (!pc) return;

//       if (pc.signalingState === "have-local-offer") {
//         await pc.setRemoteDescription(new RTCSessionDescription(answer));
//         // ✅ Flush queued ICE candidates after setting remote description
//         await flushPendingCandidates();
//         console.log("Answer received and remote description set");
//       } else {
//         console.warn("Unexpected signaling state for answer:", pc.signalingState);
//       }
//     } catch (error) {
//       console.error("Error handling answer:", error);
//     }
//   };

//   // Handle ICE candidate
//   const handleIceCandidate = async (candidate) => {
//     try {
//       const pc = peerConnectionRef.current;

//       // ✅ Queue candidates if remote description not yet set
//       if (!pc || !pc.remoteDescription) {
//         console.log("Queuing ICE candidate (no remote description yet)");
//         pendingCandidatesRef.current.push(candidate);
//         return;
//       }

//       await pc.addIceCandidate(new RTCIceCandidate(candidate));
//       console.log("ICE candidate added");
//     } catch (error) {
//       console.error("Error adding ICE candidate:", error);
//     }
//   };

//   // Toggle mute
//   const toggleMute = () => {
//     if (localStreamRef.current) {
//       const audioTrack = localStreamRef.current.getAudioTracks()[0];
//       if (audioTrack) {
//         audioTrack.enabled = !audioTrack.enabled;
//         setIsMuted(!audioTrack.enabled);
//         socket.emit("toggle-audio", {
//           roomId: roomIdRef.current,
//           audioEnabled: audioTrack.enabled,
//         });
//       }
//     }
//   };

//   // Toggle video
//   const toggleVideo = () => {
//     if (localStreamRef.current) {
//       const videoTrack = localStreamRef.current.getVideoTracks()[0];
//       if (videoTrack) {
//         videoTrack.enabled = !videoTrack.enabled;
//         setIsVideoOff(!videoTrack.enabled);
//         socket.emit("toggle-video", {
//           roomId: roomIdRef.current,
//           videoEnabled: videoTrack.enabled,
//         });
//       }
//     }
//   };

//   // End call
//   const endCall = () => {
//     if (localStreamRef.current) {
//       localStreamRef.current.getTracks().forEach((track) => track.stop());
//       localStreamRef.current = null;
//     }

//     if (peerConnectionRef.current) {
//       peerConnectionRef.current.close();
//       peerConnectionRef.current = null;
//     }

//     if (callTimerRef.current) {
//       clearInterval(callTimerRef.current);
//     }

//     if (roomIdRef.current) {
//       socket.emit("end-call", { roomId: roomIdRef.current });
//     }

//     setCallStatus("ended");

//     setTimeout(() => {
//       navigate(-1);
//     }, 2000);
//   };

//   // Accept incoming call (receiver)
//   const acceptCall = async () => {
//     setCallStatus("connecting");

//     // ✅ Initialize stream FIRST before emitting accept
//     await initializeLocalStream(incomingCall?.callType === "video");

//     socket.emit("accept-call", {
//       roomId: roomIdRef.current,
//       userId: userId,
//     });
//   };

//   // Reject incoming call
//   const rejectCall = () => {
//     socket.emit("reject-call", {
//       roomId: roomIdRef.current,
//       userId: userId,
//     });
//     navigate(-1);
//   };

//   useEffect(() => {
//     if (!userId || !targetUserId) {
//       navigate("/connections");
//       return;
//     }

//     const roomId = getSecretRoomId(userId, targetUserId);
//     roomIdRef.current = roomId;

//     // Join the call signaling room
//     socket.emit("join-call-room", { userId, targetUserId });

//     // ─── Socket Listeners ───────────────────────────────────────────────────

//     // ✅ Someone is calling us
//     socket.on("incoming-call", (data) => {
//       console.log("Incoming call:", data);
//       // ✅ Use the roomId from the server (not recalculated) to stay consistent
//       roomIdRef.current = data.roomId;
//       setIncomingCall(data);
//       setCallType(data.callType);
//       setCallStatus("ringing");
//       isCallerRef.current = false;
//     });

//     // ✅ Receiver accepted — caller now creates the offer
//     socket.on("call-accepted", async (data) => {
//       console.log("Call accepted, creating offer...");
//       setCallStatus("connecting");
//       setCallType(data.callType);

//       // ✅ Create peer connection with the already-initialized local stream
//       createPeerConnection();

//       // ✅ Small delay ensures receiver's peer connection is ready
//       await new Promise((r) => setTimeout(r, 300));
//       await createOffer();
//     });

//     socket.on("call-rejected", () => {
//       console.log("Call rejected");
//       alert("Call was rejected");
//       navigate(-1);
//     });

//     // ✅ Receiver gets the offer → creates answer
//     socket.on("webrtc-offer", async (data) => {
//       console.log("Received WebRTC offer");
//       await handleOffer(data.offer);
//     });

//     // ✅ Caller gets the answer
//     socket.on("webrtc-answer", async (data) => {
//       console.log("Received WebRTC answer");
//       await handleAnswer(data.answer);
//     });

//     socket.on("webrtc-ice-candidate", async (data) => {
//       await handleIceCandidate(data.candidate);
//     });

//     socket.on("remote-video-toggle", (data) => {
//       setRemoteVideoEnabled(data.videoEnabled);
//     });

//     socket.on("remote-audio-toggle", (data) => {
//       // Optional: show muted indicator
//       console.log("Remote audio toggled:", data.audioEnabled);
//     });

//     socket.on("call-ended", () => {
//       console.log("Call ended by remote user");
//       endCall();
//     });

//     socket.on("call-failed", (data) => {
//       alert(data.reason);
//       navigate(-1);
//     });

//     // ─── Auto-initiate if we are the caller ────────────────────────────────
//     const initiateCall = async () => {
//       try {
//         isCallerRef.current = true;

//         const isVideoCall = true; // ✅ Derive from route/props as needed
//         setCallType(isVideoCall ? "video" : "audio");

//         // ✅ Initialize stream ONCE here for the caller
//         await initializeLocalStream(isVideoCall);

//         socket.emit("initiate-call", {
//           callerId: userId,
//           receiverId: targetUserId,
//           callType: isVideoCall ? "video" : "audio",
//         });

//         setCallStatus("ringing");
//       } catch (error) {
//         console.error("Error initiating call:", error);
//       }
//     };

//     // ✅ Only auto-initiate if we are NOT the receiver of an incoming call.
//     // The CallPage is opened for the receiver via a notification/redirect;
//     // we detect the caller by checking URL params set by the chat page.
//     // A simple heuristic: if the page is loaded with a `caller=true` search param
//     // or by convention (chat initiates with userId=self, targetUserId=other).
//     // Here we use the straightforward approach: always initiate unless
//     // the server sends us an `incoming-call` event (receiver path).
//     // We add a short grace window — if we get `incoming-call` within 500ms, skip initiation.
//     const initiateTimer = setTimeout(initiateCall, 500);

//     // ✅ If we receive incoming-call during grace period, cancel auto-initiate
//     socket.once("incoming-call", () => {
//       clearTimeout(initiateTimer);
//     });

//     // ─── Cleanup ────────────────────────────────────────────────────────────
//     return () => {
//       clearTimeout(initiateTimer);

//       socket.off("incoming-call");
//       socket.off("call-accepted");
//       socket.off("call-rejected");
//       socket.off("webrtc-offer");
//       socket.off("webrtc-answer");
//       socket.off("webrtc-ice-candidate");
//       socket.off("remote-video-toggle");
//       socket.off("remote-audio-toggle");
//       socket.off("call-ended");
//       socket.off("call-failed");

//       if (localStreamRef.current) {
//         localStreamRef.current.getTracks().forEach((track) => track.stop());
//       }
//       if (peerConnectionRef.current) {
//         peerConnectionRef.current.close();
//       }
//       if (callTimerRef.current) {
//         clearInterval(callTimerRef.current);
//       }
//     };
//   }, []);

//   // ─── Render ───────────────────────────────────────────────────────────────
//   return (
//     <div className="h-screen w-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col items-center justify-center relative overflow-hidden">
//       {/* Background Animation */}
//       <div className="absolute inset-0 opacity-30">
//         <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
//         <div className="absolute bottom-20 right-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
//       </div>

//       {/* ✅ Hidden audio element for remote audio in audio calls */}
//       <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />

//       {/* Video Container */}
//       <div className="relative w-full h-full max-w-7xl mx-auto p-4 flex flex-col">
//         {/* Remote Video (Full Screen) */}
//         <div className="flex-1 relative bg-gray-800 rounded-2xl overflow-hidden shadow-2xl">
//           {callType === "video" ? (
//             <>
//               <video
//                 ref={remoteVideoRef}
//                 autoPlay
//                 playsInline
//                 className={`w-full h-full object-cover ${!remoteVideoEnabled ? "hidden" : ""}`}
//               />
//               {!remoteVideoEnabled && (
//                 <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
//                   <div className="text-center">
//                     <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white text-5xl font-bold mb-4 mx-auto">
//                       {targetUserInfo?.firstName?.[0]?.toUpperCase() || "?"}
//                     </div>
//                     <p className="text-gray-400">Video is off</p>
//                   </div>
//                 </div>
//               )}
//             </>
//           ) : (
//             // Audio call UI
//             <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
//               <div className="text-center">
//                 <div className="w-40 h-40 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white text-6xl font-bold mb-6 mx-auto shadow-2xl">
//                   {targetUserInfo?.firstName?.[0]?.toUpperCase() || "?"}
//                 </div>
//                 <h2 className="text-white text-2xl font-semibold mb-2">
//                   {targetUserInfo?.firstName || "User"}
//                 </h2>
//                 <p className="text-gray-400">
//                   {callStatus === "connected"
//                     ? formatDuration(callDuration)
//                     : callStatus}
//                 </p>
//               </div>
//             </div>
//           )}

//           {/* Local Video (Picture-in-Picture) — only when connected */}
//           {callType === "video" && callStatus === "connected" && (
//             <div className="absolute top-4 right-4 w-48 h-36 bg-gray-900 rounded-xl overflow-hidden shadow-2xl border-2 border-gray-700">
//               {!isVideoOff ? (
//                 <video
//                   ref={localVideoRef}
//                   autoPlay
//                   playsInline
//                   muted
//                   className="w-full h-full object-cover scale-x-[-1]"
//                 />
//               ) : (
//                 <div className="w-full h-full flex items-center justify-center bg-gray-800">
//                   <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
//                     {user?.firstName?.[0]?.toUpperCase() || "?"}
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* ✅ Local video preview while ringing/connecting (caller sees themselves) */}
//           {callType === "video" && callStatus !== "connected" && localStreamRef.current && (
//             <div className="absolute top-4 right-4 w-48 h-36 bg-gray-900 rounded-xl overflow-hidden shadow-2xl border-2 border-gray-700">
//               <video
//                 ref={localVideoRef}
//                 autoPlay
//                 playsInline
//                 muted
//                 className="w-full h-full object-cover scale-x-[-1]"
//               />
//             </div>
//           )}

//           {/* Audio call hidden local video */}
//           {callType === "audio" && (
//             <video ref={localVideoRef} autoPlay playsInline muted className="hidden" />
//           )}

//           {/* Call Status Overlay */}
//           {callStatus !== "connected" && (
//             <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
//               <div className="text-center">
//                 <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white text-5xl font-bold mb-6 mx-auto animate-pulse shadow-2xl">
//                   {targetUserInfo?.firstName?.[0]?.toUpperCase() || "?"}
//                 </div>
//                 <h2 className="text-white text-3xl font-bold mb-2">
//                   {targetUserInfo?.firstName || "User"}
//                 </h2>
//                 <p className="text-gray-300 text-lg capitalize mb-6">
//                   {callStatus === "ringing" && incomingCall
//                     ? `Incoming ${incomingCall.callType} call...`
//                     : callStatus === "ringing"
//                     ? "Calling..."
//                     : callStatus === "connecting"
//                     ? "Connecting..."
//                     : callStatus === "ended"
//                     ? "Call Ended"
//                     : "Initiating..."}
//                 </p>

//                 {/* Ringing animation (outgoing) */}
//                 {callStatus === "ringing" && !incomingCall && (
//                   <div className="flex justify-center gap-2 mb-6">
//                     <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
//                     <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:0.1s]"></div>
//                     <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
//                   </div>
//                 )}

//                 {/* Accept / Reject buttons (incoming call) */}
//                 {callStatus === "ringing" && incomingCall && (
//                   <div className="flex gap-6 justify-center">
//                     <button
//                       onClick={rejectCall}
//                       className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg transform hover:scale-110 transition-all"
//                     >
//                       <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                       </svg>
//                     </button>
//                     <button
//                       onClick={acceptCall}
//                       className="w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white shadow-lg transform hover:scale-110 transition-all animate-pulse"
//                     >
//                       <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
//                       </svg>
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Controls (only when connected) */}
//         {callStatus === "connected" && (
//           <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-gray-800/90 backdrop-blur-lg px-8 py-4 rounded-full shadow-2xl border border-gray-700">
//             {/* Call Duration */}
//             <div className="text-white font-mono text-lg px-4">
//               {formatDuration(callDuration)}
//             </div>
//             <div className="w-px h-10 bg-gray-600"></div>

//             {/* Mute */}
//             <button
//               onClick={toggleMute}
//               className={`w-14 h-14 rounded-full flex items-center justify-center transition-all transform hover:scale-110 ${
//                 isMuted ? "bg-red-500 hover:bg-red-600" : "bg-gray-700 hover:bg-gray-600"
//               }`}
//             >
//               {isMuted ? (
//                 <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
//                 </svg>
//               ) : (
//                 <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
//                 </svg>
//               )}
//             </button>

//             {/* Video Toggle */}
//             {callType === "video" && (
//               <button
//                 onClick={toggleVideo}
//                 className={`w-14 h-14 rounded-full flex items-center justify-center transition-all transform hover:scale-110 ${
//                   isVideoOff ? "bg-red-500 hover:bg-red-600" : "bg-gray-700 hover:bg-gray-600"
//                 }`}
//               >
//                 {isVideoOff ? (
//                   <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
//                   </svg>
//                 ) : (
//                   <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
//                   </svg>
//                 )}
//               </button>
//             )}

//             {/* End Call */}
//             <button
//               onClick={endCall}
//               className="w-14 h-14 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all transform hover:scale-110 shadow-lg"
//             >
//               <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
//               </svg>
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CallPage;

// claude one
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { socketConnection } from "../config/socket";
import { useSelector } from "react-redux";
import crypto from "crypto-js";

const CallPage = () => {
  const { userId, targetUserId } = useParams();
  const navigate = useNavigate();
  const socket = socketConnection;
  const user = useSelector((store) => store.user);

  // State
  const [callStatus, setCallStatus] = useState("initiating");
  const [callType, setCallType] = useState("video");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [remoteVideoEnabled, setRemoteVideoEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [targetUserInfo, setTargetUserInfo] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);

  // Refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null); // ✅ Separate ref for audio element
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const callTimerRef = useRef(null);
  const roomIdRef = useRef(null);
  const isCallerRef = useRef(false); // ✅ Track if this user initiated the call
  const pendingCandidatesRef = useRef([]); // ✅ Queue ICE candidates until remote desc is set

  // WebRTC Configuration
  const iceServers = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
    ],
  };

  // Generate room ID (must match server logic)
  const getSecretRoomId = (userId1, userId2) => {
    const ids = [userId1, userId2].sort().join("_");
    return crypto.SHA256(ids).toString(crypto.enc.Hex);
  };

  // Initialize local media stream
  const initializeLocalStream = async (isVideoCall = true) => {
    // ✅ Don't re-initialize if already have a stream
    if (localStreamRef.current) {
      return localStreamRef.current;
    }

    try {
      const constraints = {
        audio: true,
        video: isVideoCall
          ? { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } }
          : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      console.log("Local stream initialized:", stream);
      return stream;
    } catch (error) {
      console.error("Error accessing media devices:", error);
      alert("Could not access camera/microphone. Please check permissions.");
      navigate(-1);
      throw error;
    }
  };

  // Create peer connection
  const createPeerConnection = () => {
    // ✅ Close existing connection before creating a new one
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    const peerConnection = new RTCPeerConnection(iceServers);
    peerConnectionRef.current = peerConnection;

    // Add local stream tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStreamRef.current);
      });
    }

    // Handle incoming remote tracks
    peerConnection.ontrack = (event) => {
      console.log("Received remote track:", event.track.kind);
      const [remoteStream] = event.streams;

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
      // ✅ Also attach to audio element for audio-only calls
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = remoteStream;
      }
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("Sending ICE candidate");
        socket.emit("webrtc-ice-candidate", {
          roomId: roomIdRef.current,
          candidate: event.candidate,
        });
      }
    };

    // Connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log("Connection state:", peerConnection.connectionState);

      if (peerConnection.connectionState === "connected") {
        setCallStatus("connected");
        startCallTimer();
      } else if (
        ["disconnected", "failed", "closed"].includes(peerConnection.connectionState)
      ) {
        endCall();
      }
    };

    return peerConnection;
  };

  // ✅ Flush queued ICE candidates after remote description is set
  const flushPendingCandidates = async () => {
    if (!peerConnectionRef.current) return;
    while (pendingCandidatesRef.current.length > 0) {
      const candidate = pendingCandidatesRef.current.shift();
      try {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        console.log("Flushed queued ICE candidate");
      } catch (err) {
        console.error("Error flushing ICE candidate:", err);
      }
    }
  };

  // Start call timer
  const startCallTimer = () => {
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    callTimerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  };

  // Format call duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Create and send WebRTC offer (caller side)
  const createOffer = async () => {
    try {
      const pc = peerConnectionRef.current;
      if (!pc) {
        console.error("No peer connection to create offer");
        return;
      }

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("webrtc-offer", {
        roomId: roomIdRef.current,
        offer,
      });

      console.log("Offer created and sent");
    } catch (err) {
      console.error("Error creating offer:", err);
    }
  };

  // Handle incoming offer (receiver side)
  const handleOffer = async (offer) => {
    try {
      // ✅ Create peer connection fresh for receiver (stream already initialized in acceptCall)
      const peerConnection = createPeerConnection();

      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

      // ✅ Flush any ICE candidates that arrived before the offer
      await flushPendingCandidates();

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      socket.emit("webrtc-answer", {
        roomId: roomIdRef.current,
        answer,
      });

      console.log("Answer created and sent");
    } catch (error) {
      console.error("Error handling offer:", error);
    }
  };

  // Handle incoming answer (caller side)
  const handleAnswer = async (answer) => {
    try {
      const pc = peerConnectionRef.current;
      if (!pc) return;

      if (pc.signalingState === "have-local-offer") {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        // ✅ Flush queued ICE candidates after setting remote description
        await flushPendingCandidates();
        console.log("Answer received and remote description set");
      } else {
        console.warn("Unexpected signaling state for answer:", pc.signalingState);
      }
    } catch (error) {
      console.error("Error handling answer:", error);
    }
  };

  // Handle ICE candidate
  const handleIceCandidate = async (candidate) => {
    try {
      const pc = peerConnectionRef.current;

      // ✅ Queue candidates if remote description not yet set
      if (!pc || !pc.remoteDescription) {
        console.log("Queuing ICE candidate (no remote description yet)");
        pendingCandidatesRef.current.push(candidate);
        return;
      }

      await pc.addIceCandidate(new RTCIceCandidate(candidate));
      console.log("ICE candidate added");
    } catch (error) {
      console.error("Error adding ICE candidate:", error);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        // ✅ Include senderId so receiver can ignore their own reflected events
        socket.emit("toggle-audio", {
          roomId: roomIdRef.current,
          audioEnabled: audioTrack.enabled,
          senderId: userId,
        });
      }
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
        // ✅ Include senderId so the receiver can distinguish their own toggles from remote ones
        socket.emit("toggle-video", {
          roomId: roomIdRef.current,
          videoEnabled: videoTrack.enabled,
          senderId: userId,
        });
      }
    }
  };

  // End call
  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }

    if (roomIdRef.current) {
      socket.emit("end-call", { roomId: roomIdRef.current });
    }

    setCallStatus("ended");

    setTimeout(() => {
      navigate(-1);
    }, 2000);
  };

  // Accept incoming call (receiver)
  const acceptCall = async () => {
    setCallStatus("connecting");

    // ✅ Initialize stream FIRST before emitting accept
    await initializeLocalStream(incomingCall?.callType === "video");

    socket.emit("accept-call", {
      roomId: roomIdRef.current,
      userId: userId,
    });
  };

  // Reject incoming call
  const rejectCall = () => {
    socket.emit("reject-call", {
      roomId: roomIdRef.current,
      userId: userId,
    });
    navigate(-1);
  };

  useEffect(() => {
    if (!userId || !targetUserId) {
      navigate("/connections");
      return;
    }

    const roomId = getSecretRoomId(userId, targetUserId);
    roomIdRef.current = roomId;

    // Join the call signaling room
    socket.emit("join-call-room", { userId, targetUserId });

    // ─── Socket Listeners ───────────────────────────────────────────────────

    // ✅ Someone is calling us
    socket.on("incoming-call", (data) => {
      console.log("Incoming call:", data);
      // ✅ Use the roomId from the server (not recalculated) to stay consistent
      roomIdRef.current = data.roomId;
      setIncomingCall(data);
      setCallType(data.callType);
      setCallStatus("ringing");
      isCallerRef.current = false;
    });

    // ✅ Receiver accepted — caller now creates the offer
    socket.on("call-accepted", async (data) => {
      console.log("Call accepted, creating offer...");
      setCallStatus("connecting");
      setCallType(data.callType);

      // ✅ Create peer connection with the already-initialized local stream
      createPeerConnection();

      // ✅ Small delay ensures receiver's peer connection is ready
      await new Promise((r) => setTimeout(r, 300));
      await createOffer();
    });

    socket.on("call-rejected", () => {
      console.log("Call rejected");
      alert("Call was rejected");
      navigate(-1);
    });

    // ✅ Receiver gets the offer → creates answer
    socket.on("webrtc-offer", async (data) => {
      console.log("Received WebRTC offer");
      await handleOffer(data.offer);
    });

    // ✅ Caller gets the answer
    socket.on("webrtc-answer", async (data) => {
      console.log("Received WebRTC answer");
      await handleAnswer(data.answer);
    });

    socket.on("webrtc-ice-candidate", async (data) => {
      await handleIceCandidate(data.candidate);
    });

    socket.on("remote-video-toggle", (data) => {
      // ✅ Ignore our own toggle event echoed back from the room
      if (data.senderId === userId) return;
      setRemoteVideoEnabled(data.videoEnabled);
    });

    socket.on("remote-audio-toggle", (data) => {
      // ✅ Ignore our own toggle event echoed back from the room
      if (data.senderId === userId) return;
      console.log("Remote audio toggled:", data.audioEnabled);
    });

    socket.on("call-ended", () => {
      console.log("Call ended by remote user");
      endCall();
    });

    socket.on("call-failed", (data) => {
      alert(data.reason);
      navigate(-1);
    });

    // ─── Auto-initiate if we are the caller ────────────────────────────────
    const initiateCall = async () => {
      try {
        isCallerRef.current = true;

        const isVideoCall = true; // ✅ Derive from route/props as needed
        setCallType(isVideoCall ? "video" : "audio");

        // ✅ Initialize stream ONCE here for the caller
        await initializeLocalStream(isVideoCall);

        socket.emit("initiate-call", {
          callerId: userId,
          receiverId: targetUserId,
          callType: isVideoCall ? "video" : "audio",
        });

        setCallStatus("ringing");
      } catch (error) {
        console.error("Error initiating call:", error);
      }
    };

    // ✅ Only auto-initiate if we are NOT the receiver of an incoming call.
    // The CallPage is opened for the receiver via a notification/redirect;
    // we detect the caller by checking URL params set by the chat page.
    // A simple heuristic: if the page is loaded with a `caller=true` search param
    // or by convention (chat initiates with userId=self, targetUserId=other).
    // Here we use the straightforward approach: always initiate unless
    // the server sends us an `incoming-call` event (receiver path).
    // We add a short grace window — if we get `incoming-call` within 500ms, skip initiation.
    const initiateTimer = setTimeout(initiateCall, 500);

    // ✅ If we receive incoming-call during grace period, cancel auto-initiate
    socket.once("incoming-call", () => {
      clearTimeout(initiateTimer);
    });

    // ─── Cleanup ────────────────────────────────────────────────────────────
    return () => {
      clearTimeout(initiateTimer);

      socket.off("incoming-call");
      socket.off("call-accepted");
      socket.off("call-rejected");
      socket.off("webrtc-offer");
      socket.off("webrtc-answer");
      socket.off("webrtc-ice-candidate");
      socket.off("remote-video-toggle");
      socket.off("remote-audio-toggle");
      socket.off("call-ended");
      socket.off("call-failed");

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, []);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
      </div>

      {/* ✅ Hidden audio element for remote audio in audio calls */}
      <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />

      {/* Video Container */}
      <div className="relative w-full h-full max-w-7xl mx-auto p-4 flex flex-col">
        {/* Remote Video (Full Screen) */}
        <div className="flex-1 relative bg-gray-800 rounded-2xl overflow-hidden shadow-2xl">
          {callType === "video" ? (
            <>
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className={`w-full h-full object-cover ${!remoteVideoEnabled ? "hidden" : ""}`}
              />
              {!remoteVideoEnabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <div className="text-center">
                    <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white text-5xl font-bold mb-4 mx-auto">
                      {targetUserInfo?.firstName?.[0]?.toUpperCase() || "?"}
                    </div>
                    <p className="text-gray-400">Video is off</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            // Audio call UI
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              <div className="text-center">
                <div className="w-40 h-40 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white text-6xl font-bold mb-6 mx-auto shadow-2xl">
                  {targetUserInfo?.firstName?.[0]?.toUpperCase() || "?"}
                </div>
                <h2 className="text-white text-2xl font-semibold mb-2">
                  {targetUserInfo?.firstName || "User"}
                </h2>
                <p className="text-gray-400">
                  {callStatus === "connected"
                    ? formatDuration(callDuration)
                    : callStatus}
                </p>
              </div>
            </div>
          )}

          {/* ✅ Single persistent local video element — always in DOM, visibility controlled via CSS.
               This prevents the ref from being lost when callStatus changes. */}
          <div
            className={`absolute top-4 right-4 w-48 h-36 bg-gray-900 rounded-xl overflow-hidden shadow-2xl border-2 border-gray-700 ${
              callType !== "video" ? "hidden" : ""
            }`}
          >
            {/* Video element always rendered so ref stays attached */}
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover scale-x-[-1] ${isVideoOff ? "hidden" : ""}`}
            />
            {/* Avatar overlay when video is off */}
            {isVideoOff && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user?.firstName?.[0]?.toUpperCase() || "?"}
                </div>
              </div>
            )}
          </div>

          {/* Call Status Overlay */}
          {callStatus !== "connected" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white text-5xl font-bold mb-6 mx-auto animate-pulse shadow-2xl">
                  {targetUserInfo?.firstName?.[0]?.toUpperCase() || "?"}
                </div>
                <h2 className="text-white text-3xl font-bold mb-2">
                  {targetUserInfo?.firstName || "User"}
                </h2>
                <p className="text-gray-300 text-lg capitalize mb-6">
                  {callStatus === "ringing" && incomingCall
                    ? `Incoming ${incomingCall.callType} call...`
                    : callStatus === "ringing"
                    ? "Calling..."
                    : callStatus === "connecting"
                    ? "Connecting..."
                    : callStatus === "ended"
                    ? "Call Ended"
                    : "Initiating..."}
                </p>

                {/* Ringing animation (outgoing) */}
                {callStatus === "ringing" && !incomingCall && (
                  <div className="flex justify-center gap-2 mb-6">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  </div>
                )}

                {/* Accept / Reject buttons (incoming call) */}
                {callStatus === "ringing" && incomingCall && (
                  <div className="flex gap-6 justify-center">
                    <button
                      onClick={rejectCall}
                      className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg transform hover:scale-110 transition-all"
                    >
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <button
                      onClick={acceptCall}
                      className="w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white shadow-lg transform hover:scale-110 transition-all animate-pulse"
                    >
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Controls (only when connected) */}
        {callStatus === "connected" && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-gray-800/90 backdrop-blur-lg px-8 py-4 rounded-full shadow-2xl border border-gray-700">
            {/* Call Duration */}
            <div className="text-white font-mono text-lg px-4">
              {formatDuration(callDuration)}
            </div>
            <div className="w-px h-10 bg-gray-600"></div>

            {/* Mute */}
            <button
              onClick={toggleMute}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all transform hover:scale-110 ${
                isMuted ? "bg-red-500 hover:bg-red-600" : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              {isMuted ? (
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ) : (
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
            </button>

            {/* Video Toggle */}
            {callType === "video" && (
              <button
                onClick={toggleVideo}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all transform hover:scale-110 ${
                  isVideoOff ? "bg-red-500 hover:bg-red-600" : "bg-gray-700 hover:bg-gray-600"
                }`}
              >
                {isVideoOff ? (
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            )}

            {/* End Call */}
            <button
              onClick={endCall}
              className="w-14 h-14 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all transform hover:scale-110 shadow-lg"
            >
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallPage;