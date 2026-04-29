# Sınav Yönetim Sistemi

Next.js 16, TypeScript ve Tailwind CSS ile geliştirilmiş, Firebase altyapısı kullanan bir sınav yönetim uygulaması.

## Özellikler

### Öğretmen Rolü
- Sisteme sınav yükleme
- Soru ve cevap yönetimi
- Sisteme öğrenci ekleme
- Sınav oluştururken istediği öğrencileri seçme
- Sınav sonuçlarını görüntüleme

### Öğrenci Rolü
- Sisteme atanmış sınavları görme
- Sınava girme
- Sınav sonuçlarını görüntüleme

## Teknoloji Yığını

- **Framework:** Next.js 16
- **Dil:** TypeScript
- **Stil:** Tailwind CSS v4
- **Backend & Auth:** Firebase (Authentication, Firestore, Storage)
- **Deploy:** Firebase Hosting

## Kurulum

### Gereksinimler

- Node.js 18+
- Firebase CLI
- Bir Firebase projesi

### Adımlar

```bash
# Bağımlılıkları yükle
npm install

# Firebase bağımlılıklarını yükle
npm install firebase

# Geliştirme sunucusunu başlat
npm run dev
```

### Firebase Kurulumu

1. [Firebase Console](https://console.firebase.google.com) üzerinden yeni bir proje oluştur.
2. Authentication, Firestore ve Storage servislerini etkinleştir.
3. Proje ayarlarından web uygulaması ekle ve SDK yapılandırmasını kopyala.
4. Proje kök dizininde `.env.local` dosyası oluştur:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

## Firebase Hosting ile Deploy

```bash
# Firebase CLI kur (eğer yoksa)
npm install -g firebase-tools

# Firebase'e giriş yap
firebase login

# Firebase'i projeye bağla
firebase init hosting

# Projeyi derle
npm run build

# Deploy et
firebase deploy
```

`firebase init hosting` adımında:
- **Public directory:** `out` (veya `Next.js` için `.next` + rewrites)
- **Single-page app:** `Yes`
- **Automatic builds with GitHub:** isteğe bağlı

## Proje Yapısı

```
app/
├── layout.tsx
├── page.tsx
├── globals.css
├── (auth)/          # Giriş / kayıt sayfaları
├── teacher/         # Öğretmen paneli
└── student/         # Öğrenci paneli
```

## Roller ve Yetkilendirme

| Özellik | Öğretmen | Öğrenci |
|---|---|---|
| Sınav yükleme | ✅ | ❌ |
| Öğrenci ekleme | ✅ | ❌ |
| Sınava girme | ❌ | ✅ |
| Sonuçları görme | ✅ | ✅ (yalnızca kendi) |
