
import { useEffect } from "react"
import { usePageData } from '../context/DataContext'
import { useNavigate } from 'react-router-dom';
import { BasicContainer } from "../../../components/OSCE-unit"
import { useAuth } from "../../../context/AuthContext"

export default () => {
    const { token } = useAuth()
    const { setTopLeftBtns } = usePageData();
    const navigate = useNavigate();
    useEffect(() => {
        if (!token) {
            alert("請先登入")
            navigate('/login')
        }
        setTopLeftBtns(<></>)
    }, [])

    return (
        <BasicContainer>
            building
        </BasicContainer>
    )
} 