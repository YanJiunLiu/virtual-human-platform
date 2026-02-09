//import { useState } from 'react'
import { useState } from "react"
import { Outlet } from 'react-router-dom';
import config from '../../config';
import Modal from '../../components/Modal'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faRightToBracket, faUserCircle } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import { Btn } from "../../components/OSCE-unit";

export default () => {
    const [showModal, setShowModal] = useState(false)
    const navigate = useNavigate();
    const { adminInfoData, logout } = useAuth();

    const sendHandler = async () => {
        // Perform logout logic here (e.g., clear tokens, update state)
        // After logout, navigate to the login page
        await logout();
        navigate('/login');
    };
    return (
        <>
            <div className="bg-osce-blue-5 h-full">
                <div className="flex flex-row justify-between bg-osce-blue-5 h-[60px] items-center px-[75px]">
                    <div>
                        <img src={`${config.IMG_PATH}img/logo-app.png`} alt="Logo" className='w-[160px] h-[35px]' />
                    </div>
                    <div className="text-white flex gap-x-[10px] items-center">
                        <FontAwesomeIcon icon={faUserCircle} />
                        <span>{adminInfoData?.account} {adminInfoData?.username}</span>
                        <button className="bg-none " onClick={() => {
                            setShowModal(true)
                        }
                        }>
                            <FontAwesomeIcon icon={faRightToBracket} />
                        </button>
                    </div>
                </div>
                <Outlet />

            </div>

            <Modal
                maxWidth={400}
                maxHeight={180}
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                bodyContent={
                    <div className='flex flex-col items-center'>
                        <h1 className='text-center text-[20px] font-bold '>是否登出帳號</h1>
                        <hr className="border-osce-gray-2 w-full my-[20px]" />
                        <div className='flex flex-col gap-2 items-center'>
                            <span className='text-osce-gray-3 text-[20px] font-[500]'>目前登入學號</span>
                            <span className='text-osce-gray-3 text-[20px] font-[500]'>{adminInfoData?.account}</span>
                        </div>
                    </div>
                }
                footerBtns={
                    <>
                        <Btn
                            color="gray"
                            icon={faArrowLeft}
                            text="取消"
                            click={() => {
                                setShowModal(false)
                            }}
                        />
                        <Btn
                            color="blue"
                            icon={faRightToBracket}
                            text="確定"
                            click={() => {
                                sendHandler()
                                setShowModal(false)
                            }}
                        />
                    </>
                }
            />
        </>
    )
}

