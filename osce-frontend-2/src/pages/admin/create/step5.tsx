import { faXmark } from "@fortawesome/free-solid-svg-icons"
import { ToggleSwitch } from "../../../components/OSCE-unit"
import { useState, useEffect } from "react"
import { Rnd } from "react-rnd";
import { v4 as uuidv4 } from "uuid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCreateTest } from '../context/CreateTestContext';


export default () => {
    const {replacePayload, payload} = useCreateTest();
    const [subpayload, setSubpayload] = useState<createTest>(payload);
    const [current, setCurrent] = useState<number>(0)


    const handleAddRect = (e: React.MouseEvent<HTMLDivElement>) => {
        const container = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - container.left;
        const y = e.clientY - container.top;

        const newRect: Rect = {
            index: uuidv4(),
            x,
            y,
            width: 100,
            height: 100,
        };
        setSubpayload(prev => {
                const newCheckData = prev.check_data ? [...prev.check_data] : []
                const currentCheckData = newCheckData[current] || { rects: [] };
                newCheckData[current] = {
                    ...currentCheckData,
                    rects: [...(currentCheckData.rects || []), newRect],
                };

                return {
                    ...prev,
                    check_data: newCheckData,
                };
            }
        )
    };

    const updateRect = (id: string, newRect: Partial<Rect>) => {
        setSubpayload(prev => {
                const newCheckData = prev.check_data ? [...prev.check_data] : []
                const currentCheckData = newCheckData[current] || { rects: [] };
                newCheckData[current] = {
                    ...currentCheckData,
                    rects: [...(currentCheckData.rects || [])].map((rect) => (rect.index === id ? { ...rect, ...newRect } : rect)),
                };

                return {
                    ...prev,
                    check_data: newCheckData,
                };
            }
        )
    };

    const removeRect = (id: string) => {
         setSubpayload(prev => {
                const newCheckData = prev.check_data ? [...prev.check_data] : []
                const currentCheckData = newCheckData[current] || { rects: [] };
                newCheckData[current] = {
                    ...currentCheckData,
                    rects: [...(currentCheckData.rects || [])].filter((rect) => rect.index !== id),
                };

                return {
                    ...prev,
                    check_data: newCheckData,
                };
            }
        )
    };

    
    useEffect(() => {
        // 每次subpayload改變時更新全局payload
        replacePayload(subpayload); 
    }, [subpayload]);
    
    return (
        <>
            <div className="flex bg-osce-gray-1 p-3 rounded-md mb-2">

                <div className="flex items-center mr-3">
                    <span>DJ模式</span>
                    <ToggleSwitch checked={subpayload.DJ_mode} 
                    onChange={(e) => { setSubpayload(prev => ({ ...prev, DJ_mode:e }));}}  />
                </div>
                <div className="flex items-center mr-3">
                    <span>整合診斷與治療計畫</span>
                    <ToggleSwitch checked={subpayload.diagnosis_treatment_plan} 
                    onChange={(e) => { setSubpayload(prev => ({ ...prev, diagnosis_treatment_plan:e }));}}  />
                </div>

            </div>
            <div>
                <div className="grow flex justify-between">
                    <ul>
                        {
                            subpayload.check_data?.map(
                                (check_data, index) => 
                                    <li key={"checkData" + index}>
                                        <section 
                                            className={`w-full h-[120px] ${index == current ? "bg-osce-blue-5 text-white" : ""} rounded-md flex overflow-hidden mb-[10px]`}
                                             onClick={() => {
                                                setCurrent(index);
                                            }}
                                        >
                                            <div>  
                                                <span className={`${index == current ? "text-white" : "text-osce-blue-4"}`}>⾴⾯1 / 口內照</span>
                                                <div className="flex items-center">
                                                    <input
                                                        className="w-full h-[40px] p-2 border border-osce-gray-2 rounded-sm my-2"
                                                        value={check_data.title}
                                                        readOnly
                                                    />
                                                </div>
                                            </div>
                                        </section>
                                    </li>
                            )
                        }
                    </ul>
                    <div 
                        className="w-[600px] h-[400px]"
                        style={{ 
                            backgroundImage: `url(${Array.isArray(subpayload?.check_data) && subpayload?.check_data[current] ? subpayload.check_data[current].img : ""})`,  
                            backgroundSize: "contain",
                            backgroundPosition: "center",
                            backgroundRepeat: 'no-repeat',
                        }} 
                    >
                        <div
                            className="relative w-[600px] h-[400px] border rounded overflow-hidden cursor-crosshair"
                            onClick={handleAddRect}
                        >
                            {   Array.isArray(subpayload?.check_data?.[current]?.rects) &&
                                subpayload.check_data[current].rects.map((rect) => (
                                    <Rnd
                                        key={rect.index}
                                        size={{ width: rect.width, height: rect.height }}
                                        position={{ x: rect.x, y: rect.y }}
                                        onDragStop={(_, d) =>
                                            updateRect(rect.index, { x: d.x, y: d.y })
                                        }
                                        onResizeStop={(_e, _dir, ref, _unused, pos) =>
                                            updateRect(rect.index, {
                                                width: parseInt(ref.style.width),
                                                height: parseInt(ref.style.height),
                                                x: pos.x,
                                                y: pos.y,
                                            })
                                        }
                                        bounds="parent"
                                        style={{
                                            border: "2px solid rgba(255,255,255,0.8)",
                                            backgroundColor: "rgba(0,0,0,0.2)",
                                            position: "absolute",
                                        }}
                                    >
                                        {/* 移除按鈕 */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation(); // 防止冒泡觸發新增
                                                removeRect(rect.index);
                                            }}
                                            className="absolute -top-3 -right-3 bg-osce-blue-3 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm shadow z-50"
                                        >
                                            <FontAwesomeIcon icon={faXmark} />
                                        </button>
                                    </Rnd>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}