

import { OSCESelect, OSCEInput } from '../../../components/OSCE-unit'
import { useCreateTest } from '../context/CreateTestContext';
import { useEffect, useState } from "react"
import { useNavigate } from 'react-router-dom';
import { adminListDepartments } from '../../../api';
import { useAuth } from '../../../context/AuthContext';
import RichTextEditor from '../../../components/RichTextEditor';

export default () => {
    const {replacePayload, payload} = useCreateTest();
    const [subpayload, setSubpayload] = useState<createTest>(payload);
    const navigate = useNavigate();
    const {token} = useAuth()
    const [dept, setDept] = useState<Department[]>([]);
    const options = [
        '病史詢問及病情說明',
        '病情說明及醫病溝通',
        '診斷及治療計畫說明',
        '臨床處理與衛教',
        '理學檢查',
        '技能操作',
    ];
    const handleCheckboxChange = (description: string, checked: boolean) => {
        setSubpayload(prev => {
        // 保證prev是Step1Payload物件
        const currentCriteria = (prev as createTest).criteria || [];

        if (checked) {
            // 新增，不重複加入
            if (!currentCriteria.some(c => c.description === description)) {
            return {
                ...prev,
                criteria: [...currentCriteria, { description }],
            };
            }
            } else {
                // 刪除該description
                return {
                ...prev,
                criteria: currentCriteria.filter(c => c.description !== description),
                };
            }
            return prev; // 無變動回傳原狀態
        });
    };
     const isChecked = (description: string): boolean => {
        const currentCriteria = (subpayload as createTest).criteria || [];
        return currentCriteria.some(c => c.description === description);
    };
    useEffect(() => {
            if (!token) {
            alert("請先登入")
            navigate('/login')
        }
        const fetchData = async() => {
            const res = await adminListDepartments({token:token}) as DepartmentList
            setDept(res.results)
        }
        fetchData()
    }, [])
    useEffect(() => {
        // 每次subpayload改變時更新全局payload
        replacePayload(subpayload);
    }, [subpayload]);
    return (
        <div className='flex'>

            <div className='p-[20px]'>
                <div className='flex mb-3'>
                    <div className='title w-[80px]'>教案類別</div>
                    {/* <OSCESelect list={dept} onchange={()=>{}}/> */}
                    <select
                        className={`min-w-[100px] h-[40px] appearance-none px-3 border-1 rounded-sm border-osce-gray-2 bg-osce-gray-1 shadow-none focus:shadow-none focus:outline-none`}
                        value={subpayload.department?.id}
                        onChange={(e) => { 
                            setSubpayload(prev => ({
                                ...prev, department: { id: e.target.value, department_name: dept.find(d => parseInt(d.id) === parseInt(e.target.value))?.department_name }
                            }));
                        }}
                        >
                        <option>----</option>
                        {
                            dept.map((item: Department) => <option key={`${item.id}`} value={item.id} >{item.department_name}</option>)
                        }
                    </select>
                </div>
                <div className='flex mb-3'>
                    <div className='title w-[80px]'>教案標題</div>
                    <OSCEInput onchange={(e) => { setSubpayload(prev => ({ ...prev, topic: e.target.value })); }} value={subpayload.topic} />
                </div>
                <div className='flex mb-3'>
                    <div className='title w-[80px]'>站別</div>
                    <OSCESelect list={[{txt:"01", value:"01"}, {txt:"02", value:"02"}]}  onchange={(e) => { setSubpayload(prev => ({ ...prev, station: {name:e.target.value} })); }} value={subpayload.station?.name}/>
                </div>
                <div className='flex mb-3'>
                    <div className='title w-[80px]'>測驗項目</div>
                    <OSCEInput  onchange={(e) => { setSubpayload(prev => ({ ...prev, item: e.target.value })); }} value={subpayload.item}/>
                </div>
                
                <div className='flex flex-wrap mb-3 '>
                    <div className='title w-[80px]'>測驗性質</div>
                      {options.map(option => (
                            <div className="m-2" key={option}>
                            <label>
                                <input
                                type="checkbox"
                                checked={isChecked(option)}
                                onChange={e => handleCheckboxChange(option, e.target.checked)}
                                />{' '}
                                {option}
                            </label>
                            </div>
                        ))}
                    </div>
                <div className='flex mb-3'>
                    <div className='title w-[80px]'>教案時間</div>
                    <OSCESelect list={[
                            {txt:"1", value:"1"}, 
                            {txt:"2", value:"2"},
                            {txt:"3", value:"3"},
                            {txt:"4", value:"4"},
                            {txt:"5", value:"5"},
                            {txt:"6", value:"6"},
                            {txt:"7", value:"7"},
                            {txt:"8", value:"8"},
                            {txt:"9", value:"9"},
                        ]} 
                        onchange={(e) => { setSubpayload(prev => ({ ...prev, timer_number: e.target.value })); }} 
                        value={subpayload.timer_number} />
                    <OSCESelect list={[
                            {txt:"分鐘", value:"分鐘"}, 
                            {txt:"小時", value:"小時"}
                        ]} 
                        onchange={(e) => { setSubpayload(prev => ({ ...prev, timer_unit: e.target.value })); }}
                        value={subpayload.timer_unit} />
                </div>

                <div className='flex mb-3'>
                    <div className='title w-[80px]'>考生指引</div>
                    <RichTextEditor setSubpayload={setSubpayload} payload={subpayload}/>
                </div>
            </div>
        </div>
    )
}