import { useEffect, useState, useRef } from 'react'
import Navbar from "../navbar";
import TitleBox from "../titleBox";
import Report from "./report";
// import Info from './info';
import Complete from './complete';
import Chat from './chat';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleExclamation, faArrowLeft, faRightToBracket } from '@fortawesome/free-solid-svg-icons'
import { startRecord, removeRecord, onRmsChange, stopRecord, initRecord } from "../sounder";
import Modal from '../../../components/Modal';
import { userTestResult, userChatWithOllama, userSTT } from '../../../api';
import { useUserData } from '../context/DataContext';
import CountdownTimer from '../../../components/countdownTimer';
import { Btn } from '../../../components/OSCE-unit';
import { useAuth } from "../../../context/AuthContext";
import { useWebRTC } from "../context/WebRTCContext";

let isUploading = false;

export default () => {
    const [stater, setStater] = useState<"info" | "report" | "complete">("info");
    const { userData, setUserData } = useUserData();
    const [showModal, setShowModal] = useState(false);
    const [sounderState, setSounderState] = useState<string>("");

    const [rms, setRms] = useState<number>(0);
    const [message, setMessage] = useState<string>("");
    const [testResult, setTestResult] = useState<any>({ check_data: [] });
    const { token } = useAuth();
    const [chatMessages, setChatMessages] = useState<any[]>([]);
    const [isChatting, setIsChatting] = useState<boolean>(false);
    // WebRTC 邏輯
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const { remoteStream, status: webRTCStatus } = useWebRTC();

    const handleUnlockAudio = async () => {
        const audio = audioRef.current;
        if (!audio || !remoteStream) return;

        try {
            audio.muted = false;
            audio.volume = 1.0;
            await audio.play();
            console.log("🔊 成功透過按鈕解鎖聲音！音軌數:", remoteStream.getAudioTracks().length);
        } catch (err) {
            console.error("❌ 解鎖聲音失敗:", err);
        }
    };

    // useEffect(() => {
    //     const videoElement = videoRef.current;
    //     if (!videoElement || !remoteStream) return;

    //     console.log("--- 偵測到遠端串流，準備掛載 ---", remoteStream.id);

    //     const handlePlay = async () => {
    //         // 1. 基礎屬性設定
    //         videoElement.setAttribute('autoplay', 'true');
    //         videoElement.setAttribute('playsinline', 'true');

    //         // 2. 避免重複賦值 srcObject
    //         if (remoteStream && videoElement.srcObject !== remoteStream) {
    //             videoElement.srcObject = remoteStream;
    //         }

    //         try {
    //             // 嘗試直接有聲播放
    //             videoElement.muted = false;
    //             await videoElement.play();
    //             console.log("✅ 影片有聲播放成功");
    //         } catch (err: any) {
    //             if (err.name === 'NotAllowedError') {
    //                 console.warn("⚠️ 自動播放遭攔截（無互動），嘗試【靜音】播放...");

    //                 // 修正：必須設為 true 才能繞過瀏覽器攔截
    //                 videoElement.muted = true;

    //                 try {
    //                     await videoElement.play();
    //                     console.log("✅ 影片靜音播放成功（請引導使用者取消靜音）");
    //                 } catch (retryErr) {
    //                     console.error("❌ 靜音播放依然失敗", retryErr);
    //                 }
    //             } else if (err.name === 'AbortError') {
    //                 // 這個錯誤通常可以忽略，或是稍後再試
    //                 console.log("ℹ️ 播放被中斷（可能是重複呼叫），忽略此錯誤");
    //             } else {
    //                 console.error("❌ 播放發生非預期錯誤", err);
    //             }
    //         }
    //     };

    //     // 事件監聽：當瀏覽器拿到元數據時
    //     videoElement.onloadedmetadata = () => {
    //         console.log("🎬 元數據載入，準備播放");
    //         handlePlay();
    //     };

    //     // 事件監聽：當緩衝足夠播放時
    //     videoElement.oncanplay = () => {
    //         handlePlay();
    //     };

    //     // 如果遠端流動態增加了軌道 (Track)
    //     remoteStream.onaddtrack = () => {
    //         console.log("🎥 偵測到新軌道加入，重新執行播放邏輯");
    //         handlePlay();
    //     };

    //     // 立即執行一次初始化
    //     handlePlay();

    //     // [暴力檢查] 在封閉環境下，每 2 秒檢查一次影片是否卡住
    //     const healthCheck = setInterval(() => {
    //         if (remoteStream.active && videoElement.paused && videoElement.readyState >= 2) {
    //             console.log("🛠️ 偵測到影片暫停但流仍活動，嘗試強制恢復...");
    //             videoElement.play().catch(() => { });
    //         }
    //     }, 2000);

    //     return () => {
    //         clearInterval(healthCheck);
    //         if (videoElement) {
    //             videoElement.onloadedmetadata = null;
    //             videoElement.oncanplay = null;
    //             videoElement.srcObject = null;
    //         }
    //     };
    // }, [remoteStream]);

    useEffect(() => {
        const videoElement = videoRef.current;
        const audioElement = audioRef.current;
        if (!videoElement || !audioElement || !remoteStream) return;

        console.log("--- 執行影音分離掛載 ---", remoteStream.id);

        // 1. 處理影像標籤 (永遠靜音，確保畫面不卡住)
        videoElement.muted = true;
        if (videoElement.srcObject !== remoteStream) {
            videoElement.srcObject = remoteStream;
        }
        videoElement.play().catch(() => console.log("影片啟動中..."));

        // 2. 處理音訊標籤
        if (audioElement.srcObject !== remoteStream) {
            audioElement.srcObject = remoteStream;
        }

        // 3. 定義解鎖函式
        const unlockAudio = () => {
            audioElement.muted = false;
            audioElement.play()
                .then(() => console.log("🎵 音訊解鎖播放成功"))
                .catch(err => console.warn("🎵 音訊尚待互動:", err));
        };

        // 只要有任何點擊就解鎖
        window.addEventListener('click', unlockAudio, { once: true });

        const healthCheck = setInterval(() => {
            if (remoteStream.active && videoElement.paused) videoElement.play().catch(() => { });
            if (remoteStream.active && audioElement.paused) audioElement.play().catch(() => { });
        }, 2000);

        return () => {
            clearInterval(healthCheck);
            window.removeEventListener('click', unlockAudio);
        };
    }, [remoteStream]);

    /**
     * 2. 錄音與信令事件初始化 (保持原樣)
     */
    useEffect(() => {
        const setupRecording = async () => {
            try {
                if (typeof initRecord === 'function') {
                    await initRecord();
                }
            } catch (err) {
                console.error("錄音初始化失敗:", err);
            }
        };

        setupRecording();
        onRmsChange(setRms);
        const stateHandler = (event: any) => setSounderState(event.detail.state);

        const uploadHandler = async (event: any) => {
            if (isUploading) return;
            isUploading = true;
            try {
                const audioChunks = [];
                audioChunks.push(event.detail.blob);

                // Create the Blob correctly (as you already are)
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

                // 1. Initialize FormData
                const formData = new FormData();

                // 2. Append the blob with the key the backend expects
                // Adding 'speech.webm' helps the backend identify it as a file
                formData.append('audio_file', audioBlob, 'speech.webm');
                for (let [key, value] of formData.entries()) {
                    console.log(`${key}:`, value);
                }

                // 3. Pass the formData to your function
                const res = await userSTT({
                    token: token,
                    data: formData // Send the FormData object, not a plain { audio_file: ... } object
                });
                const parsedRes = typeof res === 'string' ? JSON.parse(res) : res;
                setChatMessages((prev) => [...prev, { sender: 'doctor', content: parsedRes.data.text }]);
                const res2 = await userChatWithOllama({
                    token: token,
                    data: {
                        patient_id: userData?.tid,
                        message: parsedRes.text,
                        system_content: "你是一位生了重病的病患,請依照發燒的症狀闡述自己的狀況"
                    }
                });
                const parsedRes2 = typeof res2 === 'string' ? JSON.parse(res2) : res2;
                console.log(parsedRes2);
                setChatMessages((prev) => [...prev, { sender: 'patient', content: parsedRes2.data.text }]);
                setIsChatting(false);
            } catch (err) {
                console.error("上傳過程出錯:", err);
            } finally {
                isUploading = false;
            }
        };

        document.addEventListener('SOUNDER_STATE', stateHandler);
        document.addEventListener('SOUNDER_UPLOAD', uploadHandler);

        return () => {
            document.removeEventListener('SOUNDER_STATE', stateHandler);
            document.removeEventListener('SOUNDER_UPLOAD', uploadHandler);
            removeRecord();
            stopRecord();
        };
    }, [token, userData?.tid]);

    const saveTestResult = (testResult: any) => {
        userTestResult("create", { token: token, data: testResult }).then(console.log);
    };

    const isRecordingActive = ["音量偵測啟動中...", "音量超過門檻，開始錄音", "正在錄音中..."].includes(sounderState);

    return (
        <div className="bg-osce-gray-1 font-[700] pb-5 min-h-screen flex flex-col">
            <Navbar
                title="第01站-病史詢問與病情說明"
                rightContent={
                    <button className="bg-white rounded-2xl text-osce-red-5 font-[500] px-4 py-1 hover:bg-osce-red-1 transition-colors" onClick={() => setShowModal(true)}>
                        <FontAwesomeIcon icon={faCircleExclamation} className='px-1' />
                        <span>放棄測試</span>
                    </button>
                }
            />

            <TitleBox
                leftContent={
                    <>
                        <h6 className="text-osce-blue-4 mb-2">第01站</h6>
                        <h2 className="text-[30px]">{userData?.tests?.topic || "測驗載入中..."}</h2>
                    </>
                }
                rightContent={
                    stater !== "complete" && (
                        <>
                            <h6 className="text-gray-400 mb-2">剩餘時間</h6>
                            <CountdownTimer
                                initialSeconds={parseInt(userData?.tests?.timer_number ?? '0') * 60}
                                onEnd={() => {
                                    setMessage("謝謝醫生，測驗時間已到。");
                                    setStater("complete");
                                    removeRecord();
                                }}
                            />
                        </>
                    )
                }
            />

            <hr className="border-osce-gray-2 max-w-[1400px] mx-auto w-full" />

            {/* 控制區分頁按鈕 */}
            <div className="flex w-full max-w-[1400px] mx-auto h-[80px] py-[20px] justify-between items-center px-[20px]">
                <div className="flex gap-2">
                    <button
                        className={`min-w-[130px] font-[500] rounded-2xl border border-osce-blue-5 py-1 transition-all ${stater === 'info' ? 'bg-osce-blue-5 text-white' : 'bg-transparent text-osce-blue-5'}`}
                        onClick={() => setStater("info")}
                    >
                        病史資料
                    </button>
                    <button
                        className={`min-w-[130px] font-[500] rounded-2xl border border-osce-blue-5 py-1 transition-all ${stater === 'report' ? 'bg-osce-blue-5 text-white' : 'bg-transparent text-osce-blue-5'}`}
                        onClick={() => setStater("report")}
                    >
                        檢查資料
                    </button>
                </div>
                <div>
                    {stater === "complete" ? (
                        <button className="min-w-[130px] rounded-2xl bg-osce-blue-5 text-white py-1 shadow-md" onClick={() => setUserData({ ...userData, page: "menu" })}>離開測驗</button>
                    ) : (
                        <button className="min-w-[130px] rounded-2xl bg-osce-blue-5 text-white font-[500] py-1 shadow-md hover:bg-osce-blue-6" onClick={() => {
                            setStater("complete");
                            removeRecord();
                            saveTestResult(testResult);
                        }}>完成測驗</button>
                    )}
                </div>
            </div>

            <div className="flex w-full max-w-[1400px] mx-auto px-[20px] flex-grow gap-0 overflow-hidden" style={{ minHeight: '600px' }}>
                <div className="relative rounded-tl-[20px] rounded-bl-[20px] overflow-hidden w-1/2 bg-black flex items-center justify-center border-r border-osce-gray-2">
                    <video
                        id="vhuman"
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                        style={{ backgroundColor: 'black' }}
                    />
                    <audio ref={audioRef} autoPlay />
                    <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[12px] z-10 flex items-center gap-2 ${webRTCStatus === 'connected' ? 'bg-green-500/80' : 'bg-yellow-500/80'} text-white`}>
                        <div className={`w-2 h-2 rounded-full animate-pulse ${webRTCStatus === 'connected' ? 'bg-green-200' : 'bg-yellow-200'}`}></div>
                        {webRTCStatus || "initializing..."}
                    </div>

                    {message && (
                        <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 bg-osce-blue-4/90 text-white p-5 rounded-[20px] max-w-[85%] z-10 text-center shadow-2xl border border-white/30 backdrop-blur-md">
                            <p className="text-[18px] leading-relaxed">{message}</p>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-tr-[20px] rounded-br-[20px] overflow-hidden flex flex-col w-1/2 shadow-2xl">
                    <div className="flex-1 overflow-y-auto">
                        {stater === "info" && <div className="p-[40px]">
                            <Chat
                                messages={chatMessages}
                                isRecording={isChatting}
                            />
                        </div>}
                        {stater === "report" && (
                            <div className="p-[40px]">
                                <Report
                                    check_data={userData?.tests?.check_data}
                                    onChange={(newCheckData) => setTestResult({ check_data: newCheckData })}
                                />
                            </div>
                        )}
                        {stater === "complete" && <div className="p-[20px]"><Complete /></div>}
                    </div>

                    <div className="bg-osce-blue-1 flex p-6 w-full items-center gap-4 border-t border-osce-gray-2">
                        <div className="bg-white flex-1 h-[50px] rounded-[25px] flex items-center px-6 shadow-inner">
                            <div className='w-[50px] font-mono text-osce-blue-5 text-lg font-bold'>
                                {Math.floor(rms * 1000)}
                            </div>
                            <div className="flex-1 h-[10px] bg-gray-100 relative mx-4 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-osce-blue-5 transition-all duration-75"
                                    style={{ width: `${Math.min(rms * 1000, 100)}%` }}
                                />
                            </div>
                            <span className='text-[12px] text-osce-blue-5 font-bold uppercase'>{sounderState || "IDLE"}</span>
                        </div>
                        <button
                            className={`px-8 py-3 rounded-2xl transition-all shadow-lg font-bold ${isRecordingActive ? 'bg-osce-red-5 hover:bg-osce-red-6' : 'bg-osce-blue-5 hover:bg-osce-blue-6'} text-white`}
                            onClick={() => {
                                if (isRecordingActive) {
                                    stopRecord();
                                } else {
                                    setIsChatting(true);
                                    startRecord();
                                    handleUnlockAudio();
                                }
                            }}
                        >
                            {isRecordingActive ? "結束錄音" : "開始錄音"}
                        </button>
                    </div>
                </div>
            </div>

            <Modal
                maxWidth={600}
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                bodyContent={
                    <div className='flex flex-col items-center py-6'>
                        <div className="w-16 h-16 bg-osce-red-1 rounded-full flex items-center justify-center mb-4">
                            <FontAwesomeIcon icon={faCircleExclamation} className='text-osce-red-5 text-3xl' />
                        </div>
                        <h1 className='text-[24px] font-bold text-osce-red-5'>確認要放棄測驗嗎？</h1>
                        <p className='text-gray-500 mt-2 text-center text-lg'>放棄後將無法保留目前已記錄的資料。</p>
                    </div>
                }
                footerBtns={
                    <>
                        <Btn color='gray' icon={faArrowLeft} text='返回測驗' click={() => setShowModal(false)} />
                        <Btn color='blue' icon={faRightToBracket} text='確定放棄' click={() => {
                            setShowModal(false);
                            setStater("complete");
                        }} />
                    </>
                }
            />
        </div>
    );
};