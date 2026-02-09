// components/RichTextEditor.tsx
import { useEditor, EditorContent } from '@tiptap/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAlignCenter, faAlignJustify, faAlignLeft, faAlignRight, faBold, faEraser, faItalic, faList, faListOl } from '@fortawesome/free-solid-svg-icons'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Heading from '@tiptap/extension-heading'

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) return null

    return (
        <div className="flex flex-wrap gap-2 border-b p-2 bg-gray-100 rounded-t">
            {/* 文字樣式 */}
            <button onClick={() => editor.chain().focus().toggleBold().run()}
                className={btnClass(editor.isActive('bold'))}>
                    <FontAwesomeIcon icon={faBold}/>
                </button>
            <button onClick={() => editor.chain().focus().toggleItalic().run()}
                className={btnClass(editor.isActive('italic'))}>
                    <FontAwesomeIcon icon={faItalic}/>
                </button>

            {/* 標題 */}
            {/**
             * 
            <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={btnClass(editor.isActive('heading', { level: 1 }))}>H1</button>
            <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={btnClass(editor.isActive('heading', { level: 2 }))}>H2</button>
             */}

            {/* 對齊 */}
            <button onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={btnClass(editor.isActive({ textAlign: 'left' }))}>
                    <FontAwesomeIcon icon={faAlignLeft}/>
                </button>
            <button onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={btnClass(editor.isActive({ textAlign: 'center' }))}>
                     <FontAwesomeIcon icon={faAlignCenter}/>
                </button>
            <button onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={btnClass(editor.isActive({ textAlign: 'right' }))}>
                     <FontAwesomeIcon icon={faAlignRight}/>
                </button>
            <button onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                className={btnClass(editor.isActive({ textAlign: 'justify' }))}>
                     <FontAwesomeIcon icon={faAlignJustify}/>
                </button>

            {/* 顏色 */}
            <input
                type="color"
                onInput={(e) =>
                    editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()
                }
                className="w-8 h-8 p-0 border rounded cursor-pointer"
                title="文字顏色"
            />
            {/** 
            <input
                type="color"
                onInput={(e) =>
                    editor.chain().focus().setMark('textStyle', { backgroundColor: (e.target as HTMLInputElement).value }).run()
                }
                className="w-8 h-8 p-0 border rounded cursor-pointer"
                title="背景顏色"
            />
            */}

            <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={btnClass(editor.isActive('bulletList'))}
            >
                <FontAwesomeIcon icon={faList}/>
            </button>

            <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={btnClass(editor.isActive('orderedList'))}
            >
                <FontAwesomeIcon icon={faListOl}/>
            </button>

            {/* 清除 */}
            <button onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
                className="flex justify-center items-center text-[13px] p-1 w-[30px] h-[30px] border rounded bg-red-100 text-red-600">
                <FontAwesomeIcon icon={faEraser}/>
            </button>
        </div>
    )
}

const btnClass = (active: boolean) =>
    `flex justify-center items-center text-[13px] p-1 w-[30px] h-[30px] rounded text-sm ${active ? 'bg-blue-500 text-white' : 'bg-white border border-osce-gray-2'}`

type RichTextEditorProps = {
    setSubpayload: React.Dispatch<React.SetStateAction<createTest>>;
    payload?: createTest;
}

const RichTextEditor = ({setSubpayload, payload}:RichTextEditorProps) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Heading.configure({ levels: [1, 2] }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            TextStyle,
            Color,
        ],
        onUpdate:({ editor }) => {
            const html = editor.getHTML()
            setSubpayload(prev => ({
                ...prev,
                guideline_content:  html 
            }))
        },
        content: payload?.guideline_content
    })

    return (
        <div className="w-full">
            <MenuBar editor={editor} />
            <EditorContent editor={editor}
                className="min-h-[200px] p-4 border rounded-b focus:outline-none [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6" />
        </div>
    )
}

export default RichTextEditor
