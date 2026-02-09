import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRightToBracket } from '@fortawesome/free-solid-svg-icons'
import Modal from '../../../components/Modal'
import { useNavigate } from 'react-router-dom';
import config from '../../../config';
import { useAuth } from '../../../context/AuthContext';

export default () => {

    const [showModal, setShowModal] = useState(false)
    const [account, setAccount] = useState<string | undefined>("")
    const [password, setPassowrd] = useState<string | undefined>("")
    const navigate = useNavigate();
    const { adminLogin } = useAuth();

    const sendHandler = async () => {
        const isLogin = await adminLogin(account ? account : "", password ? password : "");
        if (isLogin) {
            setShowModal(true)
            setTimeout(() => {
                navigate('/tests')
            }, 800);
        }
    }

    return (
        <>
            <div
                className={`bg-cover bg-center text-c bg-no-repeat h-screen flex flex-col items-center justify-center`}
                style={{ backgroundImage: `url(${config.IMG_PATH}img/bg.jpg)` }}
            >
                <span className='bg-white w-[380px] max-h-[240px] rounded-[20px] p-[20px] grid gap-3' >
                    <div className='flex flex-row'>
                        {
                            <img src="./img/logo.png" alt="Logo" className='w-[100px] h-[35px]' />
                        }
                    </div>

                    <>
                        <input
                            className="w-full border border-gray-400 rounded-1 text-gray-900 p-2"
                            placeholder='帳號'
                            value={account}
                            onChange={event => { setAccount(event.target.value) }}
                            onKeyUp={(event) => { if (event.key === "Enter") { sendHandler() } }}
                        />
                        <input
                            type='password'
                            className="w-full border border-gray-400 rounded-1 text-gray-900 p-2"
                            placeholder='密碼'
                            value={password ? password : ""}
                            onChange={event => { setPassowrd(event.target.value) }}
                            onKeyUp={(event) => { if (event.key === "Enter") { sendHandler() } }}
                        />
                        <button
                            className="w-full flex place-content-between items-center px-[10px] py-[12px] bg-osce-blue-5 text-white rounded-md"
                            onClick={() => { sendHandler() }}
                        >
                            <FontAwesomeIcon icon={faRightToBracket} />
                            <span>登入</span>
                        </button>
                    </>


                </span>
            </div>

            <Modal
                maxWidth={400}
                maxHeight={80}
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                bodyContent={
                    <div className='flex justify-center items-center'>
                        <h1 className='text-center text-[20px] font-bold text-osce-gray-3'>登入成功</h1>
                    </div>
                }
            />
        </>
    )
}


