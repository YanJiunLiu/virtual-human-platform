
import { useEffect } from 'react';
// import { useEffect, useState } from 'react';
// import { userGetMessages } from '../../../api';
import { useUserData } from '../context/DataContext';

type LogData = {
    LR: "left" | "right"
    mesg: string
    time: string
}
// type ResData = {
//     status: string
//     dialog: string
//     formatted_time: string
// }

const logData: LogData[] = [
    { LR: "left", mesg: "最近⼀個⽉右上後牙區刷牙時流⾎且有牙⿒搖晃。", time: "AM 10:00:00" },
    { LR: "right", mesg: "過去牙科治療經驗、最近牙⿒發作的症狀、近期就診經驗", time: "AM 10:00:30" },
    { LR: "left", mesg: "右上最後兩顆⼤⾅⿒刷牙的時候牙齦會流⾎，但這種症狀時有時無，已經持續 有⼀個⽉了，有去附近診所看過，醫師說我有牙周病，建議我到⼤醫院接受治療。 但我不想拔牙。", time: "AM 10:00:40" },
    { LR: "right", mesg: "是否有家族病史", time: "AM 10:00:50" },
    { LR: "left", mesg: "我有高血壓，家族有糖尿病的病史。", time: "AM 10:01:00" },
    { LR: "right", mesg: "是否有過敏史", time: "AM 10:01:10" },
    { LR: "left", mesg: "我對青黴素過敏。", time: "AM 10:01:20" },
    { LR: "right", mesg: "是否有其他疾病或正在服用的藥物", time: "AM 10:01:30" },
    { LR: "left", mesg: "我有高血壓，正在服用降壓藥。", time: "AM 10:01:40" },
]


/*
    account: "0800031"

dialog: " OO! Film"

formatted_time: "AM 09:07:52"

id: 73

inserttime: "2025-06-01T01:07:52.342Z"

status: "doctor"

tid: 1

token: "undefined"
*/
export default () => {
    const { userData } = useUserData();
    // const [logData, setLogData] = useState<LogData[]>([])
    useEffect(() => {
        if (userData?.tid && userData?.currenttimes) {
            // userGetMessages({ tid: userData.tid, times: userData.currenttimes }).then(res => {
            //     console.log(res)
            //     const _d = res as ResData[]
            //     let temp: LogData[] = []
            //     _d.map((item: ResData) => {
            //         temp.push({
            //             LR: (item.status == "doctor" ? "right" : "left"),
            //             mesg: item.dialog,
            //             time: item.formatted_time
            //         })
            //     })
            //     setLogData(temp)
            // })
        }
        return
    }, [userData?.tid])

    return (
        <div className="h-full flex flex-col-reverse overflow-y-auto">
            {
                logData.map((item: LogData, index: number) =>
                    <div key={`log-${index}`}
                        className={`
                            flex items-center justify-between w-full px-[20px] py-2 font-[400]
                            ${item.LR == "left" ? "flex-row" : "flex-row-reverse"} 
                    `}>
                        <div className={` 
                            px-[20px] py-[10px] rounded-[10px]
                            ${item.LR == "left" ? "bg-osce-gray-1" : "bg-osce-blue-6"} 
                        `}>{item.mesg}</div>
                        <span
                            className={`
                                font-[700] whitespace-nowrap
                                ${item.LR == "left" ? "ml-[20px]" : "mr-[20px]"} 
                            `}
                        >{item.time}</span>
                    </div>
                )
            }
        </div>
    )
}