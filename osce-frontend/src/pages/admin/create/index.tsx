

import { faArrowLeft, faArrowRight, faFloppyDisk } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router-dom';
import Stepper from './stepper';
import { useEffect, useState } from 'react';
import Step1 from './step1';
import Step2 from './step2';
import Step3 from './step3';
import Step4 from './step4';
import Step5 from './step5';
import Step6 from './step6';
import Step7 from './step7';
import { useCreateTest } from '../context/CreateTestContext';
import { adminCreateTests } from '../../../api';
import { useAuth } from '../../../context/AuthContext';

const title: string[] = ["教案描述", "標病選擇", "病史設定", "檢查資料上傳", "檢查資料標記", "診斷與治療計畫", "評估設定與最終確認"]

type CreateProp = {
    dataID?: string
}

export default ({ dataID }: CreateProp) => {
    const navigate = useNavigate();
    const [step, setStep] = useState<number>(0);
    const { payload, replacePayload } = useCreateTest();
    const { token } = useAuth()

    useEffect(() => {
        //這邊要改用id取資料
        if (dataID) {
            setStep(-1)
            //fetch data and replace payload
            adminCreateTests("get", { id: dataID, token: token }).then(res => {
                replacePayload(res as createTest)
                setStep(0)
            })

        }
    }, [dataID]);

    const sendHandler = async () => {
        if (Object.keys(payload).length === 0) {
            alert("請先填寫資料");
        }
        if (token) {
            const mode: "update" | "create" = dataID ? "update" : "create"
            console.log(mode, payload)
            const res = await adminCreateTests(mode, { id: (payload as createTest).id, token: token, data: payload }) as createTest
            if (res) {
                replacePayload({});
                alert("建立成功")
                if (dataID) {
                    window.location.reload();
                } else {
                    navigate(-1)
                }
            }
        }
    }

    return (
        <div className='w-[calc(100%-40px)] max-w-350 mx-auto  h-full '>

            <div className='flex w-full justify-between items-center h-15'>
                <button className="text-osce-blue-5 ml-2 w-25 h-10 rounded-2xl bg-white"
                    onClick={() => {
                        replacePayload({});
                        if (dataID) {
                            
                        } else {
                            navigate("/tests");
                        }
                    }}
                >
                    <FontAwesomeIcon className="pr-1" icon={faArrowLeft} />
                    離開
                </button>
                <Stepper steps={7} currentStep={step} />
                <button className="text-osce-blue-5 ml-2 w-25 h-10  rounded-2xl bg-white"
                    onClick={() => {
                        sendHandler()
                    }}
                >
                    <FontAwesomeIcon className="pr-1" icon={faFloppyDisk} />
                    儲存
                </button>
            </div>
            <div className=" flex flex-col items-center justify-center bg-gray-50 p-5 rounded-[20px] ">

                <div className="space-x-4 flex justify-between items-center w-full mb-3">
                    <div className='w-25'>
                        {
                            step != 0 &&
                            <button
                                onClick={() => setStep((s) => Math.max(s - 1, 0))}
                                className="px-4 py-2 w-10 h-10 bg-osce-blue-5 rounded-full text-white"
                            >
                                <FontAwesomeIcon icon={faArrowLeft} />
                            </button>
                        }
                    </div>
                    <div className='text-osce-blue-5 text-[20px] font-blod'>{title[step]}</div>
                    <div className='w-25'>
                        {
                            step != title.length - 1 &&
                            <button
                                onClick={() => setStep((s) => Math.min(s + 1, 6))}
                                className="px-4 py-2 w-10 h-10 bg-osce-blue-5 rounded-full text-white"
                            >
                                <FontAwesomeIcon icon={faArrowRight} />
                            </button>
                        }
                    </div>
                </div>
                <div className='px-[70px] w-full'>
                    {
                        step == 0 ?
                            <Step1 /> :
                            step == 1 ?
                                <Step2 /> :
                                step == 2 ?
                                    <Step3 /> :
                                    step == 3 ?
                                        <Step4 /> :
                                        step == 4 ?
                                            <Step5 /> :
                                            step == 5 ?
                                                <Step6 /> :
                                                step == 6 ?
                                                    <Step7 /> :
                                                    <></>
                    }
                </div>
            </div>
        </div>
    )
}