// For Reference only
// import React, { useEffect, useRef, useState } from "react";
// import { socketConnection } from "../config/socket";

// const Call = () => {
//     const socket=socketConnection;
//   const [myId, setMyId] = useState(null);
//   const [otherUserId, setOtherUserId] = useState("");
//   const [incomingCall, setIncomingCall] = useState(false);
//   const [caller, setCaller] = useState(null);

//   const localVideoRef = useRef();
//   const remoteVideoRef = useRef();
//   const peerConnection = useRef(null);

//   useEffect(() => {
//     socket.on("connect", () => setMyId(socket.id));

//     socket.on("incoming-call", async ({ from, offer }) => {
//       setIncomingCall(true);
//       setCaller(from);

//       peerConnection.current = createPeerConnection(from);
//       await peerConnection.current.setRemoteDescription(offer);
//     });

//     socket.on("call-answered", async ({ answer }) => {
//       await peerConnection.current.setRemoteDescription(answer);
//     });

//     socket.on("ice-candidate", async (candidate) => {
//       if (peerConnection.current) {
//         await peerConnection.current.addIceCandidate(candidate);
//       }
//     });
//   }, []);

//   const startCall = async () => {
//     peerConnection.current = createPeerConnection(otherUserId);

//     const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//     localVideoRef.current.srcObject = stream;

//     stream.getTracks().forEach((track) => {
//       peerConnection.current.addTrack(track, stream);
//     });

//     const offer = await peerConnection.current.createOffer();
//     await peerConnection.current.setLocalDescription(offer);

//     socket.emit("call-user", {
//       to: otherUserId,
//       offer,
//     });
//   };

//   const acceptCall = async () => {
//     setIncomingCall(false);

//     const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//     localVideoRef.current.srcObject = stream;

//     stream.getTracks().forEach((track) => {
//       peerConnection.current.addTrack(track, stream);
//     });

//     const answer = await peerConnection.current.createAnswer();
//     await peerConnection.current.setLocalDescription(answer);

//     socket.emit("answer-call", {
//       to: caller,
//       answer,
//     });
//   };

//   const createPeerConnection = (remoteUserId) => {
//     const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });

//     pc.onicecandidate = (event) => {
//       if (event.candidate) {
//         socket.emit("ice-candidate", {
//           to: remoteUserId,
//           candidate: event.candidate,
//         });
//       }
//     };

//     pc.ontrack = (event) => {
//       remoteVideoRef.current.srcObject = event.streams[0];
//     };

//     return pc;
//   };

//   return (
//     <div style={{ padding: 20 }}>
//       <h2>My ID: {myId}</h2>

//       <input
//         type="text"
//         placeholder="Enter user ID to call"
//         value={otherUserId}
//         onChange={(e) => setOtherUserId(e.target.value)}
//       />
//       <button onClick={startCall}>Call</button>

//       {incomingCall && (
//         <div>
//           <h3>Incoming Call from: {caller}</h3>
//           <button onClick={acceptCall}>Accept</button>
//         </div>
//       )}

//       <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
//         <video ref={localVideoRef} autoPlay muted style={{ width: 300 }} />
//         <video ref={remoteVideoRef} autoPlay style={{ width: 300 }} />
//       </div>
//     </div>
//   );
// };

// export default Call;