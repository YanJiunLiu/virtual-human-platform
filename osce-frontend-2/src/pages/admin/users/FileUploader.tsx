import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { faArrowLeft, faCirclePlus, faCloudArrowUp } from "@fortawesome/free-solid-svg-icons"
import { Btn } from "../../../components/OSCE-unit"
import Modal from "../../../components/Modal"

type uploadTypes = {
    別名: string
    名: string
    姓: string
    密碼: string
    帳號: string
    活躍狀態: string
    系所: string
    編號: string
    角色: string
    群組數: string
    課程數: string
    狀態: string
}

export default () => {

    const [jsonData, setJsonData] = useState<uploadTypes[]>([]);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const data = evt.target?.result;
            if (!data) return;

            // data 是 ArrayBuffer
            const workbook = XLSX.read(data, { type: "array" });

            // Read the first sheet
            const firstSheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[firstSheetName];

            // Convert to JSON
            const json = XLSX.utils.sheet_to_json(sheet);
            setJsonData(json as uploadTypes[]);
            setShowModal(false)
            setShowUploadModal(true)
        };

        reader.readAsArrayBuffer(file);
    };

    return (
        <>
            <Btn width={120} color="white" text="整批新增" icon={faCirclePlus} click={() => {
                setShowModal(true)
            }} />

            <Modal
                maxWidth={400}
                maxHeight={300}
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                bodyContent={
                    <>
                        <div className="flex items-center justify-between">
                            <span>整批輸入使⽤者</span>
                            <Btn color="blue" text="範例檔案" click={() => {
                                const a = document.createElement('a');
                                a.href = import.meta.env.BASE_URL + '/sample.xlsx';   // public 中的檔案路徑
                                a.download = 'sample.xlsx';
                                a.click();
                            }} />
                        </div>
                        <hr className="border-osce-gray-2 my-[10px]" />

                        <div className="w-full py-4 max-w-xl mx-auto space-y-4">
                            <input
                                ref={inputRef}
                                type="file"
                                accept=".csv, .xlsx, .xls"
                                className="border p-2 rounded hidden"
                                onChange={handleFileUpload}
                            />
                            <span>請選擇要匯入使⽤者的 csv 檔案。</span>
                            <Btn className="my-3 rounded-md" width={160} color="blue" text="選擇檔案上傳" icon={faCloudArrowUp} click={() => { inputRef.current?.click() }} />
                        </div>
                    </>
                }
                footerBtns={
                    <div className={`flex justify-between`}>
                        <Btn color="white" icon={faArrowLeft} text="關閉" click={() => setShowModal(false)} />
                        {/** 
                        <Btn color="blue" width={130} icon={faCloudArrowUp} text="開始上傳" click={() => setShowModal(false)} />
                        */}

                    </div>
                }
            />
            <Modal
                maxWidth={1200}
                maxHeight={300}
                isOpen={showUploadModal}
                onClose={() => setShowModal(false)}
                bodyContent={
                    <>
                        <div className="flex items-center justify-between mb-3">
                            <span>確認整批輸入使⽤者</span>
                        </div>
                        <div className="flex-grow overflow-x-auto">
                            <table className="divide-y divide-gray-200 text-sm w-full min-w-[800px]">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <td>裝態</td>
                                        <td>帳號</td>
                                        <td>名</td>
                                        <td>姓</td>
                                        <td>別名</td>
                                        <td>編號</td>
                                        <td>學系部門</td>
                                        <td>群組數</td>
                                        <td>課程數</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        jsonData.map((item: uploadTypes, index: number) =>
                                            <tr key={"jsonData_" + index} className="border-b border-b-osce-gray-1">
                                                <td className="px-4 py-2">
                                                    <input type="checkbox" checked={item.活躍狀態 == "1" ? true : false} />
                                                </td>
                                                <td className="px-4 py-2">{item.帳號}</td>
                                                <td className="px-4 py-2">{item.名}</td>
                                                <td className="px-4 py-2">{item.姓}</td>
                                                <td className="px-4 py-2">{item.別名}</td>
                                                <td className="px-4 py-2">{item.編號}</td>
                                                <td className="px-4 py-2">{item.系所}</td>
                                                <td className="px-4 py-2">{item.群組數 ?? 0}</td>
                                                <td className="px-4 py-2">{item.課程數 ?? 0}</td>
                                            </tr>
                                        )
                                    }
                                </tbody>
                            </table>
                        </div>
                    </>
                }
                footerBtns={
                    <>
                        <Btn color="gray" width={130} icon={faArrowLeft} text="關閉" click={() => {
                            setShowUploadModal(false)
                        }} />
                        <Btn color="blue" width={130} icon={faCloudArrowUp} text="重新上傳" click={() => {
                            setShowModal(true)
                            setShowUploadModal(false)
                        }} />
                        <Btn color="blue" width={130} icon={faCloudArrowUp} text="確定上傳" click={() => setShowModal(false)} />
                    </>
                }
            />

        </>
    )
}