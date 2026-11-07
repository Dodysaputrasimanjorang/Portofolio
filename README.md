# DODY.DEV — Portfolio

Website portofolio pribadi **Dody Saputra Simanjorang** dengan tema **pixel-art / 8-bit retro game**. Dibangun murni menggunakan HTML, CSS, dan JavaScript (vanilla) tanpa framework maupun proses build — cukup buka `index.html` di browser.

## Tentang Sistem

Sistem ini adalah situs statis satu halaman (single-page) yang menampilkan profil, keahlian, proyek, dan kontak. Nuansa game hadir lewat layar boot "PRESS START", player card dengan status HP/MP/XP, latar bintang animasi piksel, efek suara 8-bit, dan label bergaya "quest log".

### Struktur

```
portofolio/
├── index.html          # Struktur halaman & konten
├── css/main.css        # Seluruh styling, animasi, dan responsivitas
├── js/pixel-bg.js      # Animasi latar kanvas (bintang, percikan, meteor)
├── js/main.js          # Interaksi: boot screen, nav, sound, reveal, form
├── image/              # Foto profil & data about me
└── assets/             # Aset tambahan
```

### Fitur

- Layar boot interaktif dengan progress bar dan tombol "PRESS START"
- Latar belakang piksel dinamis (bintang, sparks, shooting star)
- Efek suara 8-bit yang bisa dinyalakan/dimatikan (tersimpan di `localStorage`)
- Animasi scroll reveal, typewriter role, dan penghitung statistik
- Navigasi responsif dengan menu mobile
- Kartu proyek bergaya "quest" dengan tingkat kesulitan
- Form kontak yang membuka Gmail dengan pesan siap kirim
- Mendukung `prefers-reduced-motion` untuk aksesibilitas

### Cara Menjalankan

Buka `index.html` langsung di browser, atau jalankan server lokal:

```bash
# Python
python -m http.server 8000

# Node.js
npx serve .
```

Lalu akses `http://localhost:8000`.

## Kemampuan

Sebagai **AI Engineer & Fullstack Developer**, saya memiliki kemampuan:

**Fullstack Development**
JavaScript, TypeScript, React, Next.js, Node.js, Go, Rust, PostgreSQL, Redis, Docker — membangun aplikasi dari lapisan database hingga antarmuka.

**AI & Machine Learning**
Python, TensorFlow, PyTorch, NumPy, OpenCV, FastAPI, Jupyter — termasuk pengembangan sistem berbasis **LLM** dan **Retrieval-Augmented Generation (RAG)**.

**Data & Infrastructure**
Pandas, Apache Spark, SQL, Kubernetes, AWS, Linux — pengolahan data dan pengelolaan infrastruktur.

**Soft Skills**
Problem solver, fast learner, product-minded, dan detail oriented.

## Kontak

- GitHub: [github.com/Dodysaputrasimanjorang](https://github.com/Dodysaputrasimanjorang)
- LinkedIn: [linkedin.com/in/dodysaputrasimanjorang](https://www.linkedin.com/in/dodysaputrasimanjorang)
- Lokasi: Indonesia · Remote worldwide
- Status: Terbuka untuk freelance & full-time
