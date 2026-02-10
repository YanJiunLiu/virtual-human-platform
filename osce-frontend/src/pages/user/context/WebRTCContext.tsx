import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { userCreateIdleVideo } from '../../../api';

type WebRTCContextType = {
    connect: (data: { patientId: string; imageBase64: string; duration: number; token: string }) => Promise<void>;
    disconnect: () => void;
    status: string;
    isConnected: boolean;
    remoteStream: MediaStream | null;
};

const WebRTCContext = createContext<WebRTCContextType | undefined>(undefined);

export const WebRTCProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const socketRef = useRef<WebSocket | null>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const [status, setStatus] = useState<string>("");
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

    // 用來暫存尚未 setRemoteDescription 之前就抵達的 Candidate
    const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);

    const connect = async ({ patientId, imageBase64, duration, token }: { patientId: string; imageBase64: string; duration: number; token: string }) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) return;

        try {
            setStatus("狀態：建立閒置影片中...");
            await userCreateIdleVideo({
                token: token,
                data: { patient_id: patientId, image_base64: imageBase64, duration: duration }
            })
        } catch (error) {
            console.error("Failed:", error);
            setStatus("狀態：建立閒置影片失敗");
            return;
        }

        const WS_BASE = import.meta.env.DEV ? import.meta.env.VITE_WS_BASE_DEV : import.meta.env.VITE_WS_BASE_PROD;
        const turnServer = import.meta.env.DEV ? import.meta.env.VITE_TURN_SERVER_DEV : import.meta.env.VITE_TURN_SERVER_PROD;
        const turnUsername = import.meta.env.DEV ? import.meta.env.VITE_TURN_USERNAME_DEV : import.meta.env.VITE_TURN_USERNAME_PROD;
        const turnCredential = import.meta.env.DEV ? import.meta.env.VITE_TURN_CREDENTIAL_DEV : import.meta.env.VITE_TURN_CREDENTIAL_PROD;

        const wsUrl = `${WS_BASE}/ws/webrtc/?patient_id=${patientId}&duration=${duration}`;
        const socket = new WebSocket(wsUrl);
        console.log("wsUrl", wsUrl);
        socketRef.current = socket;
        console.log("turnServer", turnServer);
        console.log("turnUsername", turnUsername);
        console.log("turnCredential", turnCredential);
        const pcConfig: RTCConfiguration = {
            iceServers: [{
                urls: turnServer,
                username: turnUsername,
                credential: turnCredential
            }, {
                urls: "stun:stun.l.google.com:19302"
            }],
            iceTransportPolicy: 'all',
        };

        const pc = new RTCPeerConnection(pcConfig);
        pcRef.current = pc;
        console.log("pc", pc);
        // 1. 本地 Candidate 處理
        pc.onicecandidate = (event) => {
            if (event.candidate && socket.readyState === WebSocket.OPEN) {
                // 過濾 mDNS (.local) 地址，確保發送的是真實 IP
                if (event.candidate.candidate.includes('.local')) {
                    console.warn("忽略 mDNS Candidate，等待真實 IP...");
                    return;
                }
                console.log("發送本地 Candidate (typ relay):", event.candidate.candidate);
                socket.send(JSON.stringify({
                    type: "candidate",
                    candidate: event.candidate
                }));
            }
        };

        // 2. 遠端 Track 監聽
        pc.ontrack = (event) => {
            console.log("✅ 收到遠端軌道，Stream ID:", event.streams[0].id);
            // 確保拿到的是包含影片的 Stream
            if (event.streams && event.streams[0]) {
                setRemoteStream(event.streams[0]);
            }
        };

        pc.oniceconnectionstatechange = () => {
            console.log("ICE 連線狀態:", pc.iceConnectionState);
            if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
                setStatus("狀態：連線已建立");
            }
            if (pc.iceConnectionState === 'failed') {
                setStatus("狀態：ICE 連線失敗，請檢查防火牆或 CoTURN");
            }
        };

        socket.onopen = async () => {
            setStatus("狀態：信令通道開啟，發送 Offer...");

            // [關鍵] 明確告知需要接收影片，且方向為 recvonly
            pc.addTransceiver('video', { direction: 'recvonly' });
            pc.addTransceiver('audio', { direction: 'recvonly' });

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            socket.send(JSON.stringify({
                type: "offer",
                sdp: pc.localDescription?.sdp
            }));
        };

        socket.onmessage = async (e) => {
            try {
                const data = JSON.parse(e.data);

                if (data.type === "answer") {
                    console.log("收到 Answer，執行 setRemoteDescription");
                    await pc.setRemoteDescription(new RTCSessionDescription(data));

                    // 處理在描述建立前就收到的 Candidate
                    while (pendingCandidates.current.length > 0) {
                        const cand = pendingCandidates.current.shift();
                        if (cand) await pc.addIceCandidate(new RTCIceCandidate(cand));
                    }
                    setIsConnected(true);
                }
                else if (data.type === "candidate") {
                    const candidateData = data.candidate;
                    // 如果描述還沒設好，先存入隊列
                    if (pc.remoteDescription) {
                        await pc.addIceCandidate(new RTCIceCandidate(candidateData));
                        console.log("成功添加遠端 Candidate");
                    } else {
                        pendingCandidates.current.push(candidateData);
                    }
                }
            } catch (err) {
                console.error("WebRTC 信令處理錯誤:", err);
            }
        };

        socket.onclose = () => {
            setIsConnected(false);
            setStatus("狀態：WebSocket 連線斷開");
        };
    };

    const disconnect = () => {
        if (socketRef.current) socketRef.current.close();
        if (pcRef.current) {
            pcRef.current.getSenders().forEach(sender => pcRef.current?.removeTrack(sender));
            pcRef.current.close();
        }
        socketRef.current = null;
        pcRef.current = null;
        pendingCandidates.current = [];
        setIsConnected(false);
        setRemoteStream(null);
        setStatus("狀態：已中斷連線");
    };

    useEffect(() => { return () => disconnect(); }, []);

    return (
        <WebRTCContext.Provider value={{ connect, disconnect, status, isConnected, remoteStream }}>
            {children}
        </WebRTCContext.Provider>
    );
};

export const useWebRTC = () => {
    const context = useContext(WebRTCContext);
    if (!context) throw new Error('useWebRTC must be used within a WebRTCProvider');
    return context;
};