

import { faArrowLeft, faArrowRight, faFloppyDisk } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router-dom';
import Stepper from './stepper';
import { useState } from 'react';
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

export default () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const {payload, replacePayload} = useCreateTest();
    const { token } = useAuth()

    const sendHandler = async(data:createTest | {}) => {
        if (Object.keys(data).length === 0) {
            alert("請先填寫資料");
        }
        if (token){
            const res = await adminCreateTests({token:token, data:data}) as createTest
            console.log(res)
            if (res){
                replacePayload({});
                alert("建立成功")
                navigate(-1)
            }
        }
    }

    return (
        <div className='w-[calc(100%-40px)] max-w-[1400px] mx-auto  h-full '>

            <div className='flex w-full justify-between items-center h-[60px]'>
                <button className="text-osce-blue-5 ml-[10px] w-[100px] h-[40px] rounded-2xl bg-white"
                    onClick={() => {
                        navigate(-1)
                    }}
                >
                    <FontAwesomeIcon className="pr-1" icon={faArrowLeft} />
                    離開
                </button>
                <Stepper steps={7} currentStep={step} />
                <button className="text-osce-blue-5 ml-[10px] w-[100px] h-[40px]  rounded-2xl bg-white"
                    onClick={() => {
                        sendHandler(payload)
                    }}
                >
                    <FontAwesomeIcon className="pr-1" icon={faFloppyDisk} />
                    儲存
                </button>
            </div>
            <div className=" flex flex-col items-center justify-center bg-gray-50 p-[20px] rounded-[20px] ">

                <div className="space-x-4 flex justify-between items-center w-full mb-3">
                    <div className='w-[100px]'>
                        {
                            step != 0 &&
                            <button
                                onClick={() => setStep((s) => Math.max(s - 1, 0))}
                                className="px-4 py-2 w-[40px] h-[40px] bg-osce-blue-5 rounded-full text-white"
                            >
                                <FontAwesomeIcon icon={faArrowLeft} />
                            </button>
                        }
                    </div>
                    <div className='text-osce-blue-5 text-[20px] font-[700]'>{title[step]}</div>
                    <div className='w-[100px]'>
                        {
                            step != title.length - 1 &&
                            <button
                                onClick={() => setStep((s) => Math.min(s + 1, 6))}
                                className="px-4 py-2 w-[40px] h-[40px] bg-osce-blue-5 rounded-full text-white"
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