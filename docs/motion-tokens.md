# Motion Token Ölçeği

Projedeki tüm animasyonların süre/easing/mesafe değerleri tek bir ölçekten gelir.
Bu ölçek, kuruluma eklenen [`transitions-dev`](../.claude/skills/transitions-dev)
skill'inin paylaşılan **motion-token** ölçeğiyle birebir hizalıdır.

> Proje kuralı gereği animasyonlar **yalnızca Motion (`motion/react`)** ile yapılır
> (bkz. `.claude/CLAUDE.md`). Skill'in saf-CSS `t-*` geçişleri **getirilmez**;
> ondan yalnızca token ölçeği alınır.

## Kaynaklar

| Taraf | Dosya | Kullanım |
| --- | --- | --- |
| Motion (JS) | `apps/web/src/lib/motion-tokens.ts` | `transition={{ duration: DURATION.verySlow, ease: SMOOTH_OUT }}` |
| CSS | `apps/web/src/app/globals.css` (`:root`) | `animation-duration: var(--duration-slow)` |

İki taraf da **aynı değerleri** taşır; bir değeri değiştirirken ikisini birlikte güncelle.

## Token ölçeği

**Süreler** (TS'te saniye, CSS'te ms)

| TS | CSS | Değer | Kullanım |
| --- | --- | --- | --- |
| `DURATION.stagger` | `--duration-stagger` | 40ms | öğe başına stagger gecikmesi |
| `DURATION.micro` | `--duration-micro` | 80ms | tooltip/path gecikmesi, shake segmenti |
| `DURATION.quick` | `--duration-quick` | 150ms | hızlı mikro-etkileşim, kapanış, metin değişimi |
| `DURATION.fast` | `--duration-fast` | 250ms | ikon değişimi, açılış, sekme kayması |
| `DURATION.medium` | `--duration-medium` | 350ms | panel/toast kapanış |
| `DURATION.slow` | `--duration-slow` | 400ms | panel açılış, View Transition |
| `DURATION.verySlow` | `--duration-very-slow` | 500ms | vurgu, giriş animasyonu, rozet belirme |

**Easing**

| TS | CSS | Değer | Kullanım |
| --- | --- | --- | --- |
| `EASE.smoothOut` / `SMOOTH_OUT` | `--ease-smooth-out` | `cubic-bezier(0.22, 1, 0.36, 1)` | proje standardı (tüm geçişler) |
| `EASE.bounce` | `--ease-bounce` | `cubic-bezier(0.34, 1.36, 0.64, 1)` | rozet pop açılışı |
| `EASE.bounceStrong` | `--ease-bounce-strong` | `cubic-bezier(0.34, 3.85, 0.64, 1)` | zıplayan hover-out |

**Mesafeler** (`DISTANCE`, px): `micro 4`, `small 6`, `base 8`, `medium 12`, `large 30`.

## Bağlı yerler

- `components/motion.tsx` — `FadeIn` giriş efekti → `verySlow` + `SMOOTH_OUT`
- `features/portfolio/components/home-showcase.tsx` — hero/kart girişi → `verySlow`
- `components/shared/custom-cursor.tsx` — cursor fade → `fast`
- `components/shared/corner-icons.tsx` — köşe ikon reveal → `quick`
- `app/globals.css` — View Transitions → `--duration-slow` + `--ease-smooth-out`

## Yeni animasyon eklerken

1. Süre ve easing'i **token'dan** seç (`DURATION.*`, `SMOOTH_OUT`/`EASE.*`).
2. Yeni sabit süre/easing yazma; uygun token yoksa önce `motion-tokens.ts` + `globals.css`'e ekle.
3. `transitions-dev` skill'i bir kullanım için hangi token'ın uygun olduğunu
   eşlemekte yardımcı olur (`transitions refine`).
