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
]

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
  },
}
