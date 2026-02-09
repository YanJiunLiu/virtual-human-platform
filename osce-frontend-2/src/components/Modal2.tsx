import React, { useState } from "react";

type ModalProps = {
    isOpen: boolean;
    children: React.ReactNode;
};

export default function Modal2({ isOpen, children }: ModalProps) {
    const [open, setIsOpen] = useState<boolean>(isOpen);

    return (
        <>


            {/* Modal */}
            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className="bg-white rounded-xl shadow-xl w-full  h-full max-h-[720px] m-10"
                        onClick={(e) => e.stopPropagation()} // 阻止點擊內容區關閉
                    >
                       
                            {children}
                       
                    </div>
                </div>
            )}
        </>
    );
}
