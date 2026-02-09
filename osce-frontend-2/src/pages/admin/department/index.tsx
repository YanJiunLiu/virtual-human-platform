import React, { useEffect, useRef, useState } from "react"
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashCan, faPencilSquare, faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from "../../../context/AuthContext";
import { adminListDepartments, adminCreateDepartments, adminDeleteDepartments, adminUpdateDepartments } from "../../../api"
import { BasicContainer, Btn } from "../../../components/OSCE-unit";
import Modal from '../../../components/Modal'
import { usePageData } from '../context/DataContext'

export default () => {
    const navigate = useNavigate();
    const { token } = useAuth()
    const [selected, setSelected] = useState<string>("")
    const [dept, setDept] = useState<Department[]>([]);
    const [showModal, setShowModal] = useState<boolean>(false)
    const [newDeptName, setNewDeptName] = useState<string>("")
    const [message, setMessage] = useState<React.ReactNode>(<></>)
    const [modelBtns, setModelBtns] = useState<React.ReactNode>(<></>)

    const inputRef = useRef<HTMLInputElement>(null)
    const { setTopLeftBtns } = usePageData();

    useEffect(() => {
        if (token) {
            getDepartments()
            setTopLeftBtns(<></>)
        }
    }, [])

    const getDepartments = async () => {
        if (token) {
            const fetchData = async () => {
                const res = await adminListDepartments({ token: token }) as DepartmentList
                setDept(res.results)
            }
            fetchData().then((res) => {
                console.log(res)
            })
        }
    }

    const addDepartment = async () => {
        if (token) {
            const res = await adminCreateDepartments({ token: token, data: { department_name: newDeptName } });
            if (res && (res as { department_name: string }).department_name != "") {
                getDepartments()
                setMessage(<span>新增成功</span>)
            } else {
                setMessage(<span>新增失敗</span>)
            }
            setNewDeptName("")
            setModelBtns(<Btn className="" color="blue" round="small" click={() => { setShowModal(false); }} text="確定" />)
        }
    }

    const removeDepartment = async () => {
        if (!token) {
            alert("請先登入")
            navigate('/login')
        }
        if (!selected) {
            alert("請選擇欲刪除的科別")
            return
        }
        const res = await adminDeleteDepartments({ token: token, id: selected });
        if (res && (res as { message: string }).message === "No Content") {
            setMessage(<span>刪除成功</span>)
            const newDept = dept.filter((item) => item.id !== selected)
            setDept(newDept)
            setSelected("")
        } else {
            setMessage(<span>刪除失敗</span>)
        }
        setModelBtns(<Btn className="" color="blue" round="small" click={() => { setShowModal(false); }} text="確定" />)

    }

    const editDepartment = async (editName: string) => {
        if (token) {
            const res = await adminUpdateDepartments({ token: token, id: selected, data: { department_name: editName } });
            if (res && (res as { department_name: string }).department_name != "") {
                getDepartments()
                setMessage(<span>修改成功</span>)
            } else {
                setMessage(<span>修改失敗</span>)
            }
            setNewDeptName("")
            setModelBtns(<Btn className="" color="blue" round="small" click={() => { setShowModal(false); }} text="確定" />)
        }
    }

    return (
        <>
            <BasicContainer>
                <ul>
                    <li>
                        <div className="flex">
                            <div
                                className={`w-[240px] mb-[10px] p-[10px] rounded-md "bg-osce-gray-2"} border border-osce-gray-1 hover:bg-osce-gray-1`}

                            >
                                <input className="w-full bg-white" placeholder="請輸入科別名稱" value={newDeptName}
                                    onChange={event => { setNewDeptName(event.target.value) }}
                                />
                            </div>
                            <Btn className="mx-2 my-1" color="blue" round="small" click={() => {
                                if (newDeptName != "") {
                                    setShowModal(true);
                                    setMessage("確定新增此科別嗎？");
                                    setModelBtns(
                                        <>
                                            <Btn className="mx-1" color="gray" round="small" click={() => { setShowModal(false); }} text="取消" />
                                            <Btn className="mx-1" color="blue" round="small" click={() => {
                                                setModelBtns(<></>)
                                                setMessage(
                                                    <div>
                                                        處理中請稍候...
                                                        <FontAwesomeIcon className="text-osce-blue-5 animate-spin" icon={faCircleNotch} />
                                                    </div>
                                                );
                                                addDepartment()
                                            }} text="確定" />
                                        </>
                                    )
                                } else {
                                    setShowModal(true)
                                    setMessage("科別名稱不可為空");
                                    setModelBtns(
                                        <Btn className="" color="blue" round="small" click={() => { setShowModal(false); }} text="確定" />
                                    )
                                }

                            }} text="新增科別" />
                        </div>
                    </li>
                    {
                        dept.map((item: Department, index: number) =>
                            <li key={"dept_" + index}>
                                <div className="flex">
                                    <span
                                        className={`
                                            w-[240px] my-[5px] p-[10px] rounded-md 
                                            ${selected == item.id ?
                                                "bg-osce-gray-4 text-white focus:bg-osce-gray-4 focus:text-white " :
                                                "bg-osce-gray-2 "
                                            } 
                                            hover:bg-osce-gray-1 hover:text-osce-gray-4
                                        `}
                                        onClick={() => { setSelected(item.id || "") }}
                                    >
                                        {item.department_name}
                                    </span>
                                    {
                                        selected == item.id &&
                                        <div className="flex items-center">
                                            <Btn className="mx-2" color="red" round="small" icon={faTrashCan} click={() => {
                                                setShowModal(true);
                                                setMessage("確定刪除此科別嗎？");
                                                setModelBtns(
                                                    <>
                                                        <Btn className="mx-1" color="gray" round="small" click={() => {
                                                            setShowModal(false)
                                                        }} text="取消" />
                                                        <Btn className="mx-1" color="red" round="small" click={() => {
                                                            setModelBtns(<></>)
                                                            setShowModal(true)
                                                            setMessage(
                                                                <div>
                                                                    處理中請稍候...
                                                                    <FontAwesomeIcon className="text-osce-red-5 animate-spin" icon={faCircleNotch} />
                                                                </div>
                                                            );
                                                            removeDepartment();
                                                        }} text="確定" />
                                                    </>
                                                )
                                            }} text="刪除" />
                                            <Btn className="" color="blue" round="small" icon={faPencilSquare} click={() => {
                                                setShowModal(true)
                                                setMessage(
                                                    <div className="flex flex-col">
                                                        <span className="mb-2">請輸入修改的科別名稱</span>
                                                        <input ref={inputRef} className="border border-osce-gray-2 p-2" placeholder="請輸入科別名稱" defaultValue={item.department_name} />
                                                    </div>
                                                )
                                                setModelBtns(
                                                    <>
                                                        <Btn className="mx-1" color="red" round="small" click={() => {
                                                            setShowModal(false)
                                                        }} text="取消" />
                                                        <Btn className="mx-1" color="blue" round="small" click={() => {
                                                            if (inputRef.current?.value) {
                                                                editDepartment(inputRef.current.value)
                                                            }
                                                        }} text="確定" />
                                                    </>
                                                )
                                            }} text="編輯" />
                                        </div>
                                    }
                                </div>
                            </li>
                        )
                    }
                </ul>
            </BasicContainer>

            <Modal maxWidth={400} maxHeight={180} isOpen={showModal} onClose={() => setShowModal(false)}
                bodyContent={
                    <div className='flex flex-col justify-center items-center grow'>
                        {message}
                    </div>
                }
                footerBtns={modelBtns}
            />
        </>
    )
}