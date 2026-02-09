import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faFilePen, faTrashCan, faPrint, faCopy, faPaperPlane, faLock, faCirclePlus } from '@fortawesome/free-solid-svg-icons'
import ImgLoader from '../../../components/imgLoader';
import Modal from '../../../components/Modal';
import { adminListDepartmentTests } from '../../../api';
import { BasicContainer, Btn } from '../../../components/OSCE-unit';
import { useAuth } from '../../../context/AuthContext';
import { usePageData } from '../context/DataContext'

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
    const [selectedPdata, setSelectedPdata] = useState<createTest>({})
    const { setTopLeftBtns } = usePageData();

    useEffect(() => {
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
    }, [])

    return (
        <BasicContainer>
            {
                pdata.map((item: Department) =>
                    <div key={item.id} className="flex-wrap mx-auto">
                        <h2 className="text-osce-blue-4  w-full max-w-[1400px] pb-3 mb-3 border-b-1 border-osce-gray-5 mx-auto">{item.department_name}</h2>
                        <div className='w-full '>
                            <div className="flex gap-x-[20px] gap-y-[20px] pb-[20px] flex-wrap w-full max-w-[1400px] mx-auto">
                                {
                                    item.tests?.map((test, index) =>
                                        <div
                                            className='w-[255px] h-[320px] cursor-pointer relative overflow-hidden rounded-[20px]'
                                            onClick={() => {
                                                setShowModal(true)
                                                setSelectedPdata(test)
                                            }}
                                            key={index}
                                        >

                                            <ImgLoader
                                                className="w-full h-full object-cover animate-wiggle"
                                                src={test.standardized_patient?.head_shot ?? ""}
                                                alt={`${test.standardized_patient?.last_name} ${test.standardized_patient?.title}`}
                                            />


                                            <div className="bg-white/80 absolute bottom-0 w-full p-[10px]">{test.topic}</div>
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
                    <div className='flex h-full' >
                        <div className='bg-osce-gray-2 p-[20px] '>

                            <h1 className='text-center text-[20px] font-bold'>{selectedPdata.topic ?? "無標題"}</h1>
                            <ImgLoader
                                className="w-full h-full max-w-[240px] max-h-[280px] object-cover animate-wiggle rounded-2xl"
                                src={selectedPdata.standardized_patient?.head_shot ?? ""}
                            />
                            <span>
                                {`${selectedPdata.standardized_patient?.age ?? "0"}歲 ${selectedPdata.standardized_patient?.last_name ?? ""} ${selectedPdata.standardized_patient?.title ?? ""}`}
                            </span>
                        </div>
                        <div className='flex flex-col p-[20px] w-full h-full max-h-[720px]'>
                            <div className=' overflow-y-auto'>
                                <Row title='主訴' text={selectedPdata.main_description?.description ?? "-"} />
                                {selectedPdata.medical_history_settings?.map(
                                    (medical_history) => <Row title={medical_history.category ?? "-"} text={medical_history.description ?? "-"} />
                                )}

                            </div>

                        </div>
                    </div>
                }
                footerBtns={
                    <div className='flex flex-none justify-between'>
                        <Btn className="bg-osce-red-5" icon={faTrashCan} click={() => { setShowModal(false) }} text="刪除" />

                        <div className='flex gap-2 ml-2'>
                            <Btn className="bg-osce-blue-3" icon={faPrint} click={() => { setShowModal(false) }} text="列印" />
                            <Btn className="bg-osce-blue-3" icon={faCopy} click={() => { setShowModal(false) }} text="複製" />
                            <Btn className="bg-osce-blue-3" icon={faFilePen} click={() => { setShowModal(false) }} text="編輯" />
                            <Btn className="bg-osce-blue-3" icon={faPaperPlane} click={() => { setShowModal(false) }} text="發布" />
                        </div>
                    </div>
                }
            >

            </Modal>
        </BasicContainer>
    )
}


