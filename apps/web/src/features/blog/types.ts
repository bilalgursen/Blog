/**
 * Strapi 5 içerik sözleşmeleri (REST, flattened response).
 * Article content-type'ı admin panelinden oluşturulur; bu tipler onunla eşleşir.
 */

export type StrapiMediaFormat = {
  url: string
  width: number
  height: number
}

export type StrapiMedia = {
  url: string
  alternativeText: string | null
  width: number | null
  height: number | null
  formats?: {
    thumbnail?: StrapiMediaFormat
    small?: StrapiMediaFormat
    medium?: StrapiMediaFormat
    large?: StrapiMediaFormat
  } | null
}

/** Strapi "Rich text (Blocks)" düğümleri (renderer için sadeleştirilmiş). */
export type BlockTextNode = {
  type: "text"
  text: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  code?: boolean
}

export type BlockLinkNode = {
  type: "link"
  url: string
  children: BlockTextNode[]
}

export type BlockInlineNode = BlockTextNode | BlockLinkNode

export type Block =
  | { type: "paragraph"; children: BlockInlineNode[] }
  | { type: "heading"; level: 1 | 2 | 3 | 4 | 5 | 6; children: BlockInlineNode[] }
  | {
      type: "list"
      format: "ordered" | "unordered"
      children: { type: "list-item"; children: BlockInlineNode[] }[]
    }
  | { type: "quote"; children: BlockInlineNode[] }
  | { type: "code"; children: BlockTextNode[] }
  | {
      type: "image"
      image: StrapiMedia
    }

export type Article = {
  id: number
  documentId: string
  title: string
  slug: string
  excerpt: string | null
  content: Block[] | null
  cover: StrapiMedia | null
  publishedAt: string
  updatedAt: string
}

/** Strapi liste yanıtı (meta ile). */
export type StrapiCollection<T> = {
  data: T[]
  meta: {
    pagination: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}
