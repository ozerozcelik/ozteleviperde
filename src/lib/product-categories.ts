type SectionLike = {
  key?: string
  type: string
  title?: string
  content?: string
  items?: string[]
}

export const PRODUCT_CATEGORIES_SECTION_KEY = 'product-categories'

export const DEFAULT_PRODUCT_CATEGORIES = [
  'perdeler',
  'tekstiller',
  'yatak-odasi',
  'aksesuarlar',
]

export function normalizeProductCategories(categories: string[]) {
  return Array.from(
    new Set(
      categories
        .map((category) => category.trim())
        .filter(Boolean)
    )
  )
}

export function parseManagedProductCategories(
  sections: SectionLike[],
  options?: { fallbackToDefaults?: boolean }
) {
  const fallbackToDefaults = options?.fallbackToDefaults ?? true
  const categorySection = sections.find(
    (section) => (section.key || '').trim().toLowerCase() === PRODUCT_CATEGORIES_SECTION_KEY
  )

  if (!categorySection) {
    return fallbackToDefaults ? [...DEFAULT_PRODUCT_CATEGORIES] : []
  }

  return normalizeProductCategories(categorySection.items || [])
}

export function upsertProductCategoriesSection<T extends SectionLike>(
  sections: T[],
  categories: string[]
) {
  const normalizedCategories = normalizeProductCategories(categories)
  const nextSection = {
    key: PRODUCT_CATEGORIES_SECTION_KEY,
    type: 'features',
    title: 'Urun Kategorileri',
    content:
      'Urun formundaki kategori onerileri bu listeden gelir. Ayrica Kategoriler sekmesinden yonetilir.',
    items: normalizedCategories,
  } satisfies SectionLike

  const existingIndex = sections.findIndex(
    (section) => (section.key || '').trim().toLowerCase() === PRODUCT_CATEGORIES_SECTION_KEY
  )

  if (existingIndex === -1) {
    return [...sections, nextSection as T]
  }

  return sections.map((section, index) =>
    index === existingIndex
      ? ({
          ...section,
          ...nextSection,
        } as T)
      : section
  )
}

export function getDefaultProductCategoryValue(categories: string[]) {
  return normalizeProductCategories(categories)[0] || ''
}
