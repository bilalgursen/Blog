/**
 * Motion token ölçeği — projedeki tüm Motion (`motion/react`) animasyonlarının
 * tek kaynağı. transitions-dev skill'inin paylaşılan motion-token ölçeğiyle
 * birebir hizalıdır; böylece süre/easing değerleri dosyalara dağılmış sabitler
 * yerine tek yerden yönetilir.
 *
 * CSS tarafı (View Transitions vb.) aynı değerleri `app/globals.css` içindeki
 * `:root` değişkenlerinden okur: `var(--duration-*)`, `var(--ease-*)`.
 *
 * Not: Bu proje **yalnızca Motion** ile animasyon yapar (bkz. CLAUDE.md). Bu
 * modül skill'in saf-CSS geçişlerini getirmez; yalnızca token ölçeğini Motion'a
 * taşır.
 */

/** Easing eğrileri (Motion `ease` için bezier dizisi). */
export const EASE = {
  /** Proje standardı: aç/kapa, geçiş, yeniden boyut, konum. */
  smoothOut: [0.22, 1, 0.36, 1],
  /** Rozet pop açılışı. */
  bounce: [0.34, 1.36, 0.64, 1],
  /** Zıplayan hover-out (avatar dönüşü). */
  bounceStrong: [0.34, 3.85, 0.64, 1],
} as const

/**
 * Tek standart easing'in kısa yolu. Proje genelinde varsayılan eğri budur;
 * `transition={{ ease: SMOOTH_OUT }}` şeklinde kullanılır.
 */
export const SMOOTH_OUT = EASE.smoothOut

/** Animasyon süreleri (saniye — Motion `duration` birimi). */
export const DURATION = {
  /** Öğe başına stagger gecikmesi. */
  stagger: 0.04,
  /** Tooltip/path gecikmesi, shake segmenti. */
  micro: 0.08,
  /** Hızlı mikro-etkileşim, modal/dropdown kapanış, metin değişimi. */
  quick: 0.15,
  /** İkon değişimi, dropdown/modal açılış, sekme kayması. */
  fast: 0.25,
  /** Panel/toast kapanış. */
  medium: 0.35,
  /** Panel açılış, View Transition. */
  slow: 0.4,
  /** Vurgu anları, giriş animasyonu, rozet belirme. */
  verySlow: 0.5,
} as const

/** Hareket mesafeleri (px). */
export const DISTANCE = {
  micro: 4,
  small: 6,
  base: 8,
  medium: 12,
  large: 30,
} as const
