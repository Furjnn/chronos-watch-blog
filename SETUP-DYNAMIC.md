# CHRONOS — Sanity CMS Dinamik Yapı Kurulumu

## Adım 1: Sanity Hesabı ve Proje Oluştur

1. https://www.sanity.io adresinden **ücretsiz hesap** oluştur
2. https://www.sanity.io/manage adresinde **"Create Project"** tıkla
   - Proje adı: `Chronos CMS`
   - Plan: **Free** (yeterli)
3. Proje oluşturulunca **Project ID**'ni kopyala (örn: `abc123xy`)

## Adım 2: API Token Oluştur

1. Sanity Dashboard → **API** sekmesi → **Tokens** → **"Add API Token"**
2. Ayarlar:
   - Name: `Chronos Dev`
   - Permissions: **Editor** (read + write — seed script için lazım)
3. Token'ı kopyala (sadece bir kere gösterilir!)

## Adım 3: Bağımlılıkları Kur

```bash
cd chronos-watch-blog

npm install sanity@latest next-sanity@latest @sanity/image-url @portabletext/react
```

## Adım 4: Dosyaları Kopyala

Bu zip'ten çıkan dosyaları projenin **root klasörüne** kopyala:

- `sanity.config.ts` → root'a
- `sanity.cli.ts` → root'a
- `next.config.ts` → root'taki üzerine yaz
- `sanity/` → root'a (klasör olarak)
- `app/studio/` → mevcut `app/` içine
- `app/api/seed/` → mevcut `app/api/` içine

## Adım 5: .env.local Oluştur

Proje root'unda `.env.local` dosyası oluştur:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID="senin-project-id-buraya"
NEXT_PUBLIC_SANITY_DATASET="production"
SANITY_API_WRITE_TOKEN="senin-write-token-buraya"
SANITY_REVALIDATE_SECRET="chronos-secret-2026"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

## Adım 6: tsconfig.json Güncelle

`tsconfig.json`'daki `paths` kısmına `sanity` yolunu ekle:

```json
"paths": {
  "@/*": ["./*"]
}
```

Bu zaten doğruydu, değişiklik gerekmez.

## Adım 7: CORS Ayarı

1. https://www.sanity.io/manage → projen → **API** → **CORS origins**
2. **"Add CORS origin"** tıkla
3. Origin: `http://localhost:3000`
4. **"Allow credentials"** seçeneğini işaretle ✅
5. Save

## Adım 8: Projeyi Başlat

```bash
npm run dev
```

## Adım 9: Sanity Studio'yu Test Et

Tarayıcıda `http://localhost:3000/studio` aç.
Sanity login ekranı gelecek — Google hesabınla giriş yap.
CMS panelini göreceksin (henüz içerik yok).

## Adım 10: Demo İçerik Ekle (Seed)

Tarayıcıda şu URL'yi aç:

```
http://localhost:3000/api/seed
```

Bu otomatik olarak şunları oluşturacak:
- 4 Yazar
- 8 Kategori
- 10 Tag
- 9 Marka
- 8 Blog Yazısı
- 1 Review
- Site Settings

Başarılı olursa JSON yanıt göreceksin:
```json
{ "success": true, "message": "Seed data created!" }
```

## Adım 11: Kontrol Et

1. `http://localhost:3000/studio` → İçeriklerin geldiğini gör
2. `http://localhost:3000` → Ana sayfa (henüz mock data gösteriyor)

## Sonraki Adım

Bana haber ver, sayfaları Sanity'den gerçek veri çekecek şekilde güncelleyelim!
