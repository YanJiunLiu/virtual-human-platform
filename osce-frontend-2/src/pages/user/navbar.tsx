

import React from "react";

type NavProps = {
    title:string
    leftContent?:React.ReactNode
    rightContent?:React.ReactNode
}

export default (props:NavProps) => {
    return (
        <div>
            <div className="flex bg-osce-blue-4 w-full h-[60px] justify-between items-center lg:px-[75px] sm:px-[10px]">
                <div className="flex-1 flex gap-x-[10px]">
                    {props.leftContent}
                </div>
                <h4 className="text-white">{props.title}</h4>
                <div className="flex-1 flex gap-x-[10px] justify-end">
                    {props.rightContent}
                </div>
            </div>
        </div>
    )
}
