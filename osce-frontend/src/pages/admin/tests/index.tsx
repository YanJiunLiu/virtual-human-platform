import { useEffect, useState, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faFilePen, faTrashCan, faPrint, faCopy, faPaperPlane, faLock, faCirclePlus, faXmark } from '@fortawesome/free-solid-svg-icons'
import ImgLoader from '../../../components/imgLoader';
import Modal from '../../../components/Modal';
import { adminListDepartmentTests, adminCreateTests } from '../../../api';
import { BasicContainer, Btn } from '../../../components/OSCE-unit';
import { useAuth } from '../../../context/AuthContext';
import { usePageData } from '../context/DataContext'
import Editing from './editing';



type RowProps = {
    title: string;
    text: string;
};

const Row: React.FC<RowProps> = ({ title, text }) =>
    <div className='mb-[20px]'>
        <h6 className='mb-[10px]'>{title}</h6>
        <p className='min-h-[80px] text-osce-gray-3'>{text}</p>
    </div>
export default () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [pdata, setPdata] = useState<Department[]>([]);
    const [showModal, setShowModal] = useState<boolean>(false)
    const [showEditingModal, setShowEditingModal] = useState<boolean>(false)
    const [selectedPdata, setSelectedPdata] = useState<createTest>({})
    const { setTopLeftBtns } = usePageData();


    const [showMessage, setShowMessage] = useState<boolean>(false)//系統視窗
    const [messageConfig, setMessageConfig] = useState<{ message: string; modalBtns: ModalBtn[] }>()//系統視窗設定
    const closeModal = () => {
        setShowMessage(false)
        setShowModal(false)
    }


    //取得列表資料
    const getListData = async () => {
        if (token) {
            const fetchData = async () => {
                const res = await adminListDepartmentTests({ token: token }) as DepartmentList
                setPdata(res.results)
            }
            fetchData()
            setTopLeftBtns(
                <Btn color="white" text="新增" icon={faCirclePlus} click={() => { navigate("../create") }} />
            )
        }
    }

    //複製測驗
    const copyTest = async () => {
        const _d = { ...selectedPdata } as createTest
        delete _d.id
        await adminCreateTests("create", { token: token, data: _d }).then((res: any) => {
            if (res) {
                setMessageConfig({ message: "複製成功", modalBtns: [{ text: "關閉", color: "blue", click: () => { closeModal() } }] })
            } else {
                setMessageConfig({ message: "複製失敗", modalBtns: [{ text: "關閉", color: "blue", click: () => { closeModal() } }] })
            }
            getListData()
        })
    }

    //刪除測驗
    const deleteTest = async (id: string) => {
        if (!id) return;
        setMessageConfig({ message: "刪除中...", modalBtns: [] })
        adminCreateTests("delete", { token: token, id: id }).then((res: any) => {
            const _m: string = res.message as string
            if (_m) {
                setMessageConfig({ message: "刪除成功", modalBtns: [{ text: "關閉", color: "blue", click: () => { closeModal() } }] })
            } else {
                setMessageConfig({ message: "刪除失敗", modalBtns: [{ text: "關閉", color: "blue", click: () => { closeModal() } }] })
            }
            getListData()
        })
    }

    useEffect(() => {
        if (token) {
            const fetchData = async () => {
                const res = await adminListDepartmentTests({ token: token }) as DepartmentList
                console.log(res)
                setPdata(res.results)
            }

            fetchData()
            setTopLeftBtns(
                <Btn color="white" text="新增" icon={faCirclePlus} click={() => { navigate("../create") }} />
            )
        }
    }, [])

    return (
        <BasicContainer>
            {
                pdata.map((item: Department) =>
                    <div key={item.id} className="flex-wrap mx-auto">
                        <h2 className="text-osce-blue-4  w-full max-w-350 pb-3 mb-3 border-b border-osce-gray-5 mx-auto">{item.department_name}</h2>
                        <div className='w-full '>
                            <div className="flex gap-x-5 gap-y-5 pb-5 flex-wrap w-full max-w-350 mx-auto">
                                {
                                    item.tests?.map((test, index) =>
                                        <div
                                            className='w-64 h-80 cursor-pointer relative overflow-hidden rounded-5'
                                            onClick={() => {
                                                setShowModal(true)
                                                setSelectedPdata({
                                                    ...test,
                                                    department: { ...item }
                                                })
                                            }}
                                            key={index}
                                        >
                                            <ImgLoader
                                                className="w-full h-full object-cover animate-wiggle"
                                                src={test.standardized_patient?.head_shot ?? ""}
                                                alt={`${test.standardized_patient?.last_name} ${test.standardized_patient?.title}`}
                                            />
                                            <div className="bg-white/80 absolute bottom-0 w-full p-2">{test.topic}</div>
                                            <FontAwesomeIcon className='text-[16px] rounded-full  absolute text-white top-2 left-2 bg-osce-green-5' icon={faCheck} />
                                            <FontAwesomeIcon className='absolute top-2 right-2 text-osce-gray-3' icon={faLock} />
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                )
            }

            <Modal
                maxWidth={1200}
                maxHeight={720}
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                spaceless={true}
                noXmark={true}
                bodyContent={
                    <>
                        <div className='flex h-full' >

                            <span className='absolute top-3 right-3 bg-white flex rounded-full w-10 h-10 justify-center items-center border border-osce-blue-5' onClick={() => { setShowModal(false) }}>
                                <FontAwesomeIcon className=' text-osce-blue-5' icon={faXmark} />
                            </span>

                            <div className='bg-osce-gray-2 p-5 '>
                                <h1 className='text-center text-5 font-bold mb-5'>{selectedPdata.topic ?? "無標題"}</h1>
                                <ImgLoader
                                    className="w-full h-full max-w-60 max-h-70 object-cover animate-wiggle rounded-2xl"
                                    src={selectedPdata.standardized_patient?.head_shot ?? ""}
                                />
                                <span>
                                    {`${selectedPdata.standardized_patient?.age ?? "0"}歲 ${selectedPdata.standardized_patient?.last_name ?? ""} ${selectedPdata.standardized_patient?.title ?? ""}`}
                                </span>
                            </div>

                            <div className='flex flex-col p-5 w-full h-full max-h-180'>
                                <div className=' overflow-y-auto grow'>
                                    <Row title='主訴' text={selectedPdata.main_description?.description ?? "-"} />
                                    {
                                        selectedPdata.medical_history_settings?.map((medical_history) =>
                                            <Row title={medical_history.category ?? "-"} text={medical_history.description ?? "-"} />
                                        )
                                    }
                                </div>
                                <div className='flex flex-none justify-between'>
                                    <Btn className="bg-osce-red-5" icon={faTrashCan} click={() => {
                                        setShowMessage(true)
                                        setMessageConfig({
                                            message: "確定要刪除此測驗嗎？此動作無法復原。",
                                            modalBtns: [
                                                { text: "取消", color: "gray", click: () => { setShowMessage(false) } },
                                                {
                                                    text: "確定", color: "red", click: () => {
                                                        if (selectedPdata.id) {
                                                            deleteTest(selectedPdata.id);
                                                        }
                                                    }
                                                }
                                            ]
                                        })

                                    }} text="刪除" />

                                    <div className='flex gap-2 ml-2'>
                                        <Btn className="bg-osce-blue-3" icon={faPrint} click={() => { setShowModal(false) }} text="列印" />
                                        <Btn className="bg-osce-blue-3" icon={faCopy} click={() => {
                                            setShowMessage(true)
                                            setMessageConfig({
                                                message: "確定要複製此測驗嗎？",
                                                modalBtns: [
                                                    { text: "取消", color: "gray", click: () => { setShowMessage(false) } },
                                                    {
                                                        text: "確定", color: "red", click: () => {
                                                            if (selectedPdata.id) {
                                                                copyTest();
                                                            }
                                                        }
                                                    }
                                                ]
                                            })
                                        }} text="複製" />
                                        <Btn className="bg-osce-blue-3" icon={faFilePen} click={() => {
                                            //setShowModal(false)
                                            setShowEditingModal(true)
                                        }} text="編輯" />
                                        <Btn className="bg-osce-blue-3" icon={faPaperPlane} click={() => { setShowModal(false) }} text="發布" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                }
            >
            </Modal>


            <Editing show={showEditingModal} close={() => { setShowEditingModal(false) }} dataID={selectedPdata.id} />

            <SysModal
                show={showMessage}
                close={(close => { setShowMessage(close) })}
                message={messageConfig?.message || ""}
                modalBtns={messageConfig?.modalBtns || []}
            />

        </BasicContainer>
    )
}


type ModalBtn = {
    text: string;
    color?: "blue" | "white" | "gray" | "red";
    icon?: JSX.Element;
    click: () => void;
}


type SysModalProps = {
    show: boolean;
    close: (show: boolean) => void;
    message: string;
    modalBtns: ModalBtn[] | null;
}


const SysModal = ({ show, close, message, modalBtns }: SysModalProps) => {
    return (
        <Modal
            maxWidth={400}
            maxHeight={200}
            isOpen={show}
            onClose={() => close(false)}
            bodyContent={
                <div className="p-2 w-full">
                    <span>{message}</span>
                    <hr className="border-osce-gray-2 my-2" />
                    <div className="w-full flex 
                        [&:has(:only-child)]:justify-center 
                        [&:has(:not(:only-child))]:justify-around
                    ">
                    </div>
                </div>
            }
            footerBtns={
                <>
                    {
                        modalBtns && modalBtns.length > 0 &&
                        modalBtns.map((btn: ModalBtn, index: number) =>
                            <Btn
                                key={index}
                                text={btn.text}
                                color={btn.color}
                                icon={btn.icon}
                                click={btn.click}
                            />
                        )
                    }
                </>
            }
        />
    )
}

