import React, { useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone } from '@fortawesome/free-solid-svg-icons';

interface Message {
    sender: 'doctor' | 'patient';
    content: string;
}

interface ChatProps {
    messages: Message[];
    isRecording: boolean;
}

const Chat: React.FC<ChatProps> = ({ messages, isRecording }) => {
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when messages or recording state changes
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isRecording]);

    return (
        <div className="flex flex-col h-full overflow-hidden bg-white rounded-2xl shadow-inner border border-osce-gray-2">

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => {
                    const isDoctor = msg.sender === 'doctor';
                    return (
                        <div
                            key={index}
                            className={`flex w-full ${isDoctor ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] px-4 py-3 rounded-2xl text-[16px] leading-relaxed shadow-sm ${isDoctor
                                    ? 'bg-osce-blue-5 text-white rounded-br-none'
                                    : 'bg-osce-gray-1 text-black rounded-bl-none border border-osce-gray-2'
                                    }`}
                            >
                                {msg.content}
                            </div>
                        </div>
                    );
                })}

                {/* Recording Indicator Bubble */}
                {isRecording && (
                    <div className={`flex w-full ${(!messages.length || messages[messages.length - 1].sender === 'patient') ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] px-4 py-3 rounded-2xl ${(!messages.length || messages[messages.length - 1].sender === 'patient') ? 'rounded-br-none' : 'rounded-bl-none'} bg-osce-blue-1 text-osce-blue-5 border border-osce-blue-2 flex items-center gap-2 animate-pulse`}>
                            <FontAwesomeIcon icon={faMicrophone} className="animate-bounce" />
                            <span>持續輸入中...</span>
                            <div className="flex gap-1 items-center h-full ml-1">
                                <div className="w-1.5 h-1.5 bg-osce-blue-5 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-1.5 h-1.5 bg-osce-blue-5 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-1.5 h-1.5 bg-osce-blue-5 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>
        </div>
    );
};

export default Chat;
