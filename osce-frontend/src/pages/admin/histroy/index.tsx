import { useEffect, useState } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlusCircle, faMinusCircle } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from "../../../context/AuthContext"
import { adminListDepartments, adminGetMedicalHistory, adminUpdateDepartments } from "../../../api"
import { BasicContainer } from "../../../components/OSCE-unit"
import Modal from "../../../components/Modal"

export default () => {
    const { token } = useAuth()
    const [dept, setDept] = useState<Department[]>([])
    const [selected, setSelected] = useState<string>("")
    const [history, setHistory] = useState<History[]>([])
    // New state for Add History Loop
    const [selectedHistoryCategory, setSelectedHistoryCategory] = useState<string | null>(null)
    const [showAddModal, setShowAddModal] = useState(false)
    const [newHistoryContent, setNewHistoryContent] = useState("")

    useEffect(() => {
        if (token) {
            const fetchData = async () => {
                const res = await adminListDepartments({ token: token }) as DepartmentList
                setDept(res.results)
            }
            fetchData()
        }

    }, [])

    const sendHandler = async (selectedId: string) => {
        if (token) {
            const res = await adminGetMedicalHistory({ token: token, id: selectedId }) as History[]
            setHistory(res)
        }
    }

    const addHistory = async () => {
        if (token && selected && newHistoryContent.trim()) {
            try {
                await adminUpdateDepartments({
                    token: token,
                    id: selected, // dept id
                    data: {
                        medical_history: [{ category: newHistoryContent }],
                    }
                })
                // Refresh list
                await sendHandler(selected)
                // Close and reset
                setShowAddModal(false)
                setNewHistoryContent("")
            } catch (e) {
                console.error(e)
                alert("儲存失敗")
            }
        }
    }


    return (
        <BasicContainer className="flex">
            <div className="mr-[10px]">
                <div className="text-osce-blue-5 text-[20px] font-[700] mb-[20px] border-b-1 border-osce-gray-1 pb-[10px]">科別</div>
                <ul>
                    {dept.map((item: Department, index: number) =>
                        <li key={"dept_" + index}>
                            <button
                                className={`w-[240px] mb-[10px] p-[10px] rounded-md ${selected == item.id ? "bg-osce-gray-4 text-white focus:bg-osce-gray-4 focus:text-white" : "bg-osce-gray-2"}  hover:bg-osce-gray-1`}
                                onClick={() => {
                                    setSelected(item.id)
                                    sendHandler(item.id)
                                    setSelectedHistoryCategory(null) // Reset category when changing dept
                                }}
                            >
                                {item.department_name}
                            </button>
                            {/* Show "Add History" button if this department is selected */}
                            {selected === item.id && (
                                <button
                                    className="ml-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                                    onClick={() => setShowAddModal(true)}
                                >
                                    新增病史
                                </button>
                            )}

                        </li>
                    )}
                </ul>
            </div>
            <div>
                <div className="text-osce-blue-5 text-[20px] font-[700] mb-[20px] border-b-1 border-osce-gray-1 pb-[10px]">病史類別</div>
                {
                    selected &&
                    <ul>
                        {
                            history.map((item: History, index: number) =>
                                <li key={`history_${index}`}>
                                    <div className="flex items-center m-2">
                                        <div
                                            className={`w-[240px] p-[10px] rounded-md border border-osce-gray-2 ${selectedHistoryCategory === item.category ? "bg-osce-gray-3" : "bg-osce-gray-1"}`}
                                            onClick={() => setSelectedHistoryCategory(item.category)}
                                        >
                                            {item.category}
                                        </div>
                                        <FontAwesomeIcon className="text-osce-blue-5 text-[32px] mx-1" icon={faPlusCircle} onClick={() => { }} />
                                        <FontAwesomeIcon className="text-osce-blue-3 text-[32px] mx-1" icon={faMinusCircle} onClick={() => { }} />

                                    </div>
                                </li>
                            )
                        }
                    </ul>
                }
            </div>
            {/* Modal for adding new history */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                bodyContent={
                    <div className="flex flex-col gap-2">
                        <label className="font-bold">新增病史類別</label>
                        <textarea
                            className="w-full h-32 p-2 border rounded"
                            placeholder="請輸入病史名稱..."
                            value={newHistoryContent}
                            onChange={(e) => setNewHistoryContent(e.target.value)}
                        />
                    </div>
                }
                footerBtns={
                    <div className="flex justify-end gap-2 w-full">
                        <button
                            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                            onClick={() => setShowAddModal(false)}
                        >
                            取消
                        </button>
                        <button
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            onClick={addHistory}
                        >
                            儲存
                        </button>
                    </div>
                }
            />
        </BasicContainer>
    )
}