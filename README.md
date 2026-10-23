# SO Mingguan — Mitra Berkah Farmasi

Aplikasi statis untuk menggabungkan laporan Penjualan per Barang dan Ketersediaan Stok Penjualan dari Accurate Online atau iPos menjadi daftar SO partial.

## Penggunaan

Buka index.html atau alamat GitHub Pages. Pilih dua file laporan, isi tanggal stok sistem, buat daftar SO, lalu unduh Excel. Data diproses di browser dan tidak diunggah ke server. Isian tidak disimpan otomatis.

Urutan mengikuti kategori dan susunan barang pada laporan stok. Format dikenali otomatis. Kategori Accurate memakai Kategori Barang; kategori iPos memakai Jenis. iPos dicocokkan berdasarkan kode item dan satuan, Accurate memakai nama barang dan satuan jika kode tidak tersedia. Pencocokan menggunakan identitas dan satuan; stok ambigu tidak diasumsikan nol.

## GitHub Pages

Tidak memerlukan proses build. Pada Settings > Pages, pilih Deploy from a branch, cabang main, folder / (root).

Kode aplikasi dan identitas perusahaan dalam kode akan dapat diakses jika repositori atau situs dijadikan publik. File laporan tidak disertakan.

## Pustaka

SheetJS Community Edition 0.20.3, Apache-2.0. Bundel disimpan di xlsx.full.min.js.

