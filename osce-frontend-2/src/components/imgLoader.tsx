import { useState } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faXmark } from '@fortawesome/free-solid-svg-icons'

type ImgLoaderProps = {
    src: string
    alt?: string
    className?: string
}
export default (props: ImgLoaderProps) => {

    const [status, setStatus] = useState<"loading" | "loaded" | "error">('loading'); // loading, loaded, error

    const handleLoad = () => {
        setStatus('loaded');
    };

    const handleError = () => {
        setStatus('error');
    };
/*
    useEffect(()=>{
        console.log(status)
        return
    },[status])
*/
    return (
        <>
            {
                status == "loading" &&
                <div className="w-full h-full flex justify-center items-center bg-osce-gray-2">
                    <FontAwesomeIcon className='animate-spin' icon={faSpinner} />
                </div>
            }
            {
                status == "error" &&
                <div className="w-full h-full flex justify-center items-center bg-osce-gray-2">
                    <FontAwesomeIcon icon={faXmark} />
                </div>
            }
            <img
                style={{ display: status == "loaded" ? "block" : "none" }}
                src={props.src}
                alt={props.alt ? props.alt : "picture"}
                className={props.className ? props.className : ""}
                onLoad={handleLoad}
                onError={handleError}
            />
        </>
    )
}