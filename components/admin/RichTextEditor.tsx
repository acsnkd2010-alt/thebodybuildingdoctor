'use client';

import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
};

function ToolbarButton({
  active,
  disabled,
  onClick,
  children,
  title,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`rounded px-2 py-1 text-xs font-medium transition ${
        active
          ? 'bg-accent/20 text-accent'
          : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
      } disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write content…',
  minHeight = '160px',
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-accent underline' },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          'rich-text-editor-content focus:outline-none px-3 py-2 text-sm text-slate-100',
      },
    },
    onUpdate: ({ editor: current }) => {
      onChange(current.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) {
    return (
      <div
        className="rounded-lg border border-slate-700 bg-slate-900/80 animate-pulse"
        style={{ minHeight }}
      />
    );
  }

  function setLink() {
    const previous = editor?.getAttributes('link').href as string | undefined;
    const url = window.prompt('Link URL', previous || 'https://');
    if (url === null) return;
    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/80 overflow-hidden focus-within:border-accent">
      <div className="flex flex-wrap gap-1 border-b border-slate-700 bg-slate-900/90 px-2 py-1.5">
        <ToolbarButton
          title="Bold"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          B
        </ToolbarButton>
        <ToolbarButton
          title="Italic"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <span className="italic">I</span>
        </ToolbarButton>
        <ToolbarButton
          title="Heading 2"
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          title="Heading 3"
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </ToolbarButton>
        <ToolbarButton
          title="Bullet list"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          • List
        </ToolbarButton>
        <ToolbarButton
          title="Numbered list"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1. List
        </ToolbarButton>
        <ToolbarButton title="Link" active={editor.isActive('link')} onClick={setLink}>
          Link
        </ToolbarButton>
        <ToolbarButton
          title="Undo"
          disabled={!editor.can().chain().focus().undo().run()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          Undo
        </ToolbarButton>
        <ToolbarButton
          title="Redo"
          disabled={!editor.can().chain().focus().redo().run()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          Redo
        </ToolbarButton>
      </div>
      <div style={{ minHeight }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
