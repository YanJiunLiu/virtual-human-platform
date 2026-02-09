import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../../config';
import Navbar from "../navbar";
import ImgLoader from '../../../components/imgLoader';
import { useUserData } from '../context/DataContext';
import { useAuth } from '../../../context/AuthContext';
import { adminListDepartmentTests } from '../../../api';


const localStorage = window.localStorage;

export default () => {
    const { token } = useAuth();
     const navigate = useNavigate();
    const [pdata, setPdata] = useState<Department[]>([])
    const { userData, setUserData } = useUserData();

    useEffect(() => {
        if (!token) {
            alert("請先登入")
            navigate('/login')
        }
        const fetchData = async() => {
            const res = await adminListDepartmentTests({token:token}) as DepartmentList
            console.log(res)
            if (res.results.length > 0) {
                setPdata(res.results)
                if (userData?.lessonType) {
                    localStorage.setItem('lessonType', userData.lessonType);
                }
            }
            
        }
        fetchData() 
    }, [userData])

    return (
        <div className='bg-white'>
            <Navbar
                title="選擇教案"
                leftContent={<>
                    {
                        /*
                        <button className="bg-white rounded-2xl text-osce-blue-5" onClick={() => {
                            navigate("../score")
                            
                        }}>測驗結果</button>
                        */
                    }
                    {
                        userData?.lessonType == "practice" &&
                        <button className="bg-white rounded-2xl text-osce-blue-5" onClick={() => {
                            setUserData({
                                ...userData,
                                lessonType: "exam"
                            })
                        }}>切換到正式考試區</button>
                    }
                    {
                        userData?.lessonType == "exam" &&
                        <button className="bg-white rounded-2xl text-osce-blue-5" onClick={() => {
                            setUserData({
                                ...userData,
                                lessonType: "practice"
                            })
                        }}>切換到練習區</button>
                    }
                </>
                }
            />
            {
                pdata.map((item: Department) =>
                    <div key={`department-${item.id}`} className="flex-wrap mx-auto">
                        <h2 className="text-osce-blue-4  w-full max-w-[1400px] py-3 px-[20px]  mx-auto">{item.department_name}</h2>
                        <div className='w-full bg-osce-gray-1'>
                            <div className="flex gap-x-[20px] gap-y-[20px] p-[20px] flex-wrap  w-full max-w-[1400px] mx-auto">
                                {
                                    item.tests?.map((test, index) =>
                                        <div
                                            className='w-[255px] h-[320px] cursor-pointer relative overflow-hidden rounded-[20px]'
                                            onClick={() => {
                                                console.log(test)
                                                if (!test.complete) {
                                                    setUserData({
                                                        ...userData,
                                                        page: "profile",
                                                        tid: test.id,
                                                        lessonImg: test.standardized_patient?.head_shot
                                                    })
                                                }
                                            }}
                                            key={`test-${index}`}
                                        >

                                            <ImgLoader
                                                className="w-full h-full object-cover animate-wiggle"
                                                src={test.standardized_patient?.head_shot ?? ""}
                                                alt={test.patient?.name}
                                            />
                                            {
                                                test?.complete &&
                                                <div className="w-full h-full absolute flex top-0 justify-center items-center bg-osce-blue-5 opacity-90">
                                                    <img className='w-[50px] h-[50px]' src={`${config.IMG_PATH}img/done_icon.svg`} alt="" />
                                                </div>
                                            }
                                            <div className="bg-white/80 absolute bottom-0 w-full p-[10px]">{test.topic}</div>
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                )
            }

        </div>
    )


}

