import Image from "next/image"

import { strapiMedia } from "@/src/lib/strapi"
import type { Block, BlockInlineNode, BlockTextNode } from "../types"

/** Tek bir metin düğümünü (kalın/italik/kod vb.) işler. */
function renderText(node: BlockTextNode, key: number) {
  if (node.text === "") return null
  let el: React.ReactNode = node.text

  if (node.bold) el = <strong key={key}>{el}</strong>
  if (node.italic) el = <em key={key}>{el}</em>
  if (node.underline) el = <u key={key}>{el}</u>
  if (node.strikethrough) el = <s key={key}>{el}</s>
  if (node.code)
    el = (
      <code
        key={key}
        className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em]"
      >
        {el}
      </code>
    )

  return <span key={key}>{el}</span>
}

/** Paragraf/başlık içindeki satır-içi düğümleri (metin + link) işler. */
function renderInline(children: BlockInlineNode[]) {
  return children.map((child, i) => {
    if (child.type === "link") {
      return (
        <a
          key={i}
          href={child.url}
          className="font-medium text-primary underline underline-offset-4"
          target={child.url.startsWith("http") ? "_blank" : undefined}
          rel={child.url.startsWith("http") ? "noreferrer" : undefined}
        >
          {child.children.map((t, j) => renderText(t, j))}
        </a>
      )
    }
    return renderText(child, i)
  })
}

const HEADING_STYLES: Record<number, string> = {
  1: "mt-10 mb-4 text-3xl font-semibold tracking-tight",
  2: "mt-10 mb-3 text-2xl font-semibold tracking-tight",
  3: "mt-8 mb-3 text-xl font-semibold tracking-tight",
  4: "mt-6 mb-2 text-lg font-semibold",
  5: "mt-6 mb-2 text-base font-semibold",
  6: "mt-6 mb-2 text-sm font-semibold uppercase tracking-wide",
}

/** Strapi "Rich text (Blocks)" içeriğini Tailwind ile render eder (bağımlılıksız). */
export function BlocksRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <div className="text-base leading-7 text-foreground/90">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "paragraph":
            return (
              <p key={i} className="my-4">
                {renderInline(block.children)}
              </p>
            )

          case "heading": {
            const Tag = `h${block.level}` as React.ElementType
            return (
              <Tag key={i} className={HEADING_STYLES[block.level]}>
                {renderInline(block.children)}
              </Tag>
            )
          }

          case "list": {
            const Tag = block.format === "ordered" ? "ol" : "ul"
            return (
              <Tag
                key={i}
                className={
                  block.format === "ordered"
                    ? "my-4 list-decimal space-y-1 pl-6"
                    : "my-4 list-disc space-y-1 pl-6"
                }
              >
                {block.children.map((item, j) => (
                  <li key={j}>{renderInline(item.children)}</li>
                ))}
              </Tag>
            )
          }

          case "quote":
            return (
              <blockquote
                key={i}
                className="my-6 border-l-4 border-border pl-4 text-muted-foreground italic"
              >
                {renderInline(block.children)}
              </blockquote>
            )

          case "code":
            return (
              <pre
                key={i}
                className="my-6 overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm"
              >
                <code>{block.children.map((t) => t.text).join("")}</code>
              </pre>
            )

          case "image": {
            const src = strapiMedia(block.image.url)
            if (!src) return null
            return (
              <Image
                key={i}
                src={src}
                alt={block.image.alternativeText ?? ""}
                width={block.image.width ?? 1200}
                height={block.image.height ?? 675}
                className="my-6 h-auto w-full rounded-lg"
              />
            )
          }

          default:
            return null
        }
      })}
    </div>
  )
}
