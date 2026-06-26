/**
 * Showcase kartı ile yazı detayı arasında paylaşılan eleman morph'u (View
 * Transitions API). Aynı `view-transition-name`'i taşıyan kapak görselleri,
 * sayfa geçişinde tarayıcı tarafından birbirine dönüştürülür (morph).
 *
 * İsim bir CSS custom-ident olmalı: rakamla başlayamaz, boşluk içeremez.
 * Bu yüzden `cover-` ön eki ve güvenli karakter temizliği uygulanır.
 */
export function coverVtName(slug: string): string {
  return `cover-${slug.replace(/[^a-zA-Z0-9_-]/g, "-")}`
}
