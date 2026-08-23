(function() {
    // 0. 防重疊機制：如果已經存在，先移除舊的 DOM
    const existingOverlay = document.getElementById('seed-overlay');
    if (existingOverlay) existingOverlay.remove();
    const existingBtn = document.getElementById('music-control-btn');
    if (existingBtn) existingBtn.remove();
    const existingUI = document.getElementById('playlist-window');
    if (existingUI) existingUI.remove();

    const tracks = [
        { name: "Library of Ruina - String Theocracy", id: "nOj_A3aZxGs" },
        { name: "Library of Ruina - Theme02", id: "On4Hk6b1KsY" },
        { name: "Malkuth Story", id: "LhoSpUKQEbU" },
        { name: "The Blue Reverberation", id: "uXw1f0porfg" },
        { name: "Malkuth Battle 3", id: "aeIXVi6iXFI" },
        { name: "Tiphereth Battle 3", id: "M5JelTHJ-eA" },
        { name: "Chesed Battle 3", id: "4AJR475AcgQ" },
        { name: "Lobotomy OST - Neutral04", id: "PRUrlZFty3A" }
    ];

    let player;
    let currentTrackIndex = 0;
    let targetVolume = 50;
    let isPlaying = false;

    // 1. 樣式修飾（全面匹配圖書館金邊與微光風格）
    const style = document.createElement('style');
    style.innerHTML = `
        #seed-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: #000; z-index: 20000;
            display: flex; align-items: center; justify-content: center;
            overflow: hidden;
            transition: opacity 1.5s ease-in-out;
        }

        #seed-container {
            position: relative;
            width: 75px; height: 75px;
            transition: transform 1.2s cubic-bezier(0.45, 0.05, 0.55, 0.95);
            display: flex; align-items: center; justify-content: center;
            z-index: 20001;
            cursor: pointer;
        }

        .seed-of-light {
            width: 100%; height: 100%;
            background: #fffdf0;
            border-radius: 50%;
            box-shadow: 0 0 40px #fff, 0 0 70px #d4af37, 0 0 100px rgba(212, 175, 55, 0.5);
            animation: seed-pulse 4s infinite ease-in-out;
        }

        @keyframes seed-pulse {
            0%, 100% { transform: scale(0.9); opacity: 0.7; box-shadow: 0 0 30px #fff, 0 0 50px #d4af37; }
            50% { transform: scale(1.1); opacity: 1; box-shadow: 0 0 60px #fff, 0 0 110px #d4af37; }
        }

        #seed-container.grow {
            transform: scale(400);
        }
        #seed-container.grow .seed-of-light {
            animation: none !important;
            opacity: 1;
        }

        #seed-overlay.fade-out {
            opacity: 0;
            pointer-events: none;
        }

        .seed-text {
            position: absolute; bottom: 15%;
            color: #d4af37; font-family: "Cinzel", "serif";
            letter-spacing: 10px; font-size: 13px; font-weight: bold;
            animation: text-pulse 4s infinite ease-in-out;
            transition: opacity 0.5s;
            pointer-events: none;
        }

        @keyframes text-pulse {
            0%, 100% { opacity: 0.2; filter: blur(1px); }
            50% { opacity: 1; filter: blur(0px); text-shadow: 0 0 15px #d4af37; }
        }

        body.focus-in { 
            animation: web-focus 3.5s ease-out forwards; 
        }
        @keyframes web-focus {
            0% { filter: blur(20px) brightness(2.5); }
            100% { filter: blur(0px) brightness(1); }
        }

        /* --- UI 播放控制器 (Ruina 風格) --- */
        .music-note { 
            position: fixed; bottom: 90px; right: 25px; 
            background: rgba(10, 10, 12, 0.85); 
            border: 1px solid rgba(212, 175, 55, 0.4);
            border-left: 4px solid #ffea95; 
            padding: 12px 22px; 
            backdrop-filter: blur(12px);
            color: #fff; font-size: 13px; z-index: 9999; 
            transform: translateX(180%); transition: transform 0.5s cubic-bezier(0.165, 0.84, 0.44, 1); 
            pointer-events: none; font-family: "Cinzel", "serif"; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.8);
        }
        .music-note.show { transform: translateX(0); }
        .music-note small { color: #d4af37; letter-spacing: 2px; font-size: 0.65rem; text-transform: uppercase; }
        .music-note b { display: block; margin-top: 3px; font-weight: 500; letter-spacing: 1px; color: #fff; }

        #music-control-btn { 
            position: fixed; bottom: 25px; right: 25px; 
            width: 50px; height: 50px; 
            background: rgba(10, 10, 12, 0.75); 
            border: 1px solid #d4af37; 
            backdrop-filter: blur(10px);
            border-radius: 50%; 
            display: flex; align-items: center; justify-content: center; 
            cursor: pointer; z-index: 9999; font-size: 18px; color: #ffea95;
            box-shadow: 0 0 15px rgba(212, 175, 55, 0.2); 
            transition: all 0.3s ease;
        }
        #music-control-btn:hover {
            transform: scale(1.08);
            box-shadow: 0 0 25px rgba(212, 175, 55, 0.5), inset 0 0 10px rgba(212, 175, 55, 0.3);
            background: rgba(20, 20, 25, 0.9);
        }

        #playlist-window { 
            position: fixed; bottom: 90px; right: 25px; width: 300px; 
            background: rgba(12, 12, 15, 0.9); 
            border: 1px solid rgba(212, 175, 55, 0.35);
            backdrop-filter: blur(15px);
            display: none; flex-direction: column; z-index: 9998; 
            font-family: "Cinzel", "Noto Serif TC", "serif"; 
            box-shadow: 0 20px 50px rgba(0,0,0,0.9);
            max-height: 400px;
            overflow-y: auto;
        }
        #playlist-window.open { display: flex; animation: fadeIn 0.3s ease; }
        
        .playlist-header {
            padding: 12px 16px;
            border-bottom: 1px solid rgba(212, 175, 55, 0.2);
            font-size: 0.75rem;
            letter-spacing: 2px;
            color: #d4af37;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .track-item { 
            padding: 12px 16px; cursor: pointer; color: #aaa; font-size: 12px; 
            border-bottom: 1px solid rgba(255, 255, 255, 0.05); 
            transition: all 0.2s ease;
            letter-spacing: 1px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .track-item:hover { 
            color: #fff; 
            background: rgba(212, 175, 55, 0.1); 
            padding-left: 20px;
        }
        .track-item.active { 
            color: #ffea95; 
            background: rgba(212, 175, 55, 0.18); 
            font-weight: bold;
            border-left: 3px solid #ffea95;
            text-shadow: 0 0 8px rgba(212, 175, 55, 0.5);
        }
        
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    `;
    document.head.appendChild(style);

    const container = document.createElement('div');
    container.innerHTML = `
        <div id="seed-overlay">
            <div id="seed-container">
                <div class="seed-of-light"></div>
            </div>
            <div class="seed-text">SEED OF LIGHT</div>
        </div>
        <div id="music-notification" class="music-note"></div>
        <div id="music-control-btn" title="Toggle Playlist">🎵</div>
        <div id="playlist-window">
            <div class="playlist-header">
                <span>LIBRARY ARCHIVE // SOUNDTRACK</span>
            </div>
            <div id="playlist-content"></div>
        </div>
        <div id="youtube-player" style="display:none;"></div>
    `;
    document.body.appendChild(container);

    // 載入 YouTube API
    if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
    } else if (window.YT && window.YT.Player) {
        initPlayer();
    }

    window.onYouTubeIframeAPIReady = function() {
        initPlayer();
    };

    function initPlayer() {
        player = new YT.Player('youtube-player', {
            height: '0', width: '0', videoId: tracks[currentTrackIndex].id,
            playerVars: { 'autoplay': 0, 'controls': 0 },
            events: { 
                'onReady': () => { 
                    const seedBtn = document.getElementById('seed-container');
                    if (seedBtn) seedBtn.onclick = startRitual; 
                },
                'onStateChange': onPlayerStateChange
            }
        });
    }

    // 當歌曲播放完畢自動跳下一首
    function onPlayerStateChange(event) {
        if (event.data === YT.PlayerState.ENDED) {
            currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
            player.loadVideoById(tracks[currentTrackIndex].id);
            showNotice(tracks[currentTrackIndex].name);
            updatePlaylistUI();
        }
    }

    // 音樂平滑淡入效果
    function fadeInMusic() {
        let currentVol = 0;
        player.setVolume(0);
        player.playVideo();
        isPlaying = true;

        const fadeInterval = setInterval(() => {
            currentVol += 2;
            if (currentVol >= targetVolume) {
                player.setVolume(targetVolume);
                clearInterval(fadeInterval);
            } else {
                player.setVolume(currentVol);
            }
        }, 80);
    }

    function startRitual() {
        const container = document.getElementById('seed-container');
        const overlay = document.getElementById('seed-overlay');
        const text = document.querySelector('.seed-text');

        // 1. 球體放大與文字消失
        container.classList.add('grow');
        if (text) text.style.opacity = '0';

        // 2. 音樂淡入播放與網頁焦距聚焦
        fadeInMusic();
        document.body.classList.add('focus-in');

        // 3. 過渡完畢移除 Mask
        setTimeout(() => {
            overlay.classList.add('fade-out');
            setTimeout(() => {
                overlay.remove();
                initUI();
            }, 1500);
        }, 800);

        setTimeout(() => showNotice(tracks[currentTrackIndex].name), 1800);
    }

    function initUI() {
        const musicBtn = document.getElementById('music-control-btn');
        const playlistWindow = document.getElementById('playlist-window');

        musicBtn.onclick = (e) => {
            e.stopPropagation();
            playlistWindow.classList.toggle('open');
        };

        // 點擊頁面其他地方時自動收起音樂清單
        document.addEventListener('click', (e) => {
            if (!playlistWindow.contains(e.target) && e.target !== musicBtn) {
                playlistWindow.classList.remove('open');
            }
        });

        renderPlaylist();
    }

    function renderPlaylist() {
        const content = document.getElementById('playlist-content');
        if (!content) return;
        content.innerHTML = '';

        tracks.forEach((t, i) => {
            const item = document.createElement('div');
            item.className = `track-item ${i === currentTrackIndex ? 'active' : ''}`;
            item.innerHTML = `
                <span>${i + 1}. ${t.name}</span>
                ${i === currentTrackIndex ? '<small>▶</small>' : ''}
            `;
            item.onclick = () => {
                currentTrackIndex = i;
                player.loadVideoById(tracks[i].id);
                showNotice(tracks[i].name);
                updatePlaylistUI();
            };
            content.appendChild(item);
        });
    }

    function updatePlaylistUI() {
        const items = document.querySelectorAll('.track-item');
        items.forEach((el, idx) => {
            const isActive = idx === currentTrackIndex;
            el.classList.toggle('active', isActive);
            el.innerHTML = `
                <span>${idx + 1}. ${tracks[idx].name}</span>
                ${isActive ? '<small>▶</small>' : ''}
            `;
        });
    }

    function showNotice(name) {
        const note = document.getElementById('music-notification');
        if (!note) return;
        note.innerHTML = `<small>Now Playing</small><b>${name}</b>`;
        note.classList.add('show');
        setTimeout(() => note.classList.remove('show'), 3800);
    }
})();
