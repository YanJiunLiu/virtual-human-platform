import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRightToBracket, faPenToSquare, faChartPie } from '@fortawesome/free-solid-svg-icons'
import Modal from '../../../components/Modal'
import { useNavigate } from 'react-router-dom';
import config from '../../../config';
import { useUserData } from '../context/DataContext';
import { useAuth } from '../../../context/AuthContext';
import { Btn } from '../../../components/OSCE-unit';

type LoginProps = {
    type: string,
    logining?: (username: string, password: string) => void
}

const localStorage = window.localStorage;

export default (props: LoginProps) => {


    const [showModal, setShowModal] = useState(false)
    const [account, setAccount] = useState<string | undefined>("0800031")
    const [password, setPassowrd] = useState<string | undefined>()
    const [showType, setShowType] = useState<boolean>(false)
    const { userData, setUserData } = useUserData();
    const navigate = useNavigate();

    const { userLogin, userInfoData } = useAuth();


    const typeSelectHandler = (type: string) => {
        setUserData({
            ...userData,
            UserID: userInfoData?.account,
            UserName: userInfoData?.username,
            lessonType: type
        })
        localStorage.setItem('lessonType', type);
        navigate('/main')
    }

    const sendHandler = async () => {
        const isLogin = await userLogin(account ? account : "", password ? password : "");
        if (isLogin) {
            setShowType(true)
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
                            props.type === 'user' ?
                                <img src="./img/logo-d.png" alt="Logo" className='w-[160px] h-[40px]' />
                                :
                                <img src="./img/logo.png" alt="Logo" className='w-[100px] h-[35px]' />
                        }
                    </div>

                    {
                        showType == false &&
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
                    }
                    {
                        showType == true &&
                        <>
                            <button
                                className="w-full flex place-content-between items-center px-[10px] py-[12px] bg-osce-blue-5 text-white rounded-md"
                                onClick={() => { typeSelectHandler("exam") }}
                            >
                                <FontAwesomeIcon icon={faPenToSquare} />
                                <span>正式考試區</span>
                            </button>
                            <button
                                className="w-full flex place-content-between items-center px-[10px] py-[12px] bg-osce-blue-4 text-white rounded-md"
                                onClick={() => { typeSelectHandler("practice") }}
                            >
                                <FontAwesomeIcon icon={faChartPie} />
                                <span>練習區</span>
                            </button>
                        </>
                    }
                </span>
            </div>

            <Modal
                maxWidth={400}
                maxHeight={180}
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                bodyContent={
                    <div className='flex flex-col items-center'>
                        <h1 className='text-center text-[20px] font-bold'>登入成功</h1>
                    </div>
                }
                footerBtns={
                    <>
                        <Btn color='gray' text='取消' click={() => { setShowModal(false) }} />
                        <Btn color='blue' text='確定' click={() => {
                            setShowModal(false)
                            props.logining && props.logining('username', 'password');
                            navigate('/main')
                        }} />
                    </>
                }
            />

        </>
    )
}

