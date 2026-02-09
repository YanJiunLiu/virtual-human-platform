// Stepper.tsx
import React from "react";

type StepperProps = {
    steps: number;
    currentStep: number; // 0-based
};

const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
    return (
        <div className="w-[330px] flex items-center justify-center relative py-8 ">
            {/* 線 */}
            <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-gray-300 z-0" />

            <div className="flex justify-between w-full max-w-3xl px-4 z-10">
                {Array.from({ length: steps }).map((_, i) => {
                    const isActive = i === currentStep;
                    return (
                        <div key={i} className="relative z-10 flex items-center justify-center">
                            <div
                                className={`w-5 h-5 rounded-full ${isActive
                                        ? "bg-blue-800 border-4 border-white"
                                        : "bg-gray-300"
                                    }`}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Stepper;
