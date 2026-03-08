const ALLOWED_TAGS = new Set([
  'a',
  'b',
  'blockquote',
  'br',
  'code',
  'div',
  'em',
  'figcaption',
  'figure',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'img',
  'li',
  'ol',
  'p',
  'pre',
  'span',
  'strong',
  'ul',
])

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(['href', 'title', 'target', 'rel']),
  img: new Set(['src', 'alt', 'title', 'width', 'height']),
  '*': new Set(['class']),
}

const BLOCKED_TAGS = [
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'form',
  'input',
  'button',
  'textarea',
  'select',
  'option',
  'meta',
  'link',
  'base',
  'svg',
  'math',
]

const TAG_RE = /<\/?([a-zA-Z0-9-]+)([^>]*)>/g
const ATTR_RE =
  /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g

type SanitizeUrlOptions = {
  allowAnchor?: boolean
  allowDataImage?: boolean
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export function sanitizeUrl(
  value: string | null | undefined,
  options: SanitizeUrlOptions = {}
) {
  if (!value) return null

  const trimmed = value.trim()
  if (!trimmed) return null

  const normalized = trimmed.replace(/[\u0000-\u001F\u007F\s]+/g, '')
  const lower = normalized.toLowerCase()

  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('data:text/html') ||
    lower.startsWith('data:application')
  ) {
    return null
  }

  if (options.allowDataImage && /^data:image\/[a-z0-9.+-]+;base64,/i.test(trimmed)) {
    return trimmed
  }

  if (
    trimmed.startsWith('/') ||
    trimmed.startsWith('./') ||
    trimmed.startsWith('../') ||
    trimmed.startsWith('?') ||
    (options.allowAnchor && trimmed.startsWith('#'))
  ) {
    return trimmed
  }

  if (/^(https?:|mailto:|tel:)/i.test(trimmed)) {
    return trimmed
  }

  return null
}

export function sanitizeImageUrl(value: string | null | undefined) {
  return sanitizeUrl(value, { allowDataImage: true })
}

export function stripHtmlTags(value: string | null | undefined) {
  if (!value) return ''
  return value.replace(/<[^>]+>/g, '').trim()
}

function sanitizeAttributes(tagName: string, rawAttrs: string) {
  const allowed = new Set([
    ...(ALLOWED_ATTRS['*'] ? Array.from(ALLOWED_ATTRS['*']) : []),
    ...(ALLOWED_ATTRS[tagName] ? Array.from(ALLOWED_ATTRS[tagName]) : []),
  ])

  const attrs: string[] = []
  let match: RegExpExecArray | null

  while ((match = ATTR_RE.exec(rawAttrs)) !== null) {
    const attrName = match[1].toLowerCase()
    const attrValue = match[3] ?? match[4] ?? match[5] ?? ''

    if (!allowed.has(attrName)) continue
    if (attrName.startsWith('on')) continue
    if (attrName === 'style' || attrName === 'srcdoc' || attrName === 'formaction') continue

    if (attrName === 'href' || attrName === 'src') {
      const safeUrl =
        attrName === 'src'
          ? sanitizeImageUrl(attrValue)
          : sanitizeUrl(attrValue, { allowAnchor: true })
      if (!safeUrl) continue
      attrs.push(`${attrName}="${escapeHtml(safeUrl)}"`)
      continue
    }

    if (attrName === 'target') {
      const safeTarget = ['_blank', '_self'].includes(attrValue) ? attrValue : '_self'
      attrs.push(`target="${safeTarget}"`)
      if (tagName === 'a') {
        attrs.push('rel="noopener noreferrer"')
      }
      continue
    }

    if (attrName === 'rel' && tagName === 'a') {
      attrs.push(`rel="${escapeHtml(attrValue)}"`)
      continue
    }

    attrs.push(`${attrName}="${escapeHtml(attrValue)}"`)
  }

  return attrs.length ? ` ${Array.from(new Set(attrs)).join(' ')}` : ''
}

export function sanitizeRichHtml(value: string | null | undefined): string {
  if (!value) return ''

  let sanitized = value
    .replace(/<!--[\s\S]*?-->/g, '')

  for (const tag of BLOCKED_TAGS) {
    const blockTagPattern = new RegExp(
      `<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`,
      'gi'
    )
    const selfClosingPattern = new RegExp(`<${tag}\\b[^>]*\\/?>`, 'gi')
    sanitized = sanitized.replace(blockTagPattern, '')
    sanitized = sanitized.replace(selfClosingPattern, '')
  }

  return sanitized.replace(TAG_RE, (fullMatch, rawTagName: string, rawAttrs: string) => {
    const tagName = rawTagName.toLowerCase()
    const isClosing = fullMatch.startsWith('</')

    if (!ALLOWED_TAGS.has(tagName)) {
      return ''
    }

    if (isClosing) {
      return `</${tagName}>`
    }

    const attrs = sanitizeAttributes(tagName, rawAttrs)
    const selfClosing = /\/>$/.test(fullMatch) || tagName === 'img' || tagName === 'br' || tagName === 'hr'
    return selfClosing ? `<${tagName}${attrs} />` : `<${tagName}${attrs}>`
  })
}

export function sanitizeJsonLd(value: string | null | undefined): string | null {
  if (!value) return null

  try {
    const parsed = JSON.parse(value)
    if (
      parsed === null ||
      (typeof parsed !== 'object' && !Array.isArray(parsed))
    ) {
      return null
    }

    return JSON.stringify(parsed)
  } catch {
    return null
  }
}
