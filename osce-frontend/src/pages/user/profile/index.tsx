
//import AppBar from "../appbar"

import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import Navbar from "../navbar";
import TitleBox from "../titleBox";
import { useEffect, useState } from 'react';
import { useUserData } from '../context/DataContext';
import ImgLoader from '../../../components/imgLoader';
import { userGetCase } from "../../../api"
import { useAuth } from '../../../context/AuthContext';
import { useWebRTC } from '../context/WebRTCContext';

export default () => {
    const { token } = useAuth()
    const { connect, isConnected, status } = useWebRTC();
    const navigate = useNavigate();
    const [pData, setPData] = useState<createTest>({});
    const { userData, setUserData } = useUserData();


    useEffect(() => {
        if (token && pData.standardized_patient && pData.standardized_patient.id && pData.standardized_patient.head_shot) {
            connect({
                patientId: pData.standardized_patient.id,
                imageBase64: pData.standardized_patient.head_shot,
                duration: 10,
                token: token
            });
        }
    }, [pData.standardized_patient, token]);

    useEffect(() => {
        console.log(userData)
        if (userData?.tid) {
            // userGetPatientProfile({ tid: userData?.tid }).then((result) => {
            //     const res = result as { img: string, content: string, currenttimes: number };
            //     setUserData({
            //         ...userData,
            //         currenttimes: res.currenttimes
            //     })
            //     setPData(res)
            // })
            if (!token) {
                alert("請先登入")
                navigate('/login')
            }
            const fetchData = async () => {
                const res = await userGetCase({ token: token, id: userData?.tid }) as createTest
                console.log(res)
                setUserData({
                    ...userData,
                    tests: res,
                    currenttimes: res.currenttimes
                })
                setPData(res)
            }
            fetchData()
        }
    }, [userData?.tid])

    return (
        <div className="bg-osce-gray-1 h-full">
            <Navbar
                title="第01站-病史詢問與病情說明牙周病"
                leftContent={
                    <>
                        <button className="bg-white rounded-2xl text-osce-blue-5" onClick={() => {
                            setUserData({
                                ...userData,
                                page: "menu"
                            })
                        }}>回到教案選擇</button>
                        <button className="bg-white rounded-2xl text-osce-blue-5" onClick={() => {
                            setUserData({
                                ...userData,
                                page: "score"
                            })
                        }}>測驗結果</button>
                    </>
                }
            />
            <TitleBox
                leftContent={
                    <>
                        <h6 className="text-osce-blue-4 mb-2">第01站</h6>
                        <h2 className="text-[30px]">{pData.topic}</h2>
                    </>
                }
                rightContent={
                    <>
                        <h6 className="text-gray-400 mb-2">測驗時間</h6>
                        <h2 className="text-[30px]">{`${pData.timer_number}${pData.timer_unit}`}</h2>
                    </>
                }
            />
            <div className="mx-auto w-full max-w-[1400px]">
                <hr className="border-osce-gray-2" />
                <div className="flex mt-[40px] px-[20px] justify-between">
                    <div className="flex">
                        <div className="sm:hidden md:block">
                            <ImgLoader
                                className="w-[220px] h-[275px] object-cover rounded-[20px] mr-[40px]"
                                src={`${pData.standardized_patient?.head_shot}`}
                                alt="病患照片"
                            />
                        </div>

                        <div className='mx-[20px]' >
                            {/* <div dangerouslySetInnerHTML={{ __html: pData.content }}></div> */}
                            <div>
                                <div className="mb-[40px]">
                                    <h6 className="text-osce-gray-3 mb-1">背景資料</h6>
                                    <p>{`${pData.standardized_patient?.age}歲${pData.standardized_patient?.last_name}${pData.standardized_patient?.title}`}</p>
                                </div>
                                <div className="mb-[40px]">
                                    <h6 className="text-osce-gray-3 mb-1">測驗主題</h6>
                                    <span>病史介紹</span>
                                    <ul className="list-disc pl-5 leading-[150%]">
                                        <li>自我介紹及病人辨識</li>
                                        <li>請進行詳細的病史詢問及病情說明。</li>
                                        <li>不需進行口內檢查。</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="mb-[40px]">
                                <h6 className="text-osce-gray-3 mb-1">AI操作說明</h6>
                                <ul className="list-disc pl-5 leading-[150%]\">
                                    <li>自我介紹、病人辨識、病史詢問請與AI進行問答。</li>
                                    <li>病情說明時請先以觸控筆點擊文件上所要講解的區域</li>
                                    <li>後再進行說明。</li>
                                    <li>結束時請按「完成測試」按鈕並提交。</li>
                                </ul>
                            </div>
                        </div>

                    </div>
                    <div>
                        <div className="flex flex-col justify-between min-w-[400px] min-h-[400px] bg-white p-[40px] rounded-[20px]">
                            <div className="mb-[40px]">
                                <h6 className="text-osce-gray-3 mb-2">測驗考生</h6>
                                <h1 className="text-osce-gray-4 text-[30px]">{userData?.UserName}</h1>
                            </div>
                            <div className="mb-[40px]">
                                <h6 className="text-osce-gray-3 mb-2">準考證編號</h6>
                                <h1 className="text-osce-gray-4 text-[30px]">{userData?.UserID}</h1>
                            </div>
                            <div >
                                <button
                                    className="flex bg-osce-blue-5 text-white rounded-2xl w-full justify-between"
                                    onClick={() => {
                                        if (isConnected) {
                                            setUserData({
                                                ...userData,
                                                page: "testing"
                                            })
                                        }
                                    }}
                                    disabled={!isConnected}
                                    style={{ opacity: isConnected ? 1 : 0.5, cursor: isConnected ? 'pointer' : 'not-allowed' }}
                                >
                                    <span>{isConnected ? "開始測驗" : status || "連線中..."}</span>
                                    <FontAwesomeIcon icon={faArrowRight} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}

