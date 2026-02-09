import { useEffect } from "react"
import LeftMenu from "./LeftMenu";
import { useNavigate } from 'react-router-dom';
//import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useAuth } from "../../context/AuthContext";
import { Outlet } from 'react-router-dom';
//import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { usePageData } from './context/DataContext';

export default () => {
    const navigate = useNavigate();
    const { token } = useAuth()
    const { topLeftBtns } = usePageData();
    //const { setTopLeftBtns } = usePageData();
    //const location = useLocation();

    useEffect(() => {
        if (!token) {
            alert("請先登入")
            navigate('/login')
        }
    }, [])



    return (
        <div className="flex w-[calc(100%-30px)] min-h-[800px] h-[calc(100%-80px)]">
            <LeftMenu />
            <div className="flex flex-col w-full h-full max-w-[calc(100%-200px)]">
                <div className="mb-3 flex justify-between">
                    <div className="flex">
                        <input placeholder="Search" className="bg-white rounded-3xl px-5 py-3 w-[200px] h-[40px] mr-3" />
                        <input placeholder="Filters" className="bg-white rounded-3xl px-5 py-3 w-[200px] h-[40px] mr-3" />
                    </div>
                    <div>
                        {topLeftBtns}
                    </div>
                </div>
                <Outlet />
            </div>
        </div>)
}