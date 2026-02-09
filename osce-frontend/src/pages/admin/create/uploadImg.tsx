import { useRef, type ChangeEvent } from "react";
import { faCloudArrowUp, faMinusCircle, faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { Btn } from "../../../components/OSCE-unit"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type uploadImgProps = {
    setSubpayload: React.Dispatch<React.SetStateAction<createTest>>;
    index: number;
    payload?: createTest;
}

export default ({setSubpayload, index, payload}:uploadImgProps) => {
    const input = useRef<HTMLInputElement | null>(null)
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSubpayload((prev:createTest)=> {
                    const newCheckData = prev.check_data ? [...prev.check_data] : [];
                    newCheckData[index] = {
                        ...newCheckData[index],
                        img: reader.result as string,
                    };
                    return {
                        ...prev,
                        check_data: newCheckData,
                    };
                });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div>
            <div className="flex items-center">

                <input
                    className="w-full h-[40px] p-2 border border-osce-gray-2 rounded-sm my-2"
                    placeholder="請輸入標題"
                    value={payload?.check_data?.[index]?.title || ""}
                    onChange={(e) => {
                        if (e.target.value && e.target.value.trim() !== "") {
                            // 如果輸入不為空，則更新標題
                            setSubpayload((prev:createTest)=> {
                                const newCheckData = prev.check_data ? [...prev.check_data] : [];
                                newCheckData[index] = {
                                    ...newCheckData[index],
                                    title: e.target.value,
                                };
                                return {
                                    ...prev,
                                    check_data: newCheckData,
                                };
                            });
                        } else {
                            // 如果輸入為空，則設置標題為空字串或其他預設值
                             setSubpayload((prev:createTest)=> {
                                const newCheckData = prev.check_data ? [...prev.check_data] : [];
                                newCheckData[index] = {
                                    ...newCheckData[index],
                                    title: "",
                                };
                                return {
                                    ...prev,
                                    check_data: newCheckData,
                                };
                            });  
                        }
                    }}
                />
                <FontAwesomeIcon className="text-osce-blue-5 text-[32px] mx-1" icon={faPlusCircle} onClick={() => { input.current?.click() }} />
                <FontAwesomeIcon className="text-osce-blue-3 text-[32px] mx-1" icon={faMinusCircle} onClick={() => {
                    setSubpayload((prev:createTest)=> {
                    const newCheckData = prev.check_data ? [...prev.check_data] : [];
                    newCheckData[index] = {
                        ...newCheckData[index],
                        img: "",
                    };
                    return {
                        ...prev,
                        check_data: newCheckData,
                    };
                });
                }} />
            </div>

            {/* 圖片上傳按鈕 */}
            <input
                ref={input}
                style={{ display: "none" }}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="my-2"
            />

            {/* 圖片預覽 */}
            {payload?.check_data?.[index]?.img && <img src={payload?.check_data?.[index]?.img} alt="預覽圖片" className="max-w-full h-auto my-2" />}

            <div className="flex">
                <Btn
                    className="bg-osce-blue-3"
                    icon={faCloudArrowUp}
                    click={() => { }}
                    text="上傳"
                />
            </div>
        </div>
    );
};

