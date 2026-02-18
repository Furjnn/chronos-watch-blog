/* eslint-disable @next/next/no-img-element */
import React from "react";
import type { JSONContent } from "@tiptap/core";

// Renders Tiptap JSON content to React elements
export function renderTiptapContent(doc: JSONContent): React.ReactNode[] {
  if (!doc || !doc.content) return [];
  return doc.content.map((node, i) => renderNode(node, i));
}

function renderNode(node: JSONContent, key: number): React.ReactNode {
  const attrs = (node.attrs ?? {}) as Record<string, unknown>;
  switch (node.type) {
    case "heading": {
      const level = typeof attrs.level === "number" ? attrs.level : 2;
      const text = getTextContent(node);
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      if (level === 2) return <h2 key={key} id={id} className="text-[30px] font-medium text-[var(--charcoal)] mt-12 mb-5 pt-5" style={{ fontFamily: "var(--font-display)" }}>{renderInline(node)}</h2>;
      return <h3 key={key} id={id} className="text-[22px] font-medium text-[var(--charcoal)] mt-8 mb-4" style={{ fontFamily: "var(--font-display)" }}>{renderInline(node)}</h3>;
    }
    case "paragraph":
      return <p key={key} className="text-[16.5px] text-[var(--text)] leading-[1.85] mb-6">{renderInline(node)}</p>;
    case "bulletList":
      return <ul key={key} className="list-disc pl-6 mb-6 space-y-2">{node.content?.map((li, j) => renderNode(li, j))}</ul>;
    case "orderedList":
      return <ol key={key} className="list-decimal pl-6 mb-6 space-y-2">{node.content?.map((li, j) => renderNode(li, j))}</ol>;
    case "listItem":
      return <li key={key} className="text-[16.5px] text-[var(--text)] leading-[1.85]">{node.content?.map((contentNode) => renderInline(contentNode))}</li>;
    case "blockquote":
      return <blockquote key={key} className="my-10 py-6 pl-7 border-l-[3px] border-[var(--gold)] text-[24px] font-normal italic text-[var(--charcoal)] leading-snug" style={{ fontFamily: "var(--font-display)" }}>{node.content?.map((contentNode, j) => renderNode(contentNode, j))}</blockquote>;
    case "codeBlock":
      return <pre key={key} className="bg-[var(--bg-off)] border border-[var(--border)] p-5 mb-6 overflow-x-auto text-[14px]"><code>{getTextContent(node)}</code></pre>;
    case "horizontalRule":
      return <hr key={key} className="my-10 border-t border-[var(--border)]" />;
    case "image":
      if (typeof attrs.src !== "string") return null;
      return (
        <figure key={key} className="my-9 -mx-4 md:-mx-16 text-center">
          <img src={attrs.src} alt={typeof attrs.alt === "string" ? attrs.alt : ""} className="w-full object-cover" style={{ maxHeight: 440 }} />
        </figure>
      );
    default:
      return null;
  }
}

function renderInline(node: JSONContent): React.ReactNode {
  if (!node.content) return null;
  return node.content.map((child, i) => {
    if (child.type === "text") {
      let el: React.ReactNode = child.text;
      if (child.marks) {
        for (const mark of child.marks) {
          const markAttrs = (mark.attrs ?? {}) as Record<string, unknown>;
          if (mark.type === "bold") el = <strong key={i} className="font-semibold text-[var(--charcoal)]">{el}</strong>;
          else if (mark.type === "italic") el = <em key={i}>{el}</em>;
          else if (mark.type === "strike") el = <s key={i}>{el}</s>;
          else if (mark.type === "link") el = <a key={i} href={typeof markAttrs.href === "string" ? markAttrs.href : undefined} className="text-[var(--gold)] underline" target="_blank" rel="noopener">{el}</a>;
          else if (mark.type === "code") el = <code key={i} className="bg-[var(--bg-off)] px-1.5 py-0.5 text-[14px]">{el}</code>;
        }
      }
      return <React.Fragment key={i}>{el}</React.Fragment>;
    }
    if (child.type === "hardBreak") return <br key={i} />;
    return null;
  });
}

function getTextContent(node: JSONContent): string {
  if (!node.content) return "";
  return node.content.map((c: JSONContent) => {
    if (c.type === "text") return c.text || "";
    if (c.content) return getTextContent(c);
    return "";
  }).join("");
}
