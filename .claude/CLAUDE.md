# CLAUDE.md — Kural İndeksi

Bu dosya, projenin **bağlayıcı kurallarını** tek noktadan indeksler. Kuralların
**tam metni** `.claude/rules/` altındadır; aşağıdaki **`@import`** satırları, bu
dosya bağlama alındığında o kuralların tam içeriğini de bağlama çeker.

> ⚠️ **Yükleme notu:** Claude Code yalnızca **kök `CLAUDE.md`** dosyasını her
> oturumda otomatik bağlama alır. Bu dosya `.claude/` altında olduğu için tek
> başına otomatik yüklenmez. Kuralların her oturumda otomatik geçerli olması için
> kökte bu dosyaya işaret eden (`@.claude/CLAUDE.md` import'lu) bir `CLAUDE.md`
> bulunmalıdır.

> ## 🔒 HER OTURUMDA GEÇERLİ — BAĞLAYICI KURALLAR
>
> Bu kurallar istisnasız uygulanır; "hatırlatılmasa bile" geçerlidir:
>
> 1. **`main`/`master`'a doğrudan commit/push YASAK.** Her iş için önce branch aç
>    (`feat/<ad>`, `fix/<ad>`, `docs/<ad>`).
> 2. **Sadece izinli stack** kullanılır ([rules/ai.md](rules/ai.md)). Listede
>    olmayan teknoloji/araç/yöntem önerilmez, uygulanmaz.
> 3. **Strapi CMS kodlaması yapılmaz** — içerik tipleri admin panelinden yönetilir;
>    web yalnızca Strapi API'sini tüketir.
> 4. Çelişki olursa öncelik: **bu indeks → `.claude/rules/*` → diğer dokümanlar**.

## Kural Kaynakları (Index)

| Konu                                     | Kaynak                                                     | Bağlayıcı? |
| ---------------------------------------- | ---------------------------------------------------------- | ---------- |
| AI çalışma kuralları + izinli stack      | [rules/ai.md](rules/ai.md)                                 | ✅ evet    |
| Klasör hiyerarşisi / mimari              | [rules/folders-structure.md](rules/folders-structure.md)   | ✅ evet    |
| Monorepo yapısı (Strapi+Next+PG+Drizzle) | [rules/monorepo-structure.md](rules/monorepo-structure.md) | ✅ evet    |
| Next.js 16 sürüm uyarısı                 | [../AGENTS.md](../AGENTS.md)                               | ✅ evet    |
| Genel kurulum / komutlar / veri katmanı  | [../README.md](../README.md)                               | —          |
| Monorepo kurulumu                        | [../docs/monorepo-setup.md](../docs/monorepo-setup.md)     | —          |
| Docker tam stack                         | [../docs/docker-setup.md](../docs/docker-setup.md)         | —          |
| Yapılan işlerin kaydı                    | [../changelog.md](../changelog.md)                         | —          |

## Branch & Commit (Conventional Commits)

- 🔒 **`main`/`master`'a doğrudan commit/push KESİNLİKLE yapılmaz.** Önce branch aç:
  `feat/<ad>`, `fix/<ad>`, `docs/<ad>`. Ana dala geçiş yalnızca PR ile yapılır.
- Commit formatı: `<type>(scope): <açıklama>` — ör. `feat(blog): add article detail page`.

## İzinli Teknolojiler (özet — tam liste [rules/ai.md](rules/ai.md))

pnpm · Next.js App Router · TypeScript · Tailwind CSS v4 · shadcn/ui (Base UI) ·
Lucide (`lucide-react`) · Strapi · PostgreSQL · Drizzle ORM · Zustand · Motion

## Otomatik İçe Aktarılan Kurallar (Claude Code `@import`)

Aşağıdaki `@` satırları, bu dosya bağlama alındığında ilgili dosyaların **tam
içeriğini** de bağlama çeker. (Bu satırları silme.)

@rules/ai.md
@rules/folders-structure.md
@rules/monorepo-structure.md
@../AGENTS.md

> Yeni bir kural dosyası (`.claude/rules/*.md` veya `docs/*.md`) eklendiğinde
> yukarıdaki **Kural Kaynakları** tablosuna ve gerekiyorsa `@import` listesine bir
> satır ekle.
