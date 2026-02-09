import {  faCloudArrowUp } from "@fortawesome/free-solid-svg-icons"
import { Btn } from "../../../components/OSCE-unit"
import UploadImg from "./uploadImg"
import { useEffect, useState } from "react"
import { useCreateTest } from '../context/CreateTestContext';

export default () => {
    const {replacePayload, payload} = useCreateTest();
    const [subpayload, setSubpayload] = useState<createTest>(payload);


    useEffect(() => {
        // 每次subpayload改變時更新全局payload
        replacePayload(subpayload);
    }, [subpayload]);
    
    return (
        <>
            <div className="flex">
                <div className="w-[320px]">
                    <UploadImg setSubpayload={(subpayload)=> setSubpayload(subpayload)} index={0} payload={subpayload}/>
                    <UploadImg setSubpayload={(subpayload)=> setSubpayload(subpayload)} index={1} payload={subpayload}/>
                    <UploadImg setSubpayload={(subpayload)=> setSubpayload(subpayload)} index={2} payload={subpayload}/>
                </div>
                <div className="grow flex flex-col items-end">
                    <div className="bg-osce-gray-2 min-w-[300px] max-w-[600px] h-full p-3 rounded-md mb-3">
                        <div className="flex justify-center gap-1 mb-1">
                            <img className="max-w-1/2" src={subpayload?.check_data?.[0]?.img} />
                            <img className="max-w-1/2" src={subpayload?.check_data?.[1]?.img} />
                        </div>
                        <img src={subpayload?.check_data?.[2]?.img} />
                    </div>
                    <Btn
                        className="bg-osce-blue-3"
                        icon={faCloudArrowUp}
                        click={() => { }}
                        text="上傳"
                    />
                </div>
            </div>
        </>
    )
}