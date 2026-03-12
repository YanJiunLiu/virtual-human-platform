import { useEffect, useState } from "react";
import { Btn, ToggleSwitch } from "../../../components/OSCE-unit";
import { faCommentDots, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
//import Modal from "../../../components/Modal";
import { useCreateTest } from '../context/CreateTestContext';
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom"
import {adminGetMedicalHistory} from "../../../api"

type RowProps = {
    items: React.ReactNode[];
};

const Row: React.FC<RowProps> = ({ items }) => (
    <div className="flex mb-5 mx-[10px]">
        <div className="flex mx-2 min-w-[30px] pt-1">
            {items[0]}
        </div>
        <div className="flex mx-2 min-w-[60px] ">
            {items[1]}
        </div>
        <div className="flex mx-1 min-w-[20px] pt-2">
            {items[2]}
        </div>
        <div className="w-[150px] pt-1">
            {items[3]}
        </div>
        <div className=" grow">
            {items[4]}
        </div>
        <div className="">
            {items[5]}
        </div>
    </div>
);

export default () => {
    const { token } = useAuth()
    const {replacePayload, payload} = useCreateTest();
    const [subpayload, setSubpayload] = useState<createTest>(payload);
    //const [showModal, setShowDelModal] = useState(false);
    const navigate = useNavigate();
    const [historyList, setHistoryList]= useState<History[]>()

    useEffect(() => {
        if (!token) {
            alert("請先登入")
            navigate('/login')
        }
        const fetchData = async() => {
            console.log(subpayload)
            const res = await adminGetMedicalHistory({token:token, id:subpayload.department?.id}) as History[]
            setHistoryList(res)
        }
        fetchData()
    }, [])
    
    useEffect(()=>{
        historyList?.map(
            (history, index)=> {
                setSubpayload(prev => {
                const newSettings = [...(prev.medical_history_settings || [])];
                newSettings[index] = {
                    ...newSettings[index],
                    category: history.category
                };
                return { ...prev, medical_history_settings: newSettings };
            });
        })
    },[historyList])

    useEffect(() => {
        // 每次subpayload改變時更新全局payload
        replacePayload(subpayload);
    }, [subpayload]);

    return (
        <>
            <div className="w-full">
                <Row
                    items={[
                        "AI對答",
                        <ToggleSwitch checked={subpayload.tester?.ai_button} 
                         onChange={(e) => { setSubpayload(prev => ({ ...prev, tester:{ai_button:e} }));}} />,
                        null,
                        "考生自我介紹",
                        null,
                    ]}
                />
                <Row
                    items={[
                        "AI對答",
                        <ToggleSwitch checked={subpayload.patient?.ai_button}
                        onChange={(e) => { setSubpayload(prev => ({ ...prev, patient:{...prev.patient, ai_button:e} }));}}  />,
                        null,
                        "患者身分確認",
                        <input className="border border-gray-400 ml-3" 
                            placeholder="請輸入患者身分" 
                            value={subpayload.patient?.name}
                            onChange={(e) => { setSubpayload(prev => ({ ...prev, patient:{...prev.patient, name:e.target.value} }));}}
                        />,
                    ]}
                />

                <hr className="my-5 border-osce-gray-2" />
                <Row
                    items={[
                        "AI對答",
                        <ToggleSwitch checked={subpayload.main_description?.ai_button} 
                        onChange={(e) => { setSubpayload(prev => ({ ...prev, main_description:{...prev.main_description, ai_button:e} }));}}  />,
                        <FontAwesomeIcon className="text-osce-lake-1" icon={faCheckCircle} />,
                        <span>
                            主訴<br />
                            <span className="text-osce-lake-1 text-[13px]">列入評分</span>
                        </span>,
                        <textarea
                            className="border w-full max-w-150 border-gray-400 ml-3 "
                            placeholder="請輸入患者身分"
                            value={subpayload.main_description?.description}
                            onChange={(e) => { setSubpayload(prev => ({ ...prev, main_description:{...prev.main_description, description:e.target.value} }));}}
                        />,
                        <Btn text="例句生成" className="bg-osce-blue-3" icon={faCommentDots} click={() => { /*setShowDelModal(true)*/ }} />
                    ]}
                />
                <hr className="my-5 border-osce-gray-2" />
                {
                    historyList?.map(
                        (history, index)=> 
                        <Row 
                            items={[
                                "AI對答",
                                <ToggleSwitch checked={subpayload.medical_history_settings?.[index]?.ai_button} 
                                onChange={(e) => { 
                                    setSubpayload(prev => {
                                        const newSettings = [...(prev.medical_history_settings || [])];
                                        newSettings[index] = {
                                            ...newSettings[index],
                                            ai_button: e
                                        };
                                        return { ...prev, medical_history_settings: newSettings };
                                    });
                                }}  />,
                                <FontAwesomeIcon className="text-osce-lake-1" icon={faCheckCircle} />,
                                <span>
                                    {history.category}<br />
                                    <span className="text-osce-lake-1 text-[13px]">列入評分</span>
                                </span>,
                                <textarea
                                    className="border w-full max-w-150 border-gray-400 ml-3 "
                                    placeholder="請輸入患者身分"
                                    value={subpayload.medical_history_settings?.[index]?.description}
                                    onChange={(e) => { 
                                        setSubpayload(prev => {
                                            const newSettings = [...(prev.medical_history_settings || [])];
                                            newSettings[index] = {
                                                ...newSettings[index],
                                                description: e.target.value
                                            };
                                            return { ...prev, medical_history_settings: newSettings };
                                        });
                                    }}
                                />,
                                <Btn text="例句生成" className="bg-osce-blue-3" icon={faCommentDots} click={() => { /*setShowDelModal(true)*/ }} />
                            ]}
                        />
                    )
                }
            </div>
        </>
    )
}