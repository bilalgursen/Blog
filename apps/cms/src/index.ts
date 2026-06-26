import type { Core } from "@strapi/strapi"

/**
 * Public (oturumsuz) rolün okuyabilmesi gereken içerik uçları.
 * Frontend bu uçlardan içerik çeker; izin verilmezse Strapi 403 döner.
 */
const PUBLIC_READ_ACTIONS = [
  "api::article.article.find",
  "api::article.article.findOne",
  "api::category.category.find",
  "api::category.category.findOne",
  "api::tag.tag.find",
  "api::tag.tag.findOne",
  // Single type: site sahibinin kimliği (hero başlığı).
  "api::profile.profile.find",
]

/**
 * Şablon (template) deneyimi: depoyu klonlayıp ilk kez çalıştıran kişi için
 * boş bir `profile` single-type'ı varsayılan metinlerle doldurur. Böylece
 * frontend hero'su ilk açılışta da dolu gelir; kullanıcı Strapi admin'den
 * yalnızca `name` ve diğer alanları kendine göre düzenler.
 */
async function seedDefaultProfile(strapi: Core.Strapi) {
  const existing = await strapi.documents("api::profile.profile").findMany({})
  if (existing && existing.length > 0) return

  await strapi.documents("api::profile.profile").create({
    data: {
      name: "Adınız",
      role: "Full-Stack Geliştirici",
      tagline: "Modern web deneyimleri tasarlıyor ve geliştiriyorum.",
      intro:
        "Bu metni Strapi admin panelinden (Content Manager → Profile) düzenleyin. Kendi adınızı, rolünüzü ve tanıtımınızı buradan yönetirsiniz.",
      location: "",
      available: true,
    },
  })
  strapi.log.info("[bootstrap] Varsayılan profil oluşturuldu (şablon).")
}

/**
 * Public role'e blog içeriği için okuma izinlerini (idempotent) verir.
 * Taze bir veritabanında (örn. Docker'ın kendi Postgres'i) bu izinler
 * tanımlı olmadığından `/api/articles` 403 döner; bu fonksiyon her açılışta
 * eksik izinleri tamamlar, böylece elle Strapi admin'den ayarlamaya gerek kalmaz.
 */
async function grantPublicReadPermissions(strapi: Core.Strapi) {
  const publicRole = await strapi
    .query("plugin::users-permissions.role")
    .findOne({ where: { type: "public" } })

  if (!publicRole) return

  for (const action of PUBLIC_READ_ACTIONS) {
    const existing = await strapi
      .query("plugin::users-permissions.permission")
      .findOne({ where: { action, role: publicRole.id } })

    if (!existing) {
      await strapi.query("plugin::users-permissions.permission").create({
        data: { action, role: publicRole.id },
      })
      strapi.log.info(`[bootstrap] Public izni eklendi: ${action}`)
    }
  }
}

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await grantPublicReadPermissions(strapi)
    await seedDefaultProfile(strapi)
  },
}
