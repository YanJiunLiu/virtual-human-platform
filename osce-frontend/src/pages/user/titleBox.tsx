

import React from "react";

type TitleBoxProps = {
    leftContent?:React.ReactNode
    rightContent?:React.ReactNode
}

export default (props:TitleBoxProps) => {
    return (
        <div>
            <div className="flex w-full  max-w-[1400px] mx-auto h-[80px] py-[20px] justify-between items-center px-[20px]">
                <div className="flex-1">
                    {props.leftContent}
                </div>
                <div className="flex-1 text-right">
                    {props.rightContent}
                </div>
            </div>
        </div>
    )
}
