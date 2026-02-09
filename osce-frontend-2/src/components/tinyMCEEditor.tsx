// TinyMCEEditor.tsx
import React, { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

const TinyMCEEditor: React.FC = () => {
  const editorRef = useRef<any>(null);


  return (
    <>
      <Editor
        apiKey="你的TinyMCE API KEY(可選，免費版也可用)"
        onInit={( editor) => (editorRef.current = editor)}
        initialValue="<p>你好，TinyMCE!</p>"
        init={{
          height: 300,
          menubar: false,
          plugins: [
            'advlist autolink lists link image',
            'charmap print preview anchor help',
            'searchreplace visualblocks code',
            'insertdatetime media table paste wordcount',
          ],
          toolbar:
            'undo redo | formatselect | bold italic | \
             alignleft aligncenter alignright | \
             bullist numlist outdent indent | help',
        }}
      />
    </>
  );
};

export default TinyMCEEditor;
