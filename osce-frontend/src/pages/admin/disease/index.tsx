import React from "react"
import ImgLoader from "../../../components/imgLoader"
import { faTrashCan, faArrowLeft, faFloppyDisk, faPencil } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from "react"
import Modal from "../../../components/Modal"
import { BasicContainer, Btn } from "../../../components/OSCE-unit"
import { useAuth } from "../../../context/AuthContext"
import { adminStandardpatients } from "../../../api"
import ImageUploader from "../../../components/imageUpload"
import { usePageData } from '../context/DataContext'

type InputProps = {
    label: string
    value: string | number
    onchange: React.ChangeEventHandler<HTMLInputElement>
}

type SelectProps = {
    label: string
    value: string | number
    onchange: React.ChangeEventHandler<HTMLSelectElement>
    list: { txt: string, value: string }[]
    full?: boolean
}

const Input = ({ label, value, onchange }: InputProps) =>
    <div >
        <span className="p-[10px]">{label}</span>
        <input className="border-1 rounded-sm border-osce-gray-2 bg-osce-gray-1 max-w-[100px]  h-[40px] p-[10px]" value={value} onChange={onchange} />
    </div>

const Selected = ({ label, onchange, value, list, full }: SelectProps) =>
    <div className="flex">
        <span className="p-[10px] whitespace-nowrap">{label}</span>
        <select
            className={`min-w-[100px] ${full ? "w-full" : ""} h-[40px] appearance-none px-3 border-1 rounded-sm border-osce-gray-2 bg-osce-gray-1 shadow-none focus:shadow-none focus:outline-none`}
            value={value}
            onChange={onchange}
        >
            <option value="" >----</option>
            {
                list.map((item: { txt: string, value: string }, index: number) => <option key={`${item.txt}-${index}`} value={item.value}>{item.txt}</option>)
            }
        </select>
    </div>

export default () => {
    const [current, setCurrent] = useState<number | 'new' | null>(null)
    const [showModal, setShowModal] = useState(false)
    const [stdpt, setStdpt] = useState<standardizedpatient[]>([])
    const [stdptDetail, setStdptDetail] = useState<standardizedpatient | null>(null)
    const { token } = useAuth()

    const [message, setMessage] = useState<React.ReactNode>(<></>)
    const [modalBtns, setModalBtns] = useState<React.ReactNode>(<></>)
    const { setTopLeftBtns } = usePageData();

    useEffect(() => {
        if (token) {
            const fetchData = async () => {
                const res = await adminStandardpatients("list", { token: token }) as standardizedpatientList
                setStdpt(res.results)
            }
            fetchData()
            //設定右上角的按鈕
            setTopLeftBtns(<></>)
        }


    }, [token])

    const getItemData = async (selectedId: string) => {
        const res = await adminStandardpatients("get", { token: token, id: selectedId }) as standardizedpatient
        setStdptDetail(res)
    }

    //新增刪除複製修改的動作統一管理
    const actionStandardizedPatient = async (act: ("create" | "update" | "delete"), data: standardizedpatient) => {
        let check: boolean = false
        setMessage("處理中請稍後")
        setModalBtns(<></>)
        const res = await adminStandardpatients(act, { token: token, id: data.id, data: data }) as standardizedpatient
        if (res && (res as { department_name: string }).department_name != "") {
            setStdptDetail(res)
            const standardPantients = await adminStandardpatients("list", { token: token }) as standardizedpatientList
            setStdpt(standardPantients.results)
            check = true
        }
        return check
    }

    return (
        <BasicContainer>
            <div className="flex">

                <div className="flex-none basis-[240px]  ">
                    <button className="bg-osce-blue-5 text-white mb-2 rounderd rounded-2xl w-[240px]"
                        onClick={() => {
                            setStdptDetail(null)
                            setCurrent("new")
                        }}
                    >標病新增</button>
                    <ul className="max-h-[540px] overflow-y-auto">
                        {stdpt.map((item: standardizedpatient, index: number) =>
                            <li key={"disease_" + index}>
                                <section
                                    className={`w-[240px] h-[120px] ${index == current ? "bg-osce-blue-5 text-white" : "bg-osce-gray-1 "} rounded-md flex overflow-hidden mb-[10px]`}
                                    onClick={() => {
                                        setCurrent(index);
                                        getItemData(item.id ?? "");

                                    }}
                                >
                                    <ImgLoader className="w-full max-w-[100px] h-full object-cover" src={item.head_shot ?? ""} />
                                    <div className="flex flex-col p-1 w-full">
                                        <span className="grow flex items-center">
                                            {item.age}歲 {item.last_name} {item.title}
                                        </span>
                                    </div>
                                </section>
                            </li>
                        )}
                    </ul>
                </div>
                {
                    current != null &&
                    <div className="flex flex-col 2xl:mt-[85px] mx-[20px] grow min-h-[470px]">
                        <div className="flex h-full">
                            <div className="w-full max-w-[340px] hidden lg:block h-full object-cover shrink">
                                {
                                    <ImageUploader
                                        src={stdptDetail?.head_shot}
                                        onChange={(img => {
                                            if (img) {
                                                setStdptDetail((prev) => {
                                                    return { ...prev, head_shot: img.base64 }
                                                })
                                            }
                                        })} />
                                }
                            </div>
                            <div className="p-[30px] w-full overflow-y-auto  ">
                                <div className="flex flex-wrap gap-5">
                                    <Input label="年齡" value={stdptDetail?.age ?? 0}
                                        onchange={
                                            ((e) => {

                                                const val = e.target.value ? parseInt(e.target.value) : 0;
                                                // 允許空字串，或者非負整數
                                                if (/^([0-9]\d*)$/.test(val.toString())) {
                                                    setStdptDetail((prev) => ({ ...prev, age: val }));
                                                }
                                            })
                                        }
                                    />
                                    <Input label="姓氏" value={stdptDetail?.last_name ?? "-"}
                                        onchange={
                                            ((e) => {
                                                setStdptDetail((prev) => {
                                                    return { ...prev, last_name: e.target.value }
                                                })
                                            })
                                        }
                                    />
                                    <Selected label="性別" value={stdptDetail?.gender ?? "-"}
                                        onchange={
                                            ((e) => {
                                                setStdptDetail((prev) => {
                                                    return { ...prev, gender: e.target.value }
                                                })
                                            })
                                        }
                                        list={[{ txt: "女", value: "female" }, { txt: "男", value: "male" }]}
                                    />
                                    <Selected label="稱謂" value={stdptDetail?.title ?? "-"}
                                        onchange={
                                            ((e) => {
                                                setStdptDetail((prev) => {
                                                    return { ...prev, title: e.target.value }
                                                })
                                            })
                                        }
                                        list={[{ txt: "女士", value: "女士" }, { txt: "先生", value: "先生" }]}
                                    />
                                    <Selected label="職稱" value={stdptDetail?.job_title ?? "-"}
                                        onchange={
                                            ((e) => {
                                                setStdptDetail((prev) => {
                                                    return { ...prev, job_title: e.target.value }
                                                })
                                            })
                                        }
                                        list={[{ txt: "技術人員", value: "技術人員" }, { txt: "文書人員", value: "文書人員" }, { txt: "總監", value: "總監" }]}
                                    />
                                </div>
                                <hr className="border-osce-gray-2 my-[20px]" />
                                <div className="flex flex-wrap gap-x-2 gap-y-4 mb-[30px] [&>div]:basis-[49%]">
                                    <Selected full label="語系" value={stdptDetail?.language ?? "-"}
                                        onchange={
                                            ((e) => {
                                                setStdptDetail((prev) => {
                                                    return { ...prev, language: e.target.value }
                                                })
                                            })
                                        }
                                        list={[{ txt: "繁中", value: "繁中" }, { txt: "ENG", value: "ENG" }]}
                                    />

                                    <Selected full label="口氣" value={stdptDetail?.tone ?? "-"}
                                        onchange={
                                            ((e) => {
                                                setStdptDetail((prev) => {
                                                    return { ...prev, tone: e.target.value }
                                                })
                                            })
                                        }
                                        list={[{ txt: "虛弱焦慮", value: "虛弱焦慮" }, { txt: "溫柔婉約", value: "溫柔婉約" }, { txt: "陽剛活力", value: "陽剛活力" }]}
                                    />

                                    <Selected full label="髮型" value={stdptDetail?.hair_styles ?? "-"}
                                        onchange={
                                            ((e) => {
                                                setStdptDetail((prev) => {
                                                    return { ...prev, hair_styles: e.target.value }
                                                })
                                            })
                                        }
                                        list={[{ txt: "長髮綁馬尾", value: "長髮綁馬尾" }, { txt: "短髮瀏海", value: "短髮瀏海" }, { txt: "雙辮子", value: "雙辮子" }]}
                                    />

                                    <Selected full label="髮色" value={stdptDetail?.hair_color ?? "-"}
                                        onchange={
                                            ((e) => {
                                                setStdptDetail((prev) => {
                                                    return { ...prev, hair_color: e.target.value }
                                                })
                                            })
                                        }
                                        list={[{ txt: "黑灰", value: "黑灰" }, { txt: "深棕色", value: "深棕色" }, { txt: "亞麻色", value: "亞麻色" }]}
                                    />

                                    <Selected full label="聲紋" value={stdptDetail?.voiceprint ?? "-"}
                                        onchange={
                                            ((e) => {
                                                setStdptDetail((prev) => {
                                                    return { ...prev, voiceprint: e.target.value }
                                                })
                                            })
                                        }
                                        list={[{ txt: "中年女性1", value: "中年女性1" }, { txt: "中年女性2", value: "中年女性2" }, { txt: "中年女性3", value: "中年女性3" }]}
                                    />

                                    <Selected full label="氣色" value={stdptDetail?.complexion ?? "-"}
                                        onchange={
                                            ((e) => {
                                                setStdptDetail((prev) => {
                                                    return { ...prev, complexion: e.target.value }
                                                })
                                            })
                                        }
                                        list={[{ txt: "基本1", value: "基本1" }, { txt: "基本2", value: "基本2" }, { txt: "基本3", value: "基本3" }]}
                                    />

                                    <Selected full label="服裝" value={stdptDetail?.clothing_style ?? "-"}
                                        onchange={
                                            ((e) => {
                                                setStdptDetail((prev) => {
                                                    return { ...prev, clothing_style: e.target.value }
                                                })
                                            })
                                        }
                                        list={[{ txt: "套裝1", value: "套裝1" }, { txt: "套裝2", value: "套裝2" }, { txt: "套裝3", value: "套裝3" }]}
                                    />

                                    <Selected full label="其他" value={stdptDetail?.other ?? "-"}
                                        onchange={
                                            ((e) => {
                                                setStdptDetail((prev) => {
                                                    return { ...prev, other: e.target.value }
                                                })
                                            })
                                        }
                                        list={[{ txt: "耳環", value: "耳環" }, { txt: "墜飾", value: "墜飾" }, { txt: "帽子", value: "帽子" }]}
                                    />
                                </div>

                            </div>
                        </div>
                        <div className='flex flex-row gap-2 w-full justify-between my-3'>
                            <div>
                                <Btn
                                    text="取消"
                                    color="gray"
                                    round="large"
                                    icon={faArrowLeft}
                                    click={() => {
                                        setStdptDetail(null)
                                        setCurrent(null)
                                    }}
                                />
                            </div>
                            <div className="flex gap-3">
                                {
                                    current !== null && current == "new" &&
                                    <Btn
                                        text="新增"
                                        color="red"
                                        round="large"
                                        icon={faFloppyDisk}
                                        click={() => {
                                            setMessage("是否確定修改")
                                            setModalBtns(<>
                                                <Btn className="mx-1" color="red" round="small" click={() => { setShowModal(false) }} text="取消" />
                                                <Btn className="mx-1" color="blue" round="small" click={() => {
                                                    stdptDetail != null && {} && actionStandardizedPatient("create", stdptDetail).then(res => {
                                                        if (res) {
                                                            setMessage("新增完成")
                                                        } else {
                                                            setMessage("新增失敗")
                                                        }
                                                        setModalBtns(
                                                            <Btn className="mx-1" color="red" round="small" click={() => { setShowModal(false) }} text="關閉" />
                                                        )
                                                    })
                                                }} text="確定新增" />
                                            </>)
                                            setShowModal(true)
                                        }}
                                    />
                                }
                                {
                                    current !== null && current !== "new" &&
                                    <>
                                        <Btn
                                            text="刪除"
                                            color="red"
                                            round="large"
                                            icon={faTrashCan}
                                            click={() => {
                                                //editStandardizedPatient(stdptDetail ?? {})
                                                setMessage("是否確定要刪除此筆資料")
                                                setModalBtns(<>
                                                    <Btn className="mx-1" color="gray" round="small" click={() => { setShowModal(false) }} text="取消" />
                                                    <Btn className="mx-1" color="red" round="small" click={() => {
                                                        stdptDetail != null && {} && actionStandardizedPatient("delete", stdptDetail).then(res => {
                                                            if (res) {
                                                                setMessage("刪除完成")
                                                            } else {
                                                                setMessage("刪除失敗")
                                                            }
                                                            setModalBtns(
                                                                <Btn className="mx-1" color="red" round="small" click={() => { setShowModal(false) }} text="關閉" />
                                                            )
                                                            setStdptDetail(null)
                                                            setCurrent(null)
                                                        })
                                                    }} text="確定刪除" />
                                                </>)
                                                setShowModal(true)
                                            }}
                                        />
                                        <Btn
                                            text="複製"
                                            color="blue"
                                            round="large"
                                            icon={faFloppyDisk}
                                            click={() => {
                                                setMessage("是否確定複製")
                                                setModalBtns(<>
                                                    <Btn className="mx-1" color="gray" round="small" click={() => { setShowModal(false) }} text="取消" />
                                                    <Btn className="mx-1" color="blue" round="small" click={() => {
                                                        stdptDetail != null && {} && actionStandardizedPatient("create", stdptDetail).then(res => {
                                                            if (res) {
                                                                setMessage("複製完成")
                                                            } else {
                                                                setMessage("複製失敗")
                                                            }
                                                            setModalBtns(
                                                                <Btn className="mx-1" color="red" round="small" click={() => { setShowModal(false) }} text="關閉" />
                                                            )
                                                        })
                                                    }} text="確定複製" />
                                                </>)
                                                setShowModal(true)
                                            }}
                                        />
                                        <Btn
                                            text="修改"
                                            color="blue"
                                            round="large"
                                            icon={faPencil}
                                            click={() => {
                                                setMessage("是否確定修改")
                                                setModalBtns(
                                                    <>
                                                        <Btn className="mx-1" color="red" round="small" click={() => { setShowModal(false) }} text="取消" />
                                                        <Btn className="mx-1" color="blue" round="small" click={() => {
                                                            stdptDetail != null && {} && actionStandardizedPatient("update", stdptDetail).then((res: boolean) => {
                                                                if (res) {
                                                                    setMessage("修改完成")
                                                                } else {
                                                                    setMessage("修改失敗")
                                                                }
                                                            })
                                                            setModalBtns(
                                                                <Btn className="mx-1" color="red" round="small" click={() => { setShowModal(false) }} text="關閉" />
                                                            )
                                                        }} text="確定修改" />
                                                    </>)
                                                setShowModal(true)
                                            }}
                                        />
                                    </>
                                }
                            </div>
                        </div>
                    </div>
                }
            </div>

            {
                <Modal maxWidth={400} maxHeight={300} isOpen={showModal} onClose={() => setShowModal(false)}
                    bodyContent={
                        <div className="p-2 w-full">
                            <span>{message}</span>
                            <hr className="border-osce-gray-2 my-[10px]" />
                            {
                                stdptDetail &&
                                <div className="flex justify-center">
                                    <div className="flex items-center m-[20px] bg-osce-gray-1 rounded-md overflow-hidden max-w-[240px] max-h-[120px]">
                                        <ImgLoader className="w-full max-w-[100px] h-full object-cover" src={stdptDetail?.head_shot ?? ''} />
                                        <span className="m-[10px]">{stdptDetail?.age}歲 {stdptDetail?.last_name}</span>
                                    </div>
                                </div>
                            }
                            <div className="w-full flex 
                                [&:has(:only-child)]:justify-center 
                                [&:has(:not(:only-child))]:justify-around
                            ">
                            </div>
                        </div>
                    }
                    footerBtns={
                        modalBtns
                    }
                />

            }
        </BasicContainer>
    )
}
