const API_DOWNLOAD = "https://api-faa.my.id/faa/tiktok";
const API_CAPTION = "httpsapi.nexray.eu.cc/downloader/tiktok";

const urlInput = document.getElementById('tiktokUrl');
const processBtn = document.getElementById('processBtn');
const inputPanel = document.getElementById('inputPanel');
const loadingDiv = document.getElementById('loadingIndicator');
const resultContainer = document.getElementById(', 'resultContainer');
let currentVideoUrl = null;

function formatNumberShort(num) {
    if (!num) return '0';
    if (typeof num === 'string') return num;
    num = parseInt(num) || 0;
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return num.toString();
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m] || m));
}

async function fetchCaptionData(tiktokUrl) {
    try {
        const res = await fetch(`${API_CAPTION}?url=${encodeURIComponent(tiktokUrl)}`);
        const data = await res.json();
        return data?.status ? data.result : null;
    } catch { return null; }
}

async function handleDownloadProcess() {
    const url = urlInput.value.trim();
    if (!url) return alert("Masukkan link TikTok dulu.");

    loadingDiv.style.display = 'block';
    resultContainer.style.display = 'none';
    processBtn.disabled = true;

    try {
        const vRes = await fetch(`${API_DOWNLOAD}?url=${encodeURIComponent(url)}`);
        const vData = await vRes.json();
        if (!(vData.status === "benar" || vData.status === true) || !vData.result) throw new Error("Gagal ambil data");

        const resVideo = vData.hasil || vData.result;
        currentVideoUrl = resVideo?.alternatives?.nowm_hd || resVideo?.alternatives?.nowm || resVideo.data;
        if (!currentVideoUrl) throw new Error("Link video tidak ada");

        const detail = await fetchCaptionData(url);
        let title = "TikTok Video", views = "0", likes = "0", comments = "0";
        let authorName = "Pengguna", authorAvatar = "", coverImg = "";

        if (detail) {
            title = detail.title || title;
            views = formatNumberShort(detail.stats?.views);
            likes = formatNumberShort(detail.stats?.likes);
            comments = formatNumberShort(detail.stats?.comment);
            authorName = detail.author?.nickname || detail.author?.fullname || authorName;
            authorAvatar = detail.author?.avatar || "";
            coverImg = detail.cover || "";
        }

        resultContainer.innerHTML = `
            <div class="video-preview">
                <video controls src="${escapeHtml(currentVideoUrl)}" poster="${escapeHtml(coverImg)}"></video>
            </div>
            <div class="caption-glass">
                <div class="caption-title">📌 ${escapeHtml(title.substring(0,120))}${title.length>120?'…':''}</div>
                <div class="stats-grid">
                    <span class="stat-badge">👁️ ${views}</span>
                    <span class="stat-badge">❤️ ${likes}</span>
                    <span class="stat-badge">💬 ${comments}</span>
                </div>
                <div class="author-section">
                    <img src="${escapeHtml(authorAvatar)}" class="author-avatar-mini" onerror="this.src=''">
                    <span class="author-name">${escapeHtml(authorName)}</span>
                </div>
                <div class="button-group">
                    <button class="download-btn-result" id="dlBtn">⬇️ Simpan Video</button>
                    <div class="reset-download" id="resetBtn">↺ Unduh Lain</div>
                    <div class="join-group-btn" onclick="window.open('https://chat.whatsapp.com/Dq6B4ba0yhnJJEAij5rqFb','_blank')">💬 Join Group</div>
                </div>
            </div>
        `;

        resultContainer.style.display = 'block';
        inputPanel.classList.add('hide-panel');

        document.getElementById('dlBtn').addEventListener('click', () => {
            const a = document.createElement('a');
            a.href = currentVideoUrl;
            a.download = 'XZ_TikTok.mp4';
            document.body.appendChild(a); a.click(); document.body.removeChild(a);
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            resultContainer.style.display = 'none';
            inputPanel.classList.remove('hide-panel');
            urlInput.value = ''; processBtn.disabled = false;
        });

    } catch (err) {
        resultContainer.style.display = 'block';
        resultContainer.innerHTML = `<div style="color:#ffd0d0; background:rgba(0,0,0,0.4); padding:15px; border-radius:16px; text-align:center">⚠️ ${err.message}</div>`;
    } finally {
        loadingDiv.style.display = 'none';
        processBtn.disabled = false;
    }
}

processBtn.addEventListener('click', handleDownloadProcess);
urlInput.addEventListener('keypress', e => e.key === 'Enter' && handleDownloadProcess());

// Efek Salju Ringan
const canvas = document.getElementById('snow-canvas');
const ctx = canvas.getContext('2d');
let w = window.innerWidth, h = window.innerHeight;
let snow = [];

function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
function initSnow(count=80) {
    snow = [];
    for (let i=0;i<count;i++) snow.push({
        x:Math.random()*w, y:Math.random()*h, r:Math.random()*1.5+0.4,
        spd:Math.random()*0.5+
