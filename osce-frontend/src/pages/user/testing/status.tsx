
import { useEffect } from 'react'
import config from '../../../config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useUserData } from '../context/DataContext';
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';

export default () => {
    const { userData } = useUserData();
    useEffect(() => {

        return
    }, [])

    return (
        <div className="bg-osce-gray-5 p-[20px] w-full h-full">
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
                                <FontAwesomeIcon className='text-osce-blue-5 mr-[10px]' icon={faCircleCheck} />
                                <span>病史詢問及病情說明</span>
                            </li>
                            <li>
                                <FontAwesomeIcon className='text-osce-blue-5 mr-[10px]' icon={faCircleCheck} />
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
    )
}
