import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useCreateTest } from '../context/CreateTestContext';
import { useState } from 'react';
type RowProps = {
    items: React.ReactNode[];
};

const Row: React.FC<RowProps> = ({ items }) => (
    <div className="flex mb-5 mx-[10px]  text-osce-gray-3">
        <div className="flex mx-2 min-w-[150px] p-[10px]">
            {items[0]}
        </div>
        <div className="flex grow p-[10px] bg-osce-gray-1 mr-[10px]">
            {items[1]}
        </div>
        <div className="flex p-[10px] text-[15px] text-osce-gray-3 bg-osce-gray-1 w-[200px] text-nowrap">
            {items[2]}
        </div>

    </div>
);

const State = () =>
    <div className="flex items-center gap-1">
        需達成
        <div className="w-[16px] h-[16px] bg-white border border-osce-lake-1 rounded-full"></div>
        <div className="w-[16px] h-[16px] bg-white border border-osce-lake-1 rounded-full"></div>
        <div className="w-[16px] h-[16px] bg-white border border-osce-lake-1 rounded-full"></div>
        <div className="w-[16px] h-[16px] bg-white border border-osce-lake-1 rounded-full"></div>
        <div className="w-[16px] h-[16px] bg-osce-lake-1 text-white rounded-full flex justify-center items-center">
            <FontAwesomeIcon fontSize={12} icon={faCheck} />
        </div>
        <span>100%</span>
    </div>

export default () => {
    const {payload} = useCreateTest();
    const [subpayload,] = useState<createTest>(payload);
    return (
        <>
            <div className="w-full ">
                <div className="font-[700] text-[18px] m-[10px]">病史說明設定</div>
                <Row
                    items={[
                        "患者身份確認",
                        "陳先⽣，50歲",
                        <State />,
                    ]}
                />
                <Row
                    items={[
                        "主訴",
                        subpayload.main_description?.description ?? "-",
                        <State />,
                    ]}
                />
                
                {
                    subpayload.medical_history_settings?.map((medical_history)=>
                        <Row
                            items={[
                                medical_history.category,
                                medical_history.description,
                                <State />,
                            ]}
                        />
                    )
                }
                <div className="font-[700] text-[18px] m-[10px]">檢查資料說明設定</div>
                {
                    subpayload.check_data?.map(
                        (check_data)=>
                        <div className="flex mb-5 mx-[10px]  text-osce-gray-3">
                            <div className="flex mx-2 min-w-[150px] p-[10px]">
                                {check_data.title}
                            </div>
                            <div className="flex grow p-[10px] mr-[10px] w-full">
                                <div>
                                    <img className=" rounded-md" src={`${check_data.img}`} />
                                </div>
                                <div className="grow">
                                    <div className="flex p-[10px] text-[15px] text-nowrap">
                                        <div className="grow bg-osce-gray-1 p-1">牙齦萎縮，⿒間縫隙</div>
                                        <div className="w-[160px] flex p-1 items-center">

                                            <div className="w-[16px] h-[16px] bg-osce-lake-1 text-white rounded-full flex justify-center items-center">
                                                <FontAwesomeIcon fontSize={12} icon={faCheck} />
                                            </div>
                                            必須說明
                                        </div>

                                    </div>
                                    <div className="flex p-[10px] text-[15px] text-nowrap">
                                        <div className="grow bg-osce-gray-1 p-1">牙齦萎縮，⿒間縫隙</div>
                                        <div className="w-[160px] flex p-1 items-center">

                                            <div className="w-[16px] h-[16px] bg-osce-lake-1 text-white rounded-full flex justify-center items-center">
                                                <FontAwesomeIcon fontSize={12} icon={faCheck} />
                                            </div>
                                            必須說明
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }
             


            </div>

        </>
    )
}