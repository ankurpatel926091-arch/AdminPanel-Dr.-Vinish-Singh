import React from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  ClassicEditor,
  Essentials,
  Paragraph,
  Heading,
  Bold,
  Italic,
  Link,
  List,
  BlockQuote,
  Table,
  TableToolbar,
  Undo
} from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';

const BlogEditor = ({ value, onChange }) => {
  return (
    <div className="blog-editor text-slate-800 border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
      <style>{`
        .ck-editor__editable_inline {
          min-height: 350px !important;
          padding: 1.25rem !important;
          font-size: 0.95rem !important;
          line-height: 1.7 !important;
        }
        .ck.ck-toolbar {
          border: none !important;
          border-bottom: 1px solid #e2e8f0 !important;
          background: #f8fafc !important;
          padding: 0.5rem 0.75rem !important;
        }
        .ck.ck-editor__main>.ck-editor__editable:not(.ck-focused) {
          border: none !important;
        }
        .ck.ck-editor__main>.ck-editor__editable.ck-focused {
          border: none !important;
          box-shadow: none !important;
        }
      `}</style>
      <CKEditor
        editor={ClassicEditor}
        data={value || ''}
        config={{
          licenseKey: 'GPL',
          plugins: [
            Essentials,
            Paragraph,
            Heading,
            Bold,
            Italic,
            Link,
            List,
            BlockQuote,
            Table,
            TableToolbar,
            Undo
          ],
          toolbar: [
            'heading',
            '|',
            'bold',
            'italic',
            'link',
            '|',
            'bulletedList',
            'numberedList',
            '|',
            'blockQuote',
            'insertTable',
            '|',
            'undo',
            'redo',
          ],
          heading: {
            options: [
              {
                model: 'paragraph',
                title: 'Paragraph',
                class: 'ck-heading_paragraph',
              },
              {
                model: 'heading2',
                view: 'h2',
                title: 'Heading 2 (H2)',
                class: 'ck-heading_heading2',
              },
              {
                model: 'heading3',
                view: 'h3',
                title: 'Heading 3 (H3)',
                class: 'ck-heading_heading3',
              },
            ],
          },
          table: {
            contentToolbar: [
              'tableColumn',
              'tableRow',
              'mergeTableCells',
            ],
          },
        }}
        onChange={(event, editor) => {
          const data = editor.getData();
          if (onChange) {
            onChange(data);
          }
        }}
      />
    </div>
  );
};

export default BlogEditor;
