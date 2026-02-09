import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { useNavigate, useLocation } from 'react-router-dom';
//import { useAdminData } from './context/DataContext';
import { faCalendar, faUser, faUsers, faBook, faList, faUserDoctor, faClockRotateLeft, faFile } from '@fortawesome/free-solid-svg-icons'

type MenuItems = {
    txt: string;
    icon: IconDefinition
    path: string
    enable: boolean
};
type MenuGroup = MenuItems[][];


export default () => {
    const navigate = useNavigate();
    //const { adminData, setAdminData } = useAdminData()
    const location = useLocation();
    const [menuItems] = useState<MenuGroup>(
        [
            [
                { txt: "測驗規劃", icon: faCalendar, path: "/main", enable: false }
            ], [
                { txt: "使用者", icon: faUser, path: "/users", enable: true },
                { txt: "群組", icon: faUsers, path: "/group", enable: true }
            ], [
                { txt: "教案管理", icon: faBook, path: "/tests", enable: true },
                { txt: "科別管理", icon: faList, path: "/department", enable: true },
                { txt: "標病管理", icon: faUserDoctor, path: "/disease", enable: true },
                { txt: "病史管理", icon: faClockRotateLeft, path: "/histroy", enable: true }
            ], [
                { txt: "評估", icon: faClockRotateLeft, path: "/assessment", enable: false },
                { txt: "報告", icon: faFile, path: "/report", enable: false }
            ],
        ]
    )
    /*
        useEffect(()=>{
        },[location.pathname])
    */
    return (
        <div className='ml-[45px] mt-[50px]'>
            <div className='text-white w-[165px]'>
                {
                    menuItems.map((_group: MenuItems[], index_g: number) =>
                        <ul className='flex flex-col gap-2 py-1 ' key={"menu-group-" + index_g}>
                            {
                                _group.map((item: MenuItems, index_i: number) =>
                                    <li key={"menu-item-" + index_i}>
                                        <button
                                            disabled={!item.enable}
                                            className={`w-full text-left left-menu-item  ${!item.enable && 'text-gray-2'}  ${location.pathname === item.path ? 'on' : ''}`}
                                            onClick={(/*event: React.MouseEvent<HTMLLIElement, MouseEvent>*/) => {
                                                if (item.enable) {
                                                    navigate(`./${item.path}`)
                                                    //console.log(location);
                                                }
                                            }}
                                        >
                                            <FontAwesomeIcon icon={item.icon} className='mx-3' />
                                            {item.txt}
                                        </button>
                                    </li>
                                )
                            }
                            {
                                index_g != menuItems.length - 1 &&
                                <hr className='border-t-1 border-osce-blue-4 mx-[30px]' />
                            }
                        </ul>
                    )
                }
            </div>
        </div>
    )
}

