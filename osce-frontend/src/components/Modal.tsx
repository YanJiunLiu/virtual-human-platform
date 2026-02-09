// Modal.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    //children: React.ReactNode;
    maxWidth?: number;
    maxHeight?: number;
    spaceless?: boolean;
    noXmark?: boolean;
    bodyContent: React.ReactNode
    footerBtns?: React.ReactNode;
};


// ⭐ FlexAuto：自動判斷子元素數量，決定 justify 類型
const FlexAuto = ({ children }: { children: React.ReactNode }) => {
    // 展開 Fragment、過濾 null
    if (React.isValidElement(children) && children.props) {
        let arr = React.Children.toArray((children.props as { children?: React.ReactNode }).children);
        const count = arr.length;
        if (count == 0) {
            arr = [children]
        }
        return (
            <div className={`flex w-full ${count > 1 ? "justify-between" : "justify-center"}`}>
                {arr}
            </div>
        );
    }
}

const Modal = (props: ModalProps) => {
    if (!props.isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex w-full h-full justify-center bg-black/80 animate-wiggle p-[15px]">
            <div
                style={{ maxWidth: props.maxWidth ?? 400, maxHeight: props.maxHeight ?? 300 }}
                className={`bg-white rounded-xl shadow-xl w-full mt-[1%] mx-auto overflow-auto flex flex-col ${props.spaceless ? "" : "p-6"}`}
            >

                {/* 關閉按鈕 */}
                {
                    !props.noXmark &&
                    <button
                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                        onClick={props.onClose}
                    >
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                }

                {/* 內容區塊 */}
                
                {props.bodyContent}


                {/* Footer 按鈕（重要：以 children 插槽方式傳入） */}
                {
                    props.footerBtns &&
                    <div className="mt-6">
                        <FlexAuto>
                            {props.footerBtns}
                        </FlexAuto>
                    </div>
                }

            </div>
        </div>
    );
};

export default Modal;
