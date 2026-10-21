import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Server => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  // Dışarıdan erişilen tam adres (ör. https://cms.alanadiniz.com). Üretimde
  // docker-compose.prod.yml set eder; boşsa Strapi göreli URL kullanır.
  // Derleme anında boş kaldığı için admin paneli her alan adında çalışır.
  url: env('PUBLIC_URL', ''),
  // Caddy/Nginx arkasında X-Forwarded-* başlıklarına güven: istek HTTPS
  // olarak algılanır ve admin oturum çerezleri `secure` işaretlenir.
  proxy: { koa: env.bool('IS_PROXIED', false) },
  app: {
    keys: env.array('APP_KEYS'),
  },
});

export default config;
