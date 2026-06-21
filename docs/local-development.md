# 💻 Yerel Geliştirme ve Performans Rehberi

Bu proje bir **pnpm workspace monorepo**'dur ve iki ağır uygulama içerir:

- **`apps/web`** — Next.js 16 (App Router) frontend
- **`apps/cms`** — Strapi 5 (admin paneli + içerik API'si)

Bu rehber, yerel geliştirmede hangi komutun ne kadar kaynak tükettiğini ve makineni
nasıl rahatlatacağını açıklar.

---

## ⚠️ Native ve Docker AYRI veritabanı kullanır

- **Native** (`pnpm dev:cms`): host'taki yerel PostgreSQL'e bağlanır (`POSTGRES_HOST=localhost`).
- **Docker** (`pnpm docker:up`): compose'daki `blog_postgres` container'ına bağlanır (kendi `postgres_data` volume'u).

Bu yüzden native'de gördüğün yazılar/ayarlar Docker'da **yok** (ve tersi). Örneğin
Public rol izinleri her DB'de ayrı tutulur — bu, Docker'da `/api/articles` isteklerinin
**403** dönmesinin sebebiydi. Çözüm olarak izinler artık `apps/cms/src/index.ts`
`bootstrap`'ında koddan veriliyor; böylece hangi DB olursa olsun açılışta otomatik ayarlanır.

---

## 🔄 Strapi'de yayınlanan içerik ne zaman görünür? (revalidation)

`apps/web/src/lib/strapi.ts`, Strapi yanıtlarını `next: { revalidate: 60, tags: ["articles"] }`
ile önbelleğe alır. Bu yüzden bir yazıyı yayınladığında frontend yeni içeriği
**en geç 60 sn** içinde gösterir (ilk ziyaretçi arka planda cache'i tazeler).

> Otomatik Strapi webhook'u **bilinçli olarak kaldırıldı**: her publish/update'te
> revalidation tetiklemek yerine zaman temelli (60 sn) yenilenme tercih edildi.
> Yük sabittir — ziyaretçi sayısından bağımsız olarak Strapi'ye route başına
> dakikada ~1 istek gider (stale-while-revalidate).

**Acil bir düzenlemeyi beklemeden yansıtmak için (manuel on-demand revalidation):**

`apps/web/src/app/api/revalidate/route.ts` endpoint'i `revalidateTag("articles")`
çağırır ve `REVALIDATE_SECRET` ile korunur (`.env`'de tanımlı). Elle tetikle:

```bash
curl -X POST "http://localhost:3000/api/revalidate?secret=<REVALIDATE_SECRET>"
# → {"revalidated":true,...}
```

Çağrıdan sonra yazı saniyesinde frontend'e düşer.

> ⚠️ **Docker notu:** Native `pnpm dev:web` ile Docker web container'ını **aynı anda çalıştırma**:
> ikisi de bind-mount üzerinden aynı `apps/web/.next` klasörüne yazıp Turbopack
> cache'ini bozar. Bu olduysa: `rm -rf apps/web/.next` ile temizle.

---

## ⚠️ `pnpm dev` neden makineyi zorluyor?

Kök `package.json`'daki varsayılan komut **iki dev sunucusunu aynı anda** başlatır:

```jsonc
"dev": "pnpm --parallel --filter \"./apps/*\" dev"
```

Bu, `apps/web` (Next.js) **ve** `apps/cms` (`strapi develop`) süreçlerini paralel
çalıştırır. İkisi birlikte ciddi CPU ve RAM tüketir:

| Süreç | Yük | Sebep |
| --- | --- | --- |
| `strapi develop` | **Yüksek** (~1–1.5 GB RAM) | Tüm content-type'ları + eklentileri yükler; içerik tipi değişikliklerinde admin panelini yeniden derler. |
| `next dev` | Orta | Turbopack ile sayfa derlemesi (Next 16'da dev'de varsayılan). |

> **Sonuç:** İki ayrı Node süreci + iki ayrı derleme zinciri aynı anda döner.
> Çoğu zaman ikisine birden ihtiyacın yoktur.

---

## 🪶 En hafif kurulum: yalnızca `dev:web`

Frontend/arayüz geliştirirken **Strapi'yi açman gerekmez.** `apps/web/src/lib/strapi.ts`
CMS'e ulaşamadığında hata fırlatmaz; uyarı loglar ve boş veri döner. Sonuç:

- `pnpm dev:web` tek başına çalışır, ana sayfa ve `/blog` **500 değil 200** döner
  (yazı listesi boş görünür — "Henüz yayınlanmış bir yazı yok.").
- Strapi'yi yalnızca **gerçek içerik görmen** ya da içerik tipi düzenlemen gerektiğinde aç.

> Bu, en az kaynak tüketen ve makineyi en az yoran yöntemdir.

### 🩺 Editör (Cursor/VS Code) kasıyorsa

Repo kökündeki `.vscode/settings.json`, ağır klasörleri (`node_modules`, `.next`,
`.turbo`, `.strapi`, `dist`) dosya izleyici/arama/TypeScript taramasından çıkarır.
Bu dosya silinirse editör tüm `node_modules`'ü (≈1.3 GB) indekslemeye çalışır ve
CPU sürekli yükselir. Ayrıca dev sunucusunu **Cursor'ın entegre terminalinde değil,
ayrı bir terminalde** çalıştırmak editörün bellek yükünü azaltır.

---

## ✅ Önerilen Geliştirme Komutları

İhtiyacına göre **sadece gerekeni** çalıştır:

| Komut | Ne yapar | Ne zaman kullan |
| --- | --- | --- |
| `pnpm dev:web` | Sadece Next.js (frontend) | **En sık.** Arayüz/sayfa geliştirirken. Strapi'ye dokunmuyorsan bunu kullan. |
| `pnpm dev:cms` | Sadece Strapi (`develop`, watch'lı) | İçerik tipi (content-type) / şema / eklenti **düzenlerken**. |
| `pnpm dev:cms:start` | Strapi'yi **bir kez build edip** watch'sız çalıştırır | Strapi'nin ayakta olmasını istiyor ama içerik tipini düzenlemiyorsan. Çok daha hafiftir. |
| `pnpm dev:light` | Strapi'yi bir kez build edip **watch'sız** + Next dev'i **birlikte** çalıştırır | İkisine birden ihtiyacın var ama makineni yormak istemiyorsan. |
| `pnpm dev` | İkisini de **watch modunda** paralel | Tam canlı geliştirme (en ağır). Gerçekten ikisini de aktif düzenliyorsan. |

### `dev:light` nasıl çalışıyor?

```jsonc
"dev:light": "pnpm --filter cms build && sh -c 'trap \"kill 0\" INT TERM; pnpm --filter cms start & pnpm --filter web dev & wait'"
```

1. Strapi admin panelini **bir kez** derler (`strapi build`).
2. Strapi'yi `start` modunda (watch yok → sürekli yeniden derleme yok) arka planda çalıştırır.
3. Next.js dev sunucusunu çalıştırır.
4. `Ctrl+C` ile ikisini birden temiz şekilde kapatır (`trap "kill 0" EXIT`).

> **Not:** `dev:light` ve `dev:cms:start`, Strapi'yi watch'sız çalıştırdığı için
> **içerik tipi (content-type) değişiklikleri otomatik yansımaz.** Şema düzenlemen
> gerekiyorsa `pnpm dev:cms` (develop) kullan.

---

## 🧰 Alternatif: İki ayrı terminal

En esnek yöntem, iki ayrı terminalde çalıştırmaktır:

```bash
# Terminal 1
pnpm dev:web

# Terminal 2 (yalnızca gerektiğinde)
pnpm dev:cms
```

Böylece Strapi'yi yalnızca lazım olduğunda açar, frontend'i bağımsız çalıştırırsın.

---

## 🐳 Docker ile çalıştırma

Tüm stack'i (Postgres + Strapi + Next.js) container içinde çalıştırmak istersen
`pnpm docker:up` kullan. Detaylar için: [docker-setup.md](docker-setup.md).

Docker, host makinedeki CPU/RAM'i de tüketir; düşük donanımlı makinelerde yine de
yukarıdaki seçici komutlar daha hafiftir.

---

## 🩺 Hızlı teşhis

`pnpm dev` çalışırken hangi sürecin yorduğunu görmek için:

- **macOS:** Activity Monitor → CPU sekmesi → `node` süreçlerine bak.
- **Terminal:** `top -o cpu` veya `htop`.

Genellikle en çok tüketen `strapi` (admin watcher) sürecidir. Onu `dev:cms:start`
ile watch'sız çalıştırmak yükü belirgin şekilde düşürür.
