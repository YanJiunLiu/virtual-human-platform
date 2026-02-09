import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState } from "react";

type BtnProps = {
    className?: string;
    width?: number;
    height?: number;
    click: React.MouseEventHandler<HTMLButtonElement>;
    text: string;
    icon?: any; // You can replace 'any' with the specific icon type if available
    color?: "blue" | "red" | "gray" | "white"
    round?: "large" | "small"
};

export const Btn: React.FC<BtnProps> = ({ className, width = 100, height = 40, click, text, icon, color, round = "large" }) => {
    const btnInlineStyle: React.CSSProperties = {
        width: width + "px",
        height: height + "px"
    }

    return (
        <button
            style={btnInlineStyle}
            className={`
                ${color == "blue" ? "bg-osce-blue-5" : ""} ${color == "white" ? "bg-white" : ""} ${color == "gray" ? "bg-osce-gray-2" : ""}
                ${color == "red" ? "bg-osce-red-5" : ""} ${round == "large" ? "rounded-full" : ""} ${round == "small" ? "rounded-md" : ""}
                flex place-content-between justify-around items-center px-[10px] 
                ${color == "white" ? " text-osce-blue-5 border border-osce-blue-5" : "text-white"}
                ${className ?? ""}
            `}
            
            onClick={click}
        >
            {
                icon &&
                <FontAwesomeIcon icon={icon} />
            }
            <span >{text}</span>
        </button>
    )
};

type OSCESelectProps = {
    onchange: React.ChangeEventHandler<HTMLSelectElement>
    list: { txt: string, value: string }[]
    className?: string
    value?: string
}

export const OSCESelect = ({ onchange, list, className, value }: OSCESelectProps) =>
    <select
        className={` ${className} min-w-[100px] h-[40px] appearance-none px-3 border-1 rounded-sm border-osce-gray-2 bg-osce-gray-1 shadow-none focus:shadow-none focus:outline-none`}
        onChange={onchange}
        value={value}
    >
        <option value="" >----</option>
        {
            list.map((item: { txt: string, value: string }, index: number) => <option key={`${item.txt}-${index}`} value={item.value}>{item.txt}</option>)
        }
    </select>

type InputProps = {
    placeholder?: string
    className?: string
    onchange: React.ChangeEventHandler<HTMLInputElement>
    value?: string
}

export const OSCEInput = ({ className, placeholder, onchange, value }: InputProps) =>
    <input className={`${className} border-1 rounded-sm border-osce-gray-2 bg-osce-gray-1 max-w-[100px] h-[40px] p-[10px]`} placeholder={placeholder} onChange={onchange} value={value} />


type ToggleSwitchProps = {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
};

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked = false, onChange }) => {
    const [isOn, setIsOn] = useState(checked);

    const toggle = () => {
        setIsOn(!isOn);
        onChange?.(!isOn);
    };

    return (
        <button
            onClick={toggle}
            className={`w-[50px] h-[30px] rounded-full flex items-center  transition-colors duration-300 ${isOn ? "bg-osce-blue-5" : "bg-gray-300"
                }`}
        >
            <div
                className={`w-[24px] h-[24px] bg-white rounded-full shadow-md transform transition-transform duration-300 ${isOn ? "translate-x-[13px]" : "translate-x-[-6px]"
                    }`}
            />
        </button>
    );
};

// 基本容器組件，單一白色區塊的版型
interface BasicContainerProps {
    className?: string
    children: React.ReactNode;
}
export const BasicContainer: React.FC<BasicContainerProps> = ({ className, children }) =>
    <div className={`bg-white w-full rounded-3xl mb-[20px] ${className ? className : ""}`}>
        <div className='overflow-y-auto max-h-full min-h-[600px] w-[calc(100%-20px)] p-[20px]'>
            {children}
        </div>
    </div>
