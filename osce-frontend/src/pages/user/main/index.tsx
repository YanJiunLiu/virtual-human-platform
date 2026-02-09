import { useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import { useUserData } from '../context/DataContext';
import { initRecord } from "../sounder";

import Menu from '../menu';
import Profile from '../profile';
import Testing from '../testing';


const localStorage = window.localStorage;

export default () => {
    // const navigate = useNavigate();
    const { userData, setUserData } = useUserData();

    useEffect(() => {
        setUserData({
            ...userData,
            page:"menu",
            lessonType: localStorage.getItem('lessonType')?.toString()
        });
        initRecord();
    }, [])

    if (userData?.page == "menu") {
        return (<Menu/>)
    }
    
    if (userData?.page == "profile") {
        return (<Profile/>)
    }

    if (userData?.page == "testing") {
        return (<Testing/>)
    }
}

