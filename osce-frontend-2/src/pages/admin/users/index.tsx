
import { useEffect, useState, useRef } from "react"
import Tanstacktable from "./Tanstacktable"
import type { TableRef } from "./Tanstacktable"
import PersonInfo from "./personInfo"
import { BasicContainer, Btn } from "../../../components/OSCE-unit"
import { usePageData } from '../context/DataContext'
import { useNavigate } from "react-router-dom"
import Modal from "../../../components/Modal"
import { useAuth } from "../../../context/AuthContext"
import { adminUserManagement } from "../../../api"
import FileUploader from "./FileUploader"
import NewUser from "./NewUser"

export default () => {
    const { setTopLeftBtns } = usePageData();
    const [currentUser, setCurrentUser] = useState<User>({} as User);
    const [state, setState] = useState<"edit" | null>(null)

    const [showModal, setShowModal] = useState(false)
    const [message, setMessage] = useState<React.ReactNode>(<></>)
    const [modalBtns, setModalBtns] = useState<React.ReactNode>(<></>)
    const navigate = useNavigate();
    const { token } = useAuth()
    const [userList, setUserList] = useState<User[] | null>([] as User[])
    const tableRef = useRef<TableRef>(null);

    const actionUserManagement = async (act: ("create" | "update" | "delete"), data: User) => {

        let check: boolean = false
        setMessage("處理中請稍後")
        setModalBtns(<></>)
        if (act == "update") {
            delete data.group_count
            delete data.case_count
        }

        const cleanedData = Object.fromEntries(
            Object.entries(data).filter(([_, v]) => v !== null && v !== undefined)
        ) as User

        const res = await adminUserManagement(act, { token: token, id: cleanedData.id, data: cleanedData }) as User

        if (res && (res as User).account != "") {
            res.id = cleanedData.id //確保id存在
            setCurrentUser(res)
            const users = await adminUserManagement("list", { token: token }) as UserList
            setUserList(users.results)
            check = true
        }
        return check
    }


    useEffect(() => {
        if (token) {
            const fetchData = async () => {
                try {
                    const res = await adminUserManagement("list", { token: token }) as UserList
                    setUserList(res.results)
                } catch (error) {
                    //沒有資料的時候處理行為
                    setUserList(null)
                }
            }
            fetchData()
            //設定右上角的按鈕
            setTopLeftBtns(
                <div className="flex ">
                    <NewUser addNewUser={((newUser: User) => {
                        setShowModal(true)
                        actionUserManagement("create", newUser).then(res => {
                            console.log(res)
                            if (res) {
                                setMessage("新增完成")
                            } else {
                                setMessage("新增失敗")
                            }
                            setShowModal(false)
                            setState(null)
                        })
                    })} />
                    <FileUploader />
                </div>
            )
        }
        else navigate('/login')

    }, [])


    if (userList == null) {
        return (
            <BasicContainer>
                <div className="w-full h-full flex justify-center items-center">
                    您沒有權限存取此功能
                </div>
            </BasicContainer>
        )
    } else {
        return (
            <>
                <div className="min-h-[600px] h-full flex items-stretch ">
                    <div
                        style={{
                            opacity: (state == null ? 1 : .8),
                            pointerEvents: (state == null ? "auto" : "none")
                        }}
                        className="overflow-x-auto p-[20px] bg-white rounded-3xl rounded-r-none flex-1 "
                    >
                        <Tanstacktable
                            ref={tableRef}
                            defaultData={userList}
                            sendUserData={(user: User) => {
                                setState("edit")
                                setCurrentUser(user)
                            }}
                        />
                    </div>
                    <div className="p-[20px] w-[300px] bg-gray-50 flex flex-col rounded-3xl rounded-l-none">
                        {
                            state != null &&
                            <>
                                <div className="grow">
                                    <PersonInfo setCurrentUser={(currentUser) => setCurrentUser(currentUser)} user={currentUser} />
                                </div>
                                <div className="flex justify-around w-full">
                                    <Btn color="white" width={70} height={30} text="取消" click={() => {
                                        tableRef.current?.resetForm()//清除已選的列
                                        setState(null)
                                    }}></Btn>
                                    {
                                        state == "edit" &&
                                        <>
                                            <Btn color="red" width={70} height={30} text="刪除" click={() => {
                                                setShowModal(true)
                                                setMessage("確定要刪除此使用者？")
                                                setModalBtns(
                                                    <>
                                                        <Btn color="gray" text="取消" click={() => setShowModal(false)} />
                                                        <Btn color="red" text="確定刪除" click={() => {

                                                            currentUser != null && {} && actionUserManagement("delete", currentUser).then(res => {
                                                                console.log(res)
                                                                if (res) {
                                                                    setMessage("刪除完成")
                                                                } else {
                                                                    setMessage("刪除失敗")
                                                                }
                                                                setShowModal(false)
                                                                setState(null)
                                                            })

                                                        }} />
                                                    </>
                                                )
                                            }} />
                                        </>
                                    }
                                    {
                                        state == "edit" &&
                                        <>
                                            <Btn color="blue" width={70} height={30} text="儲存" click={() => {
                                                setShowModal(true)
                                                setMessage("確定要修改此使用者？")
                                                setModalBtns(
                                                    <>
                                                        <Btn color="gray" text="取消" click={() => setShowModal(false)} />
                                                        <Btn color="red" text="確定更改" click={() =>
                                                            currentUser != null && {} && actionUserManagement("update", currentUser).then(res => {
                                                                if (res) {
                                                                    setMessage("修改完成")
                                                                } else {
                                                                    setMessage("修改失敗")
                                                                }
                                                                setShowModal(false)
                                                                setState(null)
                                                            })
                                                        } />
                                                    </>
                                                )

                                            }} />
                                        </>
                                    }
                                </div>
                            </>
                        }
                    </div>
                </div>
                {
                    <Modal maxWidth={400} maxHeight={160} isOpen={showModal} onClose={() => setShowModal(false)}
                        bodyContent={
                            <div className="p-2 w-full">
                                <span>{message}</span>
                                <hr className="border-osce-gray-2 my-[10px]" />
                            </div>
                        }
                        footerBtns={modalBtns}
                    />
                }
            </>
        )

    }
}