(function() {
    // 1. 曲目資料庫
    const tracks = [
        { name: "Malkuth Battle 3", id: "aeIXVi6iXFI" },
        { name: "Malkuth Story", id: "LhoSpUKQEbU" },
        { name: "Tiphereth Battle 3", id: "M5JelTHJ-eA" },
        { name: "Chesed Battle 3", id: "4AJR475AcgQ" },
        { name: "The Blue Reverberation", id: "uXw1f0porfg" },
        { name: "Lobotomy OST - Neutral04", id: "PRUrlZFty3A" },
        { name: "Library of Ruina - Theme02", id: "On4Hk6b1KsY" }
    ];

    let player;
    let currentTrackIndex = 0;
    let unlocked = false;
    let fadeInterval = null;

    // =========================
    // UI CSS
    // =========================
    const style = document.createElement('style');
    style.innerHTML = `
        .music-note {
            position: fixed;
            bottom: 85px;
            right: 20px;
            background: rgba(0,0,0,0.9);
            border-left: 4px solid #ff3b3b;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-size: 14px;
            z-index: 10000;
            transform: translateX(150%);
            transition: 0.4s;
            pointer-events: none;
            font-family: sans-serif;
        }
        .music-note.show { transform: translateX(0); }

        #music-control-btn {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 55px;
            height: 55px;
            background: #151515;
            border: 1px solid #d4af37;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 10000;
            font-size: 22px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5);
        }

        #playlist-window {
            position: fixed;
            bottom: 85px;
            right: 20px;
            width: 280px;
            background: #0f0f0f;
            border: 1px solid #333;
            border-radius: 12px;
            display: none;
            flex-direction: column;
            z-index: 9999;
            overflow: hidden;
        }

        #playlist-window.open { display: flex; }

        .track-item {
            padding: 12px 15px;
            cursor: pointer;
            color: #888;
            font-size: 13px;
            border-bottom: 1px solid #222;
            transition: 0.2s;
        }
        .track-item:hover { background: #1a1a1a; color: #fff; }
        .track-item.active { color: #ff3b3b; background: #1a1a1a; font-weight: bold; }
    `;
    document.head.appendChild(style);

    // =========================
    // UI HTML
    // =========================
    const container = document.createElement('div');
    container.id = "custom-audio-player-root";
    container.innerHTML = `
        <div id="music-notification" class="music-note"></div>
        <div id="music-control-btn" title="Click to open playlist">🎵</div>
        <div id="playlist-window">
            <div style="padding:15px; color:#d4af37; font-weight:bold; border-bottom:1px solid #333; background:#1a1a1a;">ARCHIVE AUDIO</div>
            <div id="playlist-content" style="max-height: 400px; overflow-y: auto;"></div>
        </div>
        <div id="youtube-player-container" style="position:absolute; top:-9999px; left:-9999px;">
            <div id="youtube-player"></div>
        </div>
    `;
    document.body.appendChild(container);

    // =========================
    // YouTube API 核心修正
    // =========================
    window.onYouTubeIframeAPIReady = function() {
        player = new YT.Player('youtube-player', {
            height: '0',
            width: '0',
            videoId: tracks[currentTrackIndex].id,
            playerVars: {
                'autoplay': 0,
                'controls': 0,
                'disablekb': 1,
                'rel': 0
            },
            events: {
                onReady: () => {
                    console.log("Audio Engine Ready.");
                    initUI();
                },
                onStateChange: (e) => {
                    if (e.data === YT.PlayerState.ENDED) nextTrack();
                },
                onError: (e) => {
                    console.error("YT Player Error:", e.data);
                    nextTrack(); // 遇到版權或讀取錯誤自動跳下一首
                }
            }
        });
    };

    // 載入 API 腳本
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    function initUI() {
        const btn = document.getElementById('music-control-btn');
        btn.onclick = (e) => {
            e.stopPropagation();
            document.getElementById('playlist-window').classList.toggle('open');
            unlockAudio(); // 點擊按鈕時強制解鎖播放
        };

        const content = document.getElementById('playlist-content');
        tracks.forEach((t, i) => {
            const item = document.createElement('div');
            item.className = `track-item ${i === currentTrackIndex ? 'active' : ''}`;
            item.innerText = `${i + 1}. ${t.name}`;
            item.onclick = (e) => {
                e.stopPropagation();
                playTrack(i);
            };
            content.appendChild(item);
        });
    }

    // =========================
    // 播放解鎖邏輯
    // =========================
    function unlockAudio() {
        if (unlocked || !player || typeof player.playVideo !== 'function') return;
        unlocked = true;

        player.unMute();
        player.setVolume(0);
        player.playVideo(); // 關鍵：必須在使用者點擊或移動的當下執行
        fadeInFast();
        
        // 顯示通知
        showNote(tracks[currentTrackIndex].name);

        // 移除全域監聽
        window.removeEventListener("mousemove", unlockAudio);
        window.removeEventListener("touchstart", unlockAudio);
        window.removeEventListener("keydown", unlockAudio);
    }

    // 監聽任何使用者互動
    window.addEventListener("mousemove", unlockAudio, { once: true });
    window.addEventListener("touchstart", unlockAudio, { once: true });
    window.addEventListener("keydown", unlockAudio, { once: true });

    function fadeInFast() {
        let vol = 0;
        const interval = setInterval(() => {
            vol += 5;
            if (vol >= 80) { // 設在 80% 比較舒服
                player.setVolume(80);
                clearInterval(interval);
            } else {
                player.setVolume(vol);
            }
        }, 50);
    }

    function fadeOut(cb) {
        let vol = player.getVolume();
        clearInterval(fadeInterval);
        fadeInterval = setInterval(() => {
            if (vol > 0) {
                vol -= 10;
                player.setVolume(vol);
            } else {
                clearInterval(fadeInterval);
                cb && cb();
            }
        }, 30);
    }

    // =========================
    // 播放控制
    // =========================
    function playTrack(i) {
        currentTrackIndex = i;
        updateUI();
        
        if (!unlocked) {
            unlockAudio();
            return;
        }

        fadeOut(() => {
            player.loadVideoById(tracks[i].id);
            player.unMute();
            fadeInFast();
        });

        showNote(tracks[i].name);
    }

    function nextTrack() {
        currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
        playTrack(currentTrackIndex);
    }

    function updateUI() {
        document.querySelectorAll('.track-item').forEach((el, i) => {
            el.classList.toggle('active', i === currentTrackIndex);
        });
    }

    function showNote(name) {
        const note = document.getElementById('music-notification');
        note.innerHTML = `<small style="color:#aaa;">Now Playing</small><br><b>${name}</b>`;
        note.classList.add('show');
        setTimeout(() => note.classList.remove('show'), 3500);
    }

    // 點擊外面自動關閉視窗
    window.addEventListener('click', (e) => {
        const win = document.getElementById('playlist-window');
        if (win && win.classList.contains('open')) {
            win.classList.remove('open');
        }
    });

})();
