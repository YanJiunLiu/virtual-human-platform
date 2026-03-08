type TableRow = {
    text: string, state: boolean[], commit: string
}
type TableData = {
    title: string
    row: TableRow[]
}
const tdata: TableData[] = [
    {
        title: "病史詢問（是否做到/問及下列項目）",
        row: [
            { text: "考生自我介紹", state: [false, false, true], commit: "備註資料" },
            { text: "病人身份確認", state: [false, false, true], commit: "備註資料" },
            { text: "主訴", state: [false, false, true], commit: "備註資料" },
            { text: "牙科病史", state: [false, false, true], commit: "備註資料" },
            { text: "口腔衛生習慣", state: [false, false, true], commit: "備註資料" },
            { text: "全身性醫學病史", state: [false, false, true], commit: "備註資料" },
            { text: "家族牙科與罄學病史", state: [false, false, true], commit: "備註資料" }
        ]
    }, {
        title: "病情說明（配合相關檢查資料與檢驗報告）",
        row: [
            { text: "口內照", state: [false, false, true], commit: "備註資料" },
            { text: "根尖片", state: [false, false, true], commit: "備註資料" },
            { text: "牙周檢查與相關測試", state: [false, false, true], commit: "備註資料" }
        ]
    }, {
        title: "醫病溝通能力",
        row: [
            { text: "溝通技巧", state: [false, false, true], commit: "備註資料" },
            { text: "同理心", state: [false, false, true], commit: "備註資料" }
        ]
    }
]

const block = (data: TableData) =>
    <>
        <tr>
            <td><span className="font-[700]">{data.title}</span></td>
        </tr>
        {
            data.row.map((item: TableRow, index: number) =>
                <tr key={`tDataRow_${index}`}>
                    <td>
                        <span>{item.text}</span>
                    </td>
                    <td>
                        <div className={`w-[15px] h-[15px] rounded-full ${item.state[0] ? 'bg-osce-blue-5' : 'bg-osce-gray-2'}`}></div>
                    </td>
                    <td>
                        <div className={`w-[15px] h-[15px] rounded-full ${item.state[1] ? 'bg-osce-blue-5' : 'bg-osce-gray-2'}`}></div>
                    </td>
                    <td>
                        <div className={`w-[15px] h-[15px] rounded-full ${item.state[2] ? 'bg-osce-blue-5' : 'bg-osce-gray-2'}`}></div>
                    </td>
                    <td>
                        <span>註記</span>
                    </td>
                </tr>
            )}
    </>

export default () => {
    return (
        <table className='table-auto w-full [&_td]:h-[30px] '>
            <thead className="border-b-1 border-b-osce-gray-2 ">
                <tr>
                    <td className=''></td>
                    <td className='w-[40px]'>沒有<br />做到</td>
                    <td className='w-[40px]'>部分<br />做到</td>
                    <td className='w-[40px]'>完全<br />做到</td>
                    <td className='w-[100px]'>註解</td>
                </tr>
            </thead>
            <tbody className='[&>tr:nth-child(even)]:bg-osce-gray-1 [&_td]:p-[10px] font-normal'>

                {
                    tdata.map((item: TableData) => block(item))
                }

            </tbody>
        </table>
    )
}