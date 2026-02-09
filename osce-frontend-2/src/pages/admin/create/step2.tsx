import ImgLoader from "../../../components/imgLoader"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faPaste } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from "react"
import { useAuth } from "../../../context/AuthContext"
import { adminStandardpatients } from "../../../api"
import { useNavigate } from "react-router-dom"
import { useCreateTest } from '../context/CreateTestContext';


type InputProps = {
    label: string
    value?: string|number
}

const Input = ({ label, value }: InputProps) =>
    <div >
        <span className="p-[10px]">{label}</span>
        <input className="border-1 rounded-sm border-osce-gray-2 bg-osce-gray-1 max-w-[100px]  h-[40px] p-[10px]" value={value} readOnly />
    </div>

export default () => {
    const navigate = useNavigate();
    const [stdpt, setStdpt] = useState<standardizedpatientList>({counts:0,results:[]})
    const { token } = useAuth()
    const { replacePayload, payload } = useCreateTest();
    const [subpayload, setSubpayload] = useState<createTest>(payload);

    useEffect(() => {
        if (!token) {
            alert("請先登入")
            navigate('/login')
        }
        const fetchData = async () => {
            const res = await adminStandardpatients("list", { token: token }) as standardizedpatientList
            console.log(res)
            setStdpt(res)
        }
        fetchData()
    }, [token])
    useEffect(() => {
        // 每次subpayload改變時更新全局payload
        replacePayload(subpayload);
    }, [subpayload]);

    const sendHandler = async (selectedId: string) => {
        if (!token) {
            alert("請先登入")
            navigate('/login')
        }
        const res = await adminStandardpatients("get", { token: token, id: selectedId }) as standardizedpatient
        setSubpayload(prev => ({ ...prev, standardized_patient: res }));
    }

    return (
        <>
            <div className="flex w-full">
                <div className="flex-none basis-[240px] max-h-[calc(100vh-120px)] overflow-y-auto">
                    <ul >
                        {stdpt.results.map((item: standardizedpatient) =>
                            <li key={"disease_" + item.id}>
                                <section
                                    className={`w-[240px] h-[120px] ${item.id == subpayload.standardized_patient?.id ? "bg-osce-blue-5 text-white" : "bg-osce-gray-1 "} rounded-md flex overflow-hidden mb-[10px]`}
                                    onClick={() => {
                                        sendHandler(item.id ?? "");
                                    }}
                                >
                                    <ImgLoader className="w-full max-w-[100px] h-full object-cover" src={item.head_shot ?? "./img/photo/human1.jpg"} />
                                    <div className="flex flex-col p-1 w-full">
                                        <span className="grow flex items-center">
                                            {item.age}歲 {item.last_name} {item.title}
                                        </span>

                                    </div>
                                </section>
                            </li>
                        )}
                    </ul>
                </div>
                <div className="flex flex-col mt-[85px] mx-[20px] grow ">

                    {
                        subpayload.standardized_patient?.id != null && <>
                            <div className="flex h-full">
                                <div className="w-full max-w-[340px] hidden lg:block h-full max-h-[470px] object-cover shrink">

                                    <ImgLoader className="" src={subpayload.standardized_patient?.head_shot ?? "./img/photo/human1.jpg"} />
                                </div>
                                <div className="p-[30px] w-full overflow-y-auto max-h-[calc(100vh-205px)] ">
                                    <div className="flex gap-2 mb-[30px] px-[30px]">
                                        <FontAwesomeIcon className="text-osce-green-5" icon={faCheckCircle} />
                                        <FontAwesomeIcon className="text-osce-blue-5" icon={faPaste} />
                                    </div>
                                    <div className="flex flex-wrap gap-5">
                                        <Input label="年齡" value={subpayload.standardized_patient?.age} />
                                        <Input label="姓氏" value={subpayload.standardized_patient?.last_name} />
                                        <Input label="性別" value={subpayload.standardized_patient?.gender} />
                                        <Input label="稱謂" value={subpayload.standardized_patient?.title} />
                                        <Input label="職稱" value={subpayload.standardized_patient?.job_title} />
                                    </div>
                                    <hr className="border-osce-gray-2 my-[20px]" />
                                    <div className="flex flex-wrap gap-x-2 gap-y-4 mb-[30px] [&>div]:basis-[49%]">
                                        <Input label="語系" value={subpayload.standardized_patient?.language} />
                                        <Input label="口氣" value={subpayload.standardized_patient?.tone} />
                                        <Input label="髮型" value={subpayload.standardized_patient?.hair_styles} />
                                        <Input label="髮色" value={subpayload.standardized_patient?.hair_color} />
                                        <Input label="聲紋" value={subpayload.standardized_patient?.voiceprint} />
                                        <Input label="氣色" value={subpayload.standardized_patient?.complexion} />
                                        <Input label="服裝" value={subpayload.standardized_patient?.clothing_style} />
                                        <Input label="其他" value={subpayload.standardized_patient?.other} />
                                    </div>

                                </div>
                            </div>
                        </>
                    }
                </div>
            </div>
        </>
    )
}