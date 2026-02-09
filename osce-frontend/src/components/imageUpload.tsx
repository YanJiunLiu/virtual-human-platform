import React, { useCallback, useState, useRef, useEffect } from "react";

type ImageResult = {
    base64: string; // full data URL (e.g. data:image/png;base64,....)
    base64Only: string; // only base64 payload (no data:* prefix)
    mime: string; // image mime type (image/png or image/jpeg)
    ext: "png" | "jpg" | "jpeg" | "unknown";
    fileName: string;
    size: number; // bytes
};

type Props = {
    /** called when a valid image is loaded */
    onChange?: (result: ImageResult | null) => void;
    /** optional: limit file size in MB (default 5) */
    maxSizeMB?: number;
    /** optional: show initial preview or not */
    showPreview?: boolean;
    /** optional: accept attribute (defaults to png,jpeg) */
    accept?: string;
    src?: string
};

export default function ImageUploader({
    onChange,
    maxSizeMB = 5,
    showPreview = true,
    accept = "image/png, image/jpeg",
    src = ""
}: Props) {
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null)

    const handleFile = useCallback(
        (file: File | null) => {
            setError(null);
            setPreview(null);
            if (!file) {
                onChange?.(null);
                return;
            }

            const maxBytes = maxSizeMB * 1024 * 1024;
            if (file.size > maxBytes) {
                setError(`檔案太大，限制 ${maxSizeMB} MB 內`);
                onChange?.(null);
                return;
            }

            // only allow images by MIME
            if (!file.type.startsWith("image/")) {
                setError("只支援圖片檔 (png/jpg)");
                onChange?.(null);
                return;
            }

            setLoading(true);
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string; // data:<mime>;base64,....
                // try to detect mime from data URL or fallback to file.type
                const mimeMatch = result.match(/^data:([a-zA-Z0-9/+-]+);base64,/);
                const mime = mimeMatch ? mimeMatch[1] : file.type || "image/unknown";
                let ext: ImageResult["ext"] = "unknown";
                if (mime === "image/png") ext = "png";
                if (mime === "image/jpeg") ext = "jpeg";
                // also accept jpg as alias
                if (ext === "jpeg") ext = "jpg"; // normalize to jpg

                // base64 payload only (strip prefix)
                const base64Only = result.replace(/^data:([a-zA-Z0-9/+-]+);base64,/, "");

                const payload: ImageResult = {
                    base64: result,
                    base64Only,
                    mime,
                    ext,
                    fileName: file.name,
                    size: file.size,
                };

                setPreview(result);
                setLoading(false);
                onChange?.(payload);
            };
            reader.onerror = () => {
                setError("無法讀取檔案");
                setLoading(false);
                onChange?.(null);
            };
            reader.readAsDataURL(file);
        },
        [maxSizeMB, onChange]
    );

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        handleFile(file);
    };

    // drag & drop
    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files?.[0] ?? null;
        handleFile(file);
    };
    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const clear = () => {
        setPreview(null);
        setError(null);
        onChange?.(null);
    };

    useEffect(()=>{
        setPreview(src)
    },[src])

    return (
        <div className="max-w-sm h-full">
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            {showPreview && preview ? (
                <div className="relative">
                    <div className="w-full  rounded-lg overflow-hidden border">
                        <img src={preview} alt="preview" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex gap-2 mt-2 absolute top-1 right-1">
                        <button
                            type="button"
                            className=" py-1 rounded bg-osce-blue-5 text-sm text-white"
                            onClick={clear}
                        >
                            重新上傳
                        </button>
                    </div>
                </div>
            ) : <div
                onClick={() => inputRef.current?.click()}
                onDrop={onDrop}
                onDragOver={onDragOver}
                className="border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition h-full"
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    onChange={onInputChange}
                    className="absolute w-0 h-0 opacity-0"
                    aria-hidden
                />

                <div className="flex flex-col items-center gap-2">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16v-4a4 4 0 018 0v4m-6 4h6" />
                    </svg>
                    <div className="text-sm text-gray-600">拖曳或點擊選擇檔案 (PNG / JPG)</div>
                    <div className="text-xs text-gray-500">最大 {maxSizeMB} MB</div>

                    {loading && <div className="text-sm text-gray-500">讀取中…</div>}
                </div>
            </div>}
        </div>
    );
}

// 範例使用方式：
// <ImageUploader
//   maxSizeMB={2}
//   onChange={(res) => {
//     if (!res) { console.log('沒有檔案'); return }
//     console.log('mime:', res.mime)
//     console.log('ext:', res.ext)
//     console.log('base64 only length:', res.base64Only.length)
//   }}
///>
