import { faCheckCircle, faPlusCircle,faMinusCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from "react"
import { useCreateTest } from '../context/CreateTestContext';

type RowProps = {
    items: React.ReactNode[];
};

const Row: React.FC<RowProps> = ({ items }) => (
    <div className="flex mb-5 mx-[10px]">
        <div className="flex mx-2 min-w-[20px] pt-1">
            {items[0]}
        </div>
        <div className="flex mx-2 min-w-[80px] ">
            {items[1]}
        </div>
        <div className="flex mx-1 min-w-[120px] ">
            {items[2]}
        </div>
        <div className="grow">
            {items[3]}
        </div>
        <div className=" ">
            {items[4]}
        </div>
       
    </div>
);

export default () => {
    const {replacePayload, payload} = useCreateTest();
    const [subpayload, setSubpayload] = useState<createTest>(payload);
    
    
    useEffect(() => {
        // 每次subpayload改變時更新全局payload
        replacePayload(subpayload);
    }, [subpayload]);
    return (
        <>
            <div className="w-full">

                <Row
                    items={[
                        <FontAwesomeIcon className="text-osce-lake-1" icon={faCheckCircle} />,
                        <span>
                            診斷<br />
                            <span className="text-osce-lake-1 text-[13px]">列入評分</span>
                        </span>,
                        <span>診斷</span>,
                        <input className="w-full border border-osce-gray-2 p-2 rounded-sm" onChange={(e) => { setSubpayload(prev => ({ ...prev, diagnosis: e.target.value })); }} value={subpayload.diagnosis} />,
                        <div className="">
                            <FontAwesomeIcon className="text-osce-blue-5 text-[32px] mx-1" icon={faPlusCircle} onClick={() => { }} />
                            <FontAwesomeIcon className="text-osce-blue-3 text-[32px] mx-1" icon={faMinusCircle} onClick={() => { }} />

                        </div>
                    ]}
                />
                <hr className="my-[20px] border-osce-gray-2" />
                 <Row
                    items={[
                        <FontAwesomeIcon className="text-osce-lake-1" icon={faCheckCircle} />,
                        <span>
                            治療計劃
                        </span>,
                        <span>治療計劃1</span>,
                        <input className="w-full border border-osce-gray-2 p-2 rounded-sm" onChange={(e) => { setSubpayload(prev => ({ ...prev, treatment: e.target.value })); }} value={subpayload.treatment}/>,
                        <div className="">
                            <FontAwesomeIcon className="text-osce-blue-5 text-[32px] mx-1" icon={faPlusCircle} onClick={() => { }} />
                            <FontAwesomeIcon className="text-osce-blue-3 text-[32px] mx-1" icon={faMinusCircle} onClick={() => { }} />
                        </div>
                    ]}
                />
            </div>
        </>
    )
}