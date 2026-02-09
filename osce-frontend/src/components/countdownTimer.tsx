import React, { useState, useEffect, useRef } from 'react';

interface CountdownTimerProps {
    initialSeconds?: number;
    onEnd?: () => void;
}

const formatTime = (seconds: number): string => {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
};

const CountdownTimer: React.FC<CountdownTimerProps> = ({
    initialSeconds = 60,
    onEnd,
}) => {
    const [secondsLeft, setSecondsLeft] = useState<number>(initialSeconds);
    const hasEndedRef = useRef<boolean>(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setSecondsLeft((prev) => prev - 1);
        }, 1000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    useEffect(() => {
        if (secondsLeft <= 0 && !hasEndedRef.current) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            hasEndedRef.current = true;
            onEnd?.();
        }
    }, [secondsLeft, onEnd]);

    return (
         <div style={{ fontSize: "2rem", fontWeight: "bold" }}>
            {formatTime(Math.max(secondsLeft, 0))}
        </div>
    );
};

export default CountdownTimer;
/*
import React, { useEffect, useState } from "react";

const formatTimeToLabel = (totalSeconds: number): string => {
    const mm = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const ss = (totalSeconds % 60).toString().padStart(2, "0");
    return `${mm}分${ss}秒`;
};

interface CountdownTimerProps {
    durationSeconds: number;
    onComplete?: () => void;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ durationSeconds, onComplete }) => {
    const [timeLeft, setTimeLeft] = useState(durationSeconds * 1000); // 以毫秒為單位

    useEffect(() => {
        const startTime = Date.now();
        const endTime = startTime + durationSeconds * 1000;

        const tick = () => {
            console.log('tick')
            const now = Date.now();
            const diff = Math.max(endTime - now, 0);
            setTimeLeft(diff);

            if (diff === 0) {
                onComplete?.();
                clearInterval(intervalId);
            }
        };

        const intervalId = setInterval(tick, 250); // 每 250ms 更新更精準

        return () => clearInterval(intervalId);
    }, [durationSeconds, onComplete]);

    const seconds = Math.ceil(timeLeft / 1000);

    return (
        <div style={{ fontSize: "2rem", fontWeight: "bold" }}>
            {formatTimeToLabel(seconds)}
        </div>
    );
};

export default CountdownTimer;

*/