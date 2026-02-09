import { useState} from "react";
import { faArrowLeft, faCirclePlus, faPlus, faExclamation } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Btn } from "../../../components/OSCE-unit"
import Modal from "../../../components/Modal"
import React from "react";

type NewUserProps = {
    addNewUser: (user: User) => void
}

let userData: User = {
    account: "kyzusmugoe",
    password: "wade0129",
    last_name: "wade",
    first_name: "chen",
    alias_name: "kyzusmugoe",
    is_superuser: true,
    is_active: true,
    school_department: {
        name: "aabb"
    },
    role: {
        name: "Administrator",
        description: "string"
    },
    username: "wade chen",
    email: "wade@gmail.com",
    serial: "60"
    
} as User

const validate = () => {
    const errors = [];
    if (!userData.account || userData.account.trim() === "") errors.push("帳號為必填");
    if (!userData.password || userData.password.trim() === "") errors.push("密碼為必填");
    if (!userData.serial || userData.serial.trim() === "") errors.push("編號為必填");
    if (!userData.email || userData.email.trim() === "")
        errors.push("Email 為必填");
    else {
        const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailReg.test(userData.email)) errors.push("Email 格式不正確");
    }

    return errors;

}


export default ({ addNewUser }: NewUserProps) => {
    const [showModal, setShowModal] = useState<boolean>(false);
    const [showMesgModal, setShowMesgModal] = useState<boolean>(false);
    const [mesg, setMesg] = useState<React.ReactNode>("")
    const [errorMesg, seErrortMesg] = useState<string>("")
    const [btns, setBtns] = useState<React.ReactNode>()

    type UnitProps = {
        title: string
        className?: string
        children: React.ReactNode
    }

    const Unit = ({ title, className, children }: UnitProps) =>
        <div className={`flex flex-col ${className ?? ""}`}>
            <span className="mb-2 text-base">{title}</span>
            {children}
        </div>


    const sendData = () => {
        /*
        setMesg(
            <div>
                處理中請稍候...
                <FontAwesomeIcon className="text-osce-blue-5 animate-spin" icon={faCircleNotch} />
            </div>
        )
        setBtns(<></>)
        */
        setShowModal(false)
        setShowMesgModal(false)
        addNewUser(userData)
        /*
        setTimeout(() => {
            setMesg("新增完畢")
            setBtns(<Btn color="blue" text="關閉" click={() => {
                setShowMesgModal(false)
                setShowModal(false)
            }} />)
        }, 1000);
        */
    }

    return (
        <>
            <Btn className="mr-2" color="white" text="新增" icon={faCirclePlus} click={() => {
                setShowModal(true)
            }} />

            <Modal
                maxWidth={800} maxHeight={640}
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                bodyContent={
                    <div className="p-2 w-full flex flex-col h-full">
                        <div className="flex items-center justify-between border-b border-osce-gray-2 pb-3 my-[10px]">
                            <span>新建使用者</span>
                        </div>
                        <div className="flex-grow overflow-auto">
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <Unit title="帳號*" >
                                    <input
                                        className="border rounded border-osce-gray-2 p-[10px] text-sm"
                                        defaultValue={userData.account}
                                        onChange={e => { userData = { ...userData, account: e.target.value }; }}
                                    />
                                </Unit>
                                <Unit title="密碼*" >
                                    <input
                                        className="border rounded border-osce-gray-2 p-[10px] text-sm"
                                        defaultValue={userData.password}
                                        onChange={e => { userData = { ...userData, password: e.target.value } }}
                                    />
                                </Unit>
                                <Unit title="活躍狀態">
                                    <input
                                        type="checkbox"
                                        placeholder={""}
                                        className="border rounded border-osce-gray-2 m-[12px] text-sm"
                                    />
                                </Unit>
                                <Unit title="名" >
                                    <input
                                        className="border rounded border-osce-gray-2 p-[10px] text-sm"
                                        defaultValue={userData.first_name}
                                        onChange={e => { userData = { ...userData, first_name: e.target.value } }}
                                    />
                                </Unit>
                                <Unit title="姓">
                                    <input
                                        className="border rounded border-osce-gray-2 p-[10px] text-sm"
                                        defaultValue={userData.last_name}
                                        onChange={e => { userData = { ...userData, last_name: e.target.value } }}
                                    />
                                </Unit>
                                <Unit title="別名">
                                    <input
                                        className="border rounded border-osce-gray-2 p-[10px] text-sm"
                                        defaultValue={userData.alias_name}
                                        onChange={e => { userData = { ...userData, alias_name: e.target.value } }}
                                    />
                                </Unit>
                                <Unit title="角色">
                                    <select className="border rounded border-osce-gray-2 p-[10px] h-[42px]" onChange={(e) => {
                                        userData = {
                                            ...userData, role: {
                                                name: e.target.value
                                            }
                                        }
                                    }}>
                                        <option value="Student">學生</option>
                                        <option value="Stuff">教師</option>
                                        <option value="Administrator">管理員</option>
                                    </select>
                                </Unit>
                                <Unit title="編號*" >
                                    <input
                                        className="border rounded border-osce-gray-2 p-[10px] text-sm"
                                        defaultValue={userData.serial}
                                        onChange={e => { userData = { ...userData, serial: e.target.value } }}
                                    />
                                </Unit>
                                <Unit title="系所" >
                                    <input
                                        className="border rounded border-osce-gray-2 p-[10px] text-sm"
                                        defaultValue={userData.school_department?.name}
                                        onChange={e => { userData = { ...userData, school_department: { name: e.target.value } } }}
                                    />
                                </Unit>
                            </div>
                            <Unit className="mb-4" title="email" >
                                <input
                                    className="border rounded border-osce-gray-2 p-[10px] text-sm"
                                    defaultValue={userData.email}
                                    onChange={e => { userData = { ...userData, email: e.target.value } }}
                                />
                            </Unit>
                            <hr />
                            {
                                errorMesg &&
                                <div className="text-osce-red-5 flex m-3 items-center">
                                    <div className="text-sm w-[16px] h-[16px] rounded-full bg-osce-red-5 flex justify-center items-center mr-2">
                                        <FontAwesomeIcon className="text-white" icon={faExclamation} />
                                    </div>
                                    {errorMesg}
                                </div>
                            }
                        </div>
                    </div>
                }
                footerBtns={
                    <>
                        <Btn color="gray" icon={faArrowLeft} text="取消" click={() => setShowModal(false)} />
                        <Btn color="blue" icon={faPlus} text="新建" click={() => {

                            const errors = validate()

                            if (errors.length > 0) {
                                seErrortMesg(errors.join(","))
                                return
                            } else {
                                seErrortMesg("")
                            }
                            setMesg("確定資料是否正確並新增資料？")
                            setShowMesgModal(true)
                            setBtns(
                                <>
                                    <Btn color="gray" text="取消" click={() => { setShowMesgModal(false) }} />
                                    <Btn color="blue" text="確定" click={sendData} />
                                </>
                            )
                        }} />
                    </>
                }
            />
            <Modal
                maxWidth={400} maxHeight={200}
                isOpen={showMesgModal}
                onClose={() => setShowModal(false)}
                bodyContent={
                    <div className="flex justify-center items-center flex-grow">
                        {mesg}
                    </div>
                }
                footerBtns={
                    btns
                }
            />


        </>
    )
}