import Image from "next/image"
import { Fragment } from "react"

import { mediaUrl } from "@/src/lib/strapi"

/**
 * Minimal, dependency-free renderer for Strapi's Rich text (Blocks) field.
 * Covers the node types the editor can produce: paragraph, heading, list,
 * quote, code and image, plus inline marks and links.
 */

interface TextNode {
  type: "text"
  text: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  code?: boolean
}

interface LinkNode {
  type: "link"
  url: string
  children: TextNode[]
}

type InlineNode = TextNode | LinkNode

interface ParagraphNode {
  type: "paragraph"
  children: InlineNode[]
}

interface HeadingNode {
  type: "heading"
  level: 1 | 2 | 3 | 4 | 5 | 6
  children: InlineNode[]
}

interface ListItemNode {
  type: "list-item"
  children: InlineNode[]
}

interface ListNode {
  type: "list"
  format: "ordered" | "unordered"
  children: ListItemNode[]
}

interface QuoteNode {
  type: "quote"
  children: InlineNode[]
}

interface CodeNode {
  type: "code"
  children: TextNode[]
}

interface ImageNode {
  type: "image"
  image: {
    url: string
    alternativeText: string | null
    width: number | null
    height: number | null
  }
}

type BlockNode =
  | ParagraphNode
  | HeadingNode
  | ListNode
  | QuoteNode
  | CodeNode
  | ImageNode

export type BlocksContent = BlockNode[]

function Inline({ node, index }: { node: InlineNode; index: number }) {
  if (node.type === "link") {
    return (
      <a
        href={node.url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-primary underline underline-offset-4"
      >
        {node.children.map((child, i) => (
          <Inline key={i} node={child} index={i} />
        ))}
      </a>
    )
  }

  let content: React.ReactNode = node.text
  if (node.code) content = <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em]">{content}</code>
  if (node.bold) content = <strong className="font-semibold">{content}</strong>
  if (node.italic) content = <em>{content}</em>
  if (node.underline) content = <u>{content}</u>
  if (node.strikethrough) content = <s>{content}</s>

  return <Fragment key={index}>{content}</Fragment>
}

function Children({ nodes }: { nodes: InlineNode[] }) {
  return (
    <>
      {nodes.map((node, i) => (
        <Inline key={i} node={node} index={i} />
      ))}
    </>
  )
}

const headingClasses: Record<number, string> = {
  1: "mt-10 mb-4 font-heading text-4xl font-medium",
  2: "mt-10 mb-4 font-heading text-3xl font-medium",
  3: "mt-8 mb-3 font-heading text-2xl font-medium",
  4: "mt-6 mb-2 font-heading text-xl font-medium",
  5: "mt-6 mb-2 font-heading text-lg font-medium",
  6: "mt-6 mb-2 font-heading text-base font-medium",
}

function Block({ node }: { node: BlockNode }) {
  switch (node.type) {
    case "paragraph": {
      // Strapi emits empty paragraphs as spacing; skip them.
      const isEmpty =
        node.children.length === 1 &&
        node.children[0].type === "text" &&
        node.children[0].text === ""
      if (isEmpty) return null
      return (
        <p className="my-4 leading-7">
          <Children nodes={node.children} />
        </p>
      )
    }
    case "heading": {
      const Tag = `h${node.level}` as const
      return (
        <Tag className={headingClasses[node.level]}>
          <Children nodes={node.children} />
        </Tag>
      )
    }
    case "list": {
      const ListTag = node.format === "ordered" ? "ol" : "ul"
      return (
        <ListTag
          className={
            node.format === "ordered"
              ? "my-4 list-decimal space-y-2 pl-6"
              : "my-4 list-disc space-y-2 pl-6"
          }
        >
          {node.children.map((item, i) => (
            <li key={i} className="leading-7">
              <Children nodes={item.children} />
            </li>
          ))}
        </ListTag>
      )
    }
    case "quote":
      return (
        <blockquote className="my-6 border-l-2 border-primary pl-6 text-muted-foreground italic">
          <Children nodes={node.children} />
        </blockquote>
      )
    case "code":
      return (
        <pre className="my-6 overflow-x-auto rounded-xl bg-muted p-4 font-mono text-sm">
          <code>{node.children.map((c) => c.text).join("")}</code>
        </pre>
      )
    case "image": {
      const url = mediaUrl(node.image.url)
      if (!url) return null
      return (
        <Image
          src={url}
          alt={node.image.alternativeText ?? ""}
          width={node.image.width ?? 1200}
          height={node.image.height ?? 675}
          className="my-6 h-auto w-full rounded-xl"
        />
      )
    }
    default:
      return null
  }
}

export function BlocksRenderer({ content }: { content: BlocksContent }) {
  if (!content?.length) return null
  return (
    <>
      {content.map((node, i) => (
        <Block key={i} node={node} />
      ))}
    </>
  )
}
