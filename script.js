// === SETTINGAN API NEXRAY ===
const API_BASE_URL = "https://api.nexray.eu.cc/api"; // Base URL dari API Nexray

// Ambil elemen dari HTML
const platformSelect = document.getElementById('platform-select');
const inputField = document.getElementById('api-input');
const processBtn = document.getElementById('process-btn');
const resultSection = document.getElementById('result-section');
const resultContent = document.getElementById('result-content');

// Fungsi buat tampilin ikon sesuai platform
function getPlatformIcon(platform) {
    const icons = {
        tiktok: '<i class="fab fa-tiktok"></i>',
        instagram: '<i class="fab fa-instagram"></i>',
        youtube: '<i class="fab fa-youtube"></i>',
        facebook: '<i class="fab fa-facebook"></i>',
        twitter: '<i class="fab fa-twitter"></i>',
        threads: '<i class="fab fa-threads"></i>',
        pinterest: '<i class="fab fa-pinterest"></i>',
        soundcloud: '<i class="fab fa-soundcloud"></i>',
        spotify: '<i class="fab fa-spotify"></i>',
        twitch: '<i class="fab fa-twitch"></i>'
    };
    return icons[platform] || '<i class="fas fa-globe"></i>';
}

// Fungsi buat tampilin loading
function showLoading() {
    processBtn.disabled = true;
    processBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sedang Memproses...';
    resultSection.style.display = 'block';
    resultContent.innerHTML = `
        <p class="loading-text"><i class="fas fa-circle-notch fa-spin"></i> Mohon tunggu, sedang mengambil data dari ${platformSelect.options[platformSelect.selectedIndex].text}...</p>
    `;
}

// Fungsi buat reset tombol
function resetButton() {
    processBtn.disabled = false;
    processBtn.innerHTML = '<i class="fas fa-cogs"></i> Proses Download';
}

// Fungsi buat tampilin hasil sukses
function showSuccess(platform, data) {
    resultContent.innerHTML = '';

    // Tampilin thumbnail jika ada
    if (data.thumbnail) {
        const thumbnail = document.createElement('img');
        thumbnail.src = data.thumbnail;
        thumbnail.alt = "Thumbnail Konten";
        thumbnail.className = "thumbnail-img";
        resultContent.appendChild(thumbnail);
    }

    // Tampilin judul konten jika ada
    if (data.title) {
        const title = document.createElement('h4');
        title.innerHTML = `${getPlatformIcon(platform)} ${data.title}`;
        resultContent.appendChild(title);
        const divider = document.createElement('hr');
        resultContent.appendChild(divider);
    }

    // Tampilin opsi download
    if (data.download && typeof data.download === 'object') {
        // Kalau ada banyak kualitas/format
        Object.keys(data.download).forEach((quality) => {
            const downloadUrl = data.download[quality];
            if (downloadUrl) {
                const card = document.createElement('div');
                card.className = 'download-card';
                
                // Tentuin nama format/kualitas
                let qualityText = quality;
                if (quality === 'hd') qualityText = 'Kualitas Tinggi (HD)';
                if (quality === 'sd') qualityText = 'Kualitas Standar (SD)';
                if (quality === 'audio') qualityText = 'Hanya Audio';
                if (quality === 'image') qualityText = 'Gambar';

                card.innerHTML = `
                    <h4><i class="fas fa-file"></i> Opsi: ${qualityText}</h4>
                    <p><strong>Tipe File:</strong> ${data.type || 'Tidak diketahui'}</p>
                    ${data.size ? `<p><strong>Ukuran:</strong> ${data.size}</p>` : ''}
                    <a href="${downloadUrl}" class="download-link" target="_blank" download>
                        <i class="fas fa-download"></i> Unduh ${qualityText}
                    </a>
                `;
                resultContent.appendChild(card);
            }
        });
    } 
    // Kalau hanya satu link download
    else if (data.download) {
        const card = document.createElement('div');
        card.className = 'download-card';
        card.innerHTML = `
            <h4><i class="fas fa-file"></i> Siap untuk diunduh</h4>
            <p><strong>Tipe File:</strong> ${data.type || 'Tidak diketahui'}</p>
            ${data.size ? `<p><strong>Ukuran:</strong> ${data.size}</p>` : ''}
            ${data.duration ? `<p><strong>Durasi:</strong> ${data.duration}</p>` : ''}
            <a href="${data.download}" class="download-link" target="_blank" download>
                <i class="fas fa-download"></i> Klik untuk Unduh
            </a>
        `;
        resultContent.appendChild(card);
    } 
    // Kalau ada hasil lain (misal dari Spotify/Threads)
    else if (data.result) {
        data.result.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'download-card';
            card.innerHTML = `
                <h4><i class="fas fa-file"></i> Item ${index + 1}: ${item.title || 'Konten'}</h4>
                ${item.artist ? `<p><strong>Artis:</strong> ${item.artist}</p>` : ''}
                ${item.quality ? `<p><strong>Kualitas:</strong> ${item.quality}</p>` : ''}
                <a href="${item.url}" class="download-link" target="_blank" download>
                    <i class="fas fa-download"></i> Unduh Sekarang
                </a>
            `;
            resultContent.appendChild(card);
        });
    }
}

// Fungsi buat tampilin error
function showError(message) {
    resultContent.innerHTML = `
        <p class="error-text"><i class="fas fa-exclamation-triangle"></i> Error: ${message}</p>
        <p class="error-text"><small>Cek kembali link atau platform yang kamu pilih ya!</small></p>
    `;
}

// Fungsi utama buat proses download
async function processDownload() {
    const selectedPlatform = platformSelect.value;
    const inputLink = inputField.value.trim();

    // Validasi input
    if (!selectedPlatform) {
        alert('Mohon pilih platform terlebih dahulu!');
        return;
    }
    if (!inputLink) {
        alert('Mohon masukkan link konten yang benar!');
        return;
    }

    // Tampilin loading
    showLoading();

    try {
        // Siapkan URL endpoint sesuai platform (sesuai dokumentasi API Nexray)
        let apiEndpoint = "";
        switch(selectedPlatform) {
            case "tiktok":
                apiEndpoint = `${API_BASE_URL}/tiktok?url=${encodeURIComponent(inputLink)}`;
                break;
            case "instagram":
                apiEndpoint = `${API_BASE_URL}/instagram?url=${encodeURIComponent(inputLink)}`;
                break;
            case "youtube":
                apiEndpoint = `${API_BASE_URL}/youtube?url=${encodeURIComponent(inputLink)}`;
                break;
            case "facebook":
                apiEndpoint = `${API_BASE_URL}/facebook?url=${encodeURIComponent(inputLink)}`;
                break;
            case "twitter":
                apiEndpoint = `${API_BASE_URL}/twitter?url=${encodeURIComponent(inputLink)}`;
                break;
            case "threads":
                apiEndpoint = `${API_BASE_URL}/threads?url=${encodeURIComponent(inputLink)}`;
                break;
            case "pinterest":
                apiEndpoint = `${API_BASE_URL}/pinterest?url=${encodeURIComponent(inputLink)}`;
                break;
            case "soundcloud":
                apiEndpoint = `${API_BASE_URL}/soundcloud?url=${encodeURIComponent(inputLink)}`;
                break;
            case "spotify":
                apiEndpoint = `${API_BASE_URL}/spotify?url=${encodeURIComponent(inputLink)}`;
                break;
            case "twitch":
                apiEndpoint = `${API_BASE_URL}/twitch?url=${encodeURIComponent(inputLink)}`;
                break;
            default:
                throw new Error("Platform tidak dikenali!");
        }

        // Kirim request ke API Nexray
        const response = await fetch(apiEndpoint, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36'
            }
        });

        // Cek kalau responsnya tidak ok
        if (!response.ok) {
            throw new Error(`Server merespon dengan kode ${response.status} - Coba lagi nanti!`);
        }

        // Baca hasil dari API
        const data = await response.json();

        // Cek kalau API balik pesan error
        if (data.status === false || data.error) {
            throw new Error(data.message || data.error || 'Gagal mengambil data dari API!');
        }

        // Tampilin hasil sukses
        showSuccess(selectedPlatform, data);

    } catch (error) {
        // Tampilin pesan error
        showError(error.message || 'Terjadi kesalahan tidak diketahui');
    } finally {
        // Reset tombol meskipun sukses atau gagal
        resetButton();
    }
}

// Tambah event listener ke tombol proses
processBtn.addEventListener('click', processDownload);

// Tambah event buat bisa tekan Enter buat proses
inputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        processDownload();
    }
});

// Tambah event buat tampilin contoh link sesuai platform yang dipilih
platformSelect.addEventListener('change', () => {
    const selectedText = platformSelect.options[platformSelect.selectedIndex].text;
    if (selectedText.includes('TikTok')) {
        inputField.placeholder = "Contoh: https://www.tiktok.com/@pengguna/video/72564123...";
    } else if (selectedText.includes('Instagram')) {
        inputField.placeholder = "Contoh: https://www.instagram.com/p/CvXyZ.../";
    } else if (selectedText.includes('YouTube')) {
        inputField.placeholder = "Contoh: https://www.youtube.com/watch?v=abc123...";
    } else if (selectedText.includes('Facebook')) {
        inputField.placeholder = "Contoh: https://www.facebook.com/pengguna/videos/123.../";
    } else if (selectedText.includes('Twitter')) {
        inputField.placeholder = "Contoh: https://twitter.com/pengguna/status/123...";
    } else {
        inputField.placeholder = `Masukkan link ${selectedText.split('(')[0]} di sini...`;
    }
});
