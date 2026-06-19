# Katalog Objek 3D 360°

Website statis berisi 5 objek 3D interaktif yang bisa dirotasi 360 derajat menggunakan mouse atau layar sentuh.

## Isi Website

- Roket Eksplorasi
- Robot Asisten
- Mobil Sport
- Satelit Orbit
- Rumah Modern

Semua objek dibuat secara prosedural menggunakan geometri Three.js, sehingga tidak memerlukan file model `.glb`, `.gltf`, `.obj`, atau asset tambahan.

## Struktur File

```text
website-3d-rotasi-360/
├── index.html
├── style.css
├── script.js
└── README.md
```

## Cara Menjalankan di Komputer

Karena `script.js` menggunakan JavaScript module, jalankan dengan local server. Pilihan cepat:

```bash
python -m http.server 8000
```

Lalu buka:

```text
http://localhost:8000
```

## Cara Upload ke GitHub Pages

1. Buat repository baru di GitHub.
2. Upload semua file di folder ini ke repository.
3. Buka **Settings → Pages**.
4. Pada bagian **Build and deployment**, pilih:
   - Source: **Deploy from a branch**
   - Branch: **main**
   - Folder: **/root**
5. Simpan, lalu tunggu GitHub membuat link Pages.

## Catatan Teknis

- Website ini menggunakan CDN Three.js dari jsDelivr.
- Tidak perlu proses build seperti Vite, React, atau Node.js.
- Cocok untuk GitHub Pages karena hanya menggunakan HTML, CSS, dan JavaScript statis.
