# Medya Proxy'si (`/uploads/*`)

Strapi'ye yüklenen görseller web uygulamasının **kendi origin'inden** sunulur:
tarayıcı `http://localhost:3000/uploads/<dosya>` ister, web sunucusu bu isteği
`apps/web/src/app/uploads/[...path]/route.ts` route handler'ı ile Strapi'nin
upload klasörüne proxy'ler.

## Neden?

Eski kurulumda `mediaUrl()` görsellere `NEXT_PUBLIC_STRAPI_URL`
(`http://localhost:1337`) prefix'liyordu. Bu iki ortamda kırılıyordu:

1. **Docker dev:** `next/image` optimizer'ı görseli **web container'ının
   içinden** fetch eder; orada `localhost:1337` Strapi değil, web container'ın
   kendisidir → bağlantı reddedilir → panelden yüklenen resimler siteye hiç
   yansımaz.
2. **Prod:** `NEXT_PUBLIC_STRAPI_URL` derleme anında imaja gömülüyordu;
   build'de unutulursa `images.remotePatterns` `localhost`'a bake'lenir ve tüm
   görseller 400 döner.

Proxy ile görsel URL'leri relative (`/uploads/...`) kalır; hedef adres
(`STRAPI_INTERNAL_URL ?? NEXT_PUBLIC_STRAPI_URL ?? http://localhost:1337`)
**runtime'da** okunur. Native dev, Docker dev ve prod'da aynı kod çalışır;
`next.config.ts`'te `images.remotePatterns` / `dangerouslyAllowLocalIP`
gerekmez.

## Cache davranışı

- Strapi upload dosya adları content-hash içerir (`resim_a1b2c3.jpg`); aynı ad
  asla farklı içerikle dönmez. Bu yüzden proxy
  `Cache-Control: public, max-age=31536000, immutable` başlığı koyar —
  tarayıcı ve `next/image` optimizer'ı görseli bir kez indirir.
- Proxy, binary'leri Next'in fetch cache'ine **sokmaz** (`cache: "no-store"`);
  cache'leme tamamen HTTP başlığıyla istemci tarafında olur.
- Silinen medya için upstream 404 aynen iletilir; CMS kapalıysa 502 döner
  (istek askıda kalmaz).

## Remote upload provider'a geçerseniz (S3, Cloudinary vb.)

Strapi bu durumda **mutlak** URL'ler döndürür; `mediaUrl()` bunları olduğu
gibi geçirir ve proxy devreye girmez. Yapılması gereken tek şey
`apps/web/next.config.ts`'e ilgili host için `images.remotePatterns` eklemektir:

```ts
images: {
  remotePatterns: [{ protocol: "https", hostname: "cdn.alanadiniz.com" }],
},
```
