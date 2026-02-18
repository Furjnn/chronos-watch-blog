"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import LinkExt from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useRef } from "react";
import type { JSONContent } from "@tiptap/core";

interface Props {
  content: JSONContent | string | null;
  onChange: (json: JSONContent) => void;
}

function ToolbarButton({ active, onClick, children, title }: { active?: boolean; onClick: () => void; children: React.ReactNode; title: string }) {
  return (
    <button type="button" title={title} onClick={onClick}
      className={`w-8 h-8 flex items-center justify-center rounded border-none cursor-pointer transition-all text-[14px] ${active ? "bg-slate-200 text-slate-900" : "bg-transparent text-slate-500 hover:bg-slate-100"}`}>
      {children}
    </button>
  );
}

export default function TiptapEditor({ content, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Image.configure({ inline: false }),
      LinkExt.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Start writing your article..." }),
    ],
    content: content || "",
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
    editorProps: {
      attributes: { class: "prose prose-slate max-w-none min-h-[400px] outline-none px-5 py-4 text-[15px] leading-relaxed" },
    },
  });

  if (!editor) return null;

  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        editor.chain().focus().setImage({ src: data.url }).run();
      }
    } catch {
      alert("Image upload failed");
    }
  };

  const addImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
    e.target.value = "";
  };

  const addLink = () => {
    const url = prompt("Link URL:");
    if (url) editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-3 py-2 border-b border-slate-100 bg-slate-50 flex-wrap">
        <ToolbarButton title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><strong>B</strong></ToolbarButton>
        <ToolbarButton title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><em>I</em></ToolbarButton>
        <ToolbarButton title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}><s>S</s></ToolbarButton>

        <div className="w-px h-5 bg-slate-200 mx-1.5" />

        <ToolbarButton title="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</ToolbarButton>
        <ToolbarButton title="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</ToolbarButton>

        <div className="w-px h-5 bg-slate-200 mx-1.5" />

        <ToolbarButton title="Bullet List" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>•</ToolbarButton>
        <ToolbarButton title="Ordered List" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1.</ToolbarButton>
        <ToolbarButton title="Blockquote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>&ldquo;</ToolbarButton>

        <div className="w-px h-5 bg-slate-200 mx-1.5" />

        <ToolbarButton title="Upload Image" onClick={addImage}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>
        </ToolbarButton>
        <ToolbarButton title="Link" active={editor.isActive("link")} onClick={addLink}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
        </ToolbarButton>

        <div className="w-px h-5 bg-slate-200 mx-1.5" />

        <ToolbarButton title="Horizontal Rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>—</ToolbarButton>
        <ToolbarButton title="Code Block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>{"</>"}</ToolbarButton>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
