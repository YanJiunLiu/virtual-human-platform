interface rowProps {
    children: React.ReactNode;
    className?: string; // 可額外傳入自定義樣式
}

const Row: React.FC<rowProps> = ({ children, className = "" }) => {
    return (
        <div className={`w-full flex justify-between mb-3 items-center text-gray-800 ${className} `}>
            {children}
        </div>
    );
};

type personInfoProps = {
    user: User
    setCurrentUser: React.Dispatch<React.SetStateAction<User>>;
}

export default ({ user, setCurrentUser }: personInfoProps) => {
    return (
        <>
            <Row className="py-3">
                <span>{
                    user.last_name  ? 
                        user.last_name  + 
                        (user.first_name ?? "")
                    :
                    "---"
                }</span>
                <span className="text-osce-blue-5">Participant</span>
            </Row>
            <Row>
                <span>活躍狀態</span>
                <input className="border-osce-gray-5" type="checkbox" checked={user.is_active } onChange={e =>  { 
                    setCurrentUser(prev => ({ ...prev, is_active: e.target.checked })); 
                }}/>
            </Row>
            <Row>
                <span>姓</span>
                <input className="w-[160px] p-1 rounded bg-white border border-osce-gray-5" defaultValue={user.last_name} onChange={e =>  { setCurrentUser(prev => ({ ...prev, last_name: e.target.value })); }}/>
            </Row>
            <Row>
                <span>名</span>
                <input className="w-[160px] p-1 rounded bg-white border border-osce-gray-5" defaultValue={user.first_name} onChange={e =>  { setCurrentUser(prev => ({ ...prev, first_name: e.target.value })); }}/>
            </Row>
            <Row>
                <span>別名</span>
                <input className="w-[160px] p-1 rounded bg-white border border-osce-gray-5" defaultValue={user.alias_name} onChange={e =>  { setCurrentUser(prev => ({ ...prev, alias_name: e.target.value })); }}/>
            </Row>
            <Row>
                <span>編號</span>
                <input className="w-[160px] p-1 rounded bg-white border border-osce-gray-5" defaultValue={user.serial} onChange={e =>  { setCurrentUser(prev => ({ ...prev, serial: e.target.value })); }}/>
            </Row>
            <Row>
                <span>系所</span>
                <input className="w-[160px] p-1 rounded bg-white border border-osce-gray-5" defaultValue={user.school_department?.name} onChange={e =>  { setCurrentUser(prev => ({ ...prev, school_department: {name:e.target.value }})); }}/>
            </Row>
            
            <Row className="flex-col items-start">
                <span className="mb-1">電子郵件</span>
                <input className="w-full p-1 rounded bg-white border border-osce-gray-5" defaultValue={user.email} onChange={e =>  { setCurrentUser(prev => ({ ...prev, email: e.target.value })); }}/>
            </Row>
            <Row>
                <span>角色</span>
                <select className="w-[160px]" value={user.role?.name} onChange={e =>  { 
                    setCurrentUser(prev => ({ ...prev, role:{name:e.target.value}  })); 
                }}>
                    <option value="Student">學生</option>
                    <option value="Stuff">教師</option>
                    <option value="Administrator">管理員</option>
                </select>
            </Row>
            <Row>
                <span>系統管理員</span>
                <input type="checkbox" checked={user.is_superuser} onChange={e =>  { 
                    setCurrentUser(prev => ({ ...prev, is_superuser: e.target.checked })); 
                }}/>
            </Row>
            <hr className="border-gray-300 my-3" />
            <Row className="flex-col items-start">
                <span className="mb-1">帳號</span>
                <input className="w-full p-1 rounded bg-white border border-osce-gray-5" defaultValue={user.account} />
            </Row>
            
        </>
    )
}