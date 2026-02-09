let audioContext: AudioContext;
let mediaRecorder: MediaRecorder;
let audioChunks: Blob[] = [];
let sourceNode: MediaStreamAudioSourceNode;
let volumeNode: AudioWorkletNode;
let stream: MediaStream;
let isInitialized = false;
let isRecording = false;
let clickToken: string | null = null;
let forceStop = false;
let silenceCountdown: ReturnType<typeof setTimeout> | null = null;

let rmsCallback: ((rms: number) => void) | null = null;

const dispatcher = (state: string) => {
    document.dispatchEvent(new CustomEvent('SOUNDER_STATE', { detail: { state } }));
}

export function onRmsChange(callback: (rms: number) => void): void {
    rmsCallback = callback;
}

export async function initRecord(): Promise<void> {
    try {
        // --- 核心修正處：必須要求 audio: true ---
        stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false
        });

        audioContext = new AudioContext();

        // 確保 AudioContext 在某些瀏覽器中不是 suspended 狀態
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }

        await audioContext.audioWorklet.addModule('volume-processor.js');
        sourceNode = audioContext.createMediaStreamSource(stream);
        volumeNode = new AudioWorkletNode(audioContext, 'volume-processor');

        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = (e: BlobEvent) => {
            if (e.data.size > 0) {
                audioChunks.push(e.data);
            }
        };

        mediaRecorder.onstop = () => {
            if (audioChunks.length > 0) {
                const blob = new Blob(audioChunks, { type: 'audio/webm' });
                audioChunks = [];
                if (!forceStop) {
                    document.dispatchEvent(new CustomEvent('SOUNDER_UPLOAD', { detail: { blob, clickToken } }));
                    clickToken = null;
                }
            }
            forceStop = false;
        };

        isInitialized = true;
        console.log('✅ 錄音系統已初始化');
        dispatcher('錄音系統已初始化');
    } catch (error) {
        console.error('❌ 錄音初始化失敗:', error);
        dispatcher('錄音授權失敗，請檢查麥克風');
        throw error;
    }
}

export function forceRecord(token: string): void {
    if (isRecording) {
        forceStop = true;
        stopRecord();
    }
    clickToken = token;
}

export function startRecord(): void {
    if (!isInitialized) {
        console.error('⚠️ 錯誤：請先呼叫 initRecord()');
        return;
    }

    if (isRecording) return; // 防止重複啟動

    // 1. 重置數據
    audioChunks = [];
    isRecording = true;

    // 2. 連接音效節點（用於視覺化或音量偵測，若不需要可省略）
    sourceNode.connect(volumeNode).connect(audioContext.destination);

    // 3. 處理音量回傳（純粹用於 UI 顯示，不再控制錄音啟停）
    volumeNode.port.onmessage = (event: MessageEvent) => {
        const rms = event.data as number;
        rmsCallback?.(rms);
        dispatcher('正在錄音中...');
    };

    // 4. 正式開始錄音
    mediaRecorder.start();
    console.log('🎤 錄音中...');
    dispatcher('錄音中...');
}

export function stopRecord(): void {
    if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        return;
    }

    // 1. 停止 MediaRecorder (會觸發 onstop)
    mediaRecorder.stop();

    // 2. 斷開音效節點連接（節省資源）
    sourceNode.disconnect(volumeNode);
    volumeNode.disconnect(audioContext.destination);

    // 3. 重置狀態
    isRecording = false;
    if (silenceCountdown) {
        clearTimeout(silenceCountdown);
        silenceCountdown = null;
    }

    console.log('🛑 錄音已結束');
    dispatcher('錄音結束');
}

export const removeRecord = (): void => {
    try {
        if (sourceNode) sourceNode.disconnect();
        if (volumeNode) volumeNode.disconnect();

        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }

        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }

        if (audioContext && audioContext.state !== 'closed') {
            audioContext.close();
        }

        audioChunks = [];
        isInitialized = false;
        isRecording = false;
        console.log('🧹 已清除所有錄音資源');
        dispatcher('已清除所有錄音資源');
    } catch (error) {
        console.error('❌ 清除失敗:', error);
    }
}