
import { useEffect } from 'react'
import config from '../../../config';
import Navbar from "../navbar";
import TitleBox from "../titleBox";
//import Report from "../testing/report";
//import Info from '../testing/info';
//import Complete from '../testing/complete';
//import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleExclamation, faCircleCheck } from '@fortawesome/free-solid-svg-icons'
//import Modal from '../../../components/Modal';
import { useUserData } from '../context/DataContext';
import TableRenderer from './tableRenderer';
//import CountdownTimer from '../../../components/countdownTimer';


//判斷使用者如果重新整理 將導回main頁面
/*
const navEntries = performance.getEntriesByType("navigation");
if (
    navEntries.length > 0 &&
    (navEntries[0] as PerformanceNavigationTiming).type === "reload"
) {
    window.open("./main", "_self")
}
*/


export default () => {
    const { userData } = useUserData();
    //const [showModal, setShowModal] = useState(false)
    useEffect(() => {

        return
    }, [])


    return (
        <>
            <div className="bg-osce-gray-1 font-[700] pb-5 min-h-full">
                <Navbar
                    title="第01站-病史詢問與病情說明牙周病"
                    rightContent={
                        <button className="bg-white rounded-2xl text-osce-red-5 font-[500]" onClick={() => { }}>
                            <FontAwesomeIcon icon={faCircleExclamation} className='px-1' />
                            <span>放棄測試</span>
                        </button>}
                />
                <TitleBox
                    leftContent={
                        <>
                            <h6 className="text-osce-blue-4 mb-2">第01站</h6>
                            <h2 className="text-[30px]">由上後牙</h2>
                        </>
                    }
                    rightContent={
                        <>
                            <h6 className="text-osce-blue-4 mb-2">第01站</h6>
                        </>
                    }
                />
                <hr className="border-osce-gray-2 max-w-[1400px] mx-auto" />
                <div className="flex w-full max-w-[1400px] mx-auto h-[80px] py-[20px] justify-between items-center px-[20px]">

                    <div>
                        <button
                            className="min-w-[130px] font-[500] bg-osce-blue-5 rounded-2xl text-white border-1 border-osce-blue-5 mr-1"
                            onClick={() => {
                                // setStater("info") 
                            }}>病史資料</button>
                        <button
                            className="min-w-[130px] font-[500] bg-osce-gray-1 rounded-2xl text-osce-blue-5 border-1 border-osce-blue-5 mr-1"
                            onClick={() => {
                                //setStater("report") 
                            }}>檢查資料</button>
                    </div>
                    <div>
                        <h6 className="text-osce-blue-4 mb-2">第01站</h6>
                    </div>
                </div>

                <div className="flex w-full max-w-[1400px] mx-auto px-[20px] md:max-h-[640px] ">
                    <div className="relative rounded-tl-[20px] rounded-bl-[20px] overflow-hidden w-1/2 max-h-full">
                        <div className="bg-osce-gray-5 p-[20px]">
                            <div className='flex border-b-1 border-b-osce-gray-2 mb-[30px]'>
                                <div className="mb-[35px] mr-[50px]">
                                    <h6 className="text-osce-gray-3 mb-2">測驗考生</h6>
                                    <h1 className="text-osce-gray-4 text-[24px]">{userData?.UserName}</h1>
                                </div>
                                <div className="mb-[35px]">
                                    <h6 className="text-osce-gray-3 mb-2">準考證編號</h6>
                                    <h1 className="text-osce-gray-4 text-[24px]">{userData?.UserID}</h1>
                                </div>
                            </div>
                            <div className='flex'>
                                <img className="object-cover w-[220px] h-[275px] mr-[20px]" src={`${config.IMG_PATH}${userData?.lessonImg}`} alt="虛擬病人" />
                                <div>
                                    <div className="mb-[35px] mr-[50px]">
                                        <h6 className="text-osce-gray-3 mb-2 ">測驗項目</h6>
                                        <span className="text-osce-gray-4 text-[16px]">病史詢問及病情說明</span>
                                    </div>
                                    <div className="mb-[35px] mr-[50px]">
                                        <h6 className="text-osce-gray-3 mb-2 ">測驗性質</h6>
                                        <ul className='space-y-2'>
                                            <li>
                                                <FontAwesomeIcon className='text-osce-blue-5 mr-[10px]' icon={faCircleCheck}/>
                                                <span>病史詢問及病情說明</span>
                                            </li>
                                            <li>
                                                <FontAwesomeIcon className='text-osce-blue-5 mr-[10px]' icon={faCircleCheck}/>
                                                <span>病情說明及醫病溝通</span>
                                            </li>
                                            <li className='flex items-center'>
                                                <div className='bg-white rounded-full w-[16px] h-[16px] mr-[10px] border-1 border-osce-blue-2'></div>
                                                <span>診斷及治療計畫說明</span>
                                            </li>
                                            <li className='flex items-center'>
                                                <div className='bg-white rounded-full w-[16px] h-[16px] mr-[10px] border-1 border-osce-blue-2'></div>
                                                <span>臨床處理與衛教</span>
                                            </li>
                                            <li className='flex items-center'>
                                                <div className='bg-white rounded-full w-[16px] h-[16px] mr-[10px] border-1 border-osce-blue-2'></div>
                                                <span>理學檢查</span>
                                            </li>
                                            <li className='flex items-center'>
                                                <div className='bg-white rounded-full w-[16px] h-[16px] mr-[10px] border-1 border-osce-blue-2'></div>
                                                <span>技能操作</span>
                                            </li>
                                        </ul>
                                    </div>
                                     <div className="mb-[35px] mr-[50px]">
                                        <h6 className="text-osce-gray-3 mb-2 ">測驗時間</h6>
                                        <span className="text-osce-gray-4 text-[16px]">六分鐘</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className="bg-white rounded-tr-[20px] rounded-br-[20px] px-[30px] py-[35px] overflow-hidden flex flex-col w-1/2 ">
                        <div className='flex justify-between '>
                            <div className='text-center w-full p-[10px]'>
                                <span>評分項目：（12項）</span>
                            </div>
                            <div className='text-center w-full p-[10px]'>
                                <span>評量考生</span>
                            </div>
                        </div>
                        <div className='overflow-y-auto'>
                            <TableRenderer/>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}
