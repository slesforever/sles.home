/* 
 * Seed of Light - Universal Loader Module
 * 適用於任何網頁，只需將此腳本放入 <body> 結束標籤前即可。
 */
(function() {
    // === [配置區] ===
    const CONFIG = {
        tracks: [
            { name: "Malkuth Battle 3", id: "aeIXVi6iXFI" },
            { name: "Malkuth Story", id: "LhoSpUKQEbU" },
            { name: "The Blue Reverberation", id: "uXw1f0porfg" },
            { name: "Library of Ruina - Theme02", id: "On4Hk6b1KsY" }
        ],
        primaryColor: "#d4af37", // 經典 PM 金色
        accentColor: "#ff3b3b",  // 警告紅
        maxVolume: 50
    };

    let player;
    let currentTrackIndex = 0;

    // --- 1. 注入專用樣式 (帶有命名空間，避免污染原網站) ---
    const style = document.createElement('style');
    style.innerHTML = `
        #pm-seed-overlay {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: #000; z-index: 999999;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            transition: background 1.5s ease, opacity 2.5s cubic-bezier(0.4, 0, 0.2, 1);
            overflow: hidden;
        }
        .pm-seed-ball {
            width: 80px; height: 80px; background: #fff; border-radius: 50%;
            box-shadow: 0 0 40px #fff, 0 0 80px ${CONFIG.primaryColor};
            cursor: pointer; z-index: 1000000;
            transition: transform 1.5s cubic-bezier(0.7, 0, 0.3, 1), opacity 1s ease;
            animation: pm-pulse 3s infinite;
        }
        .pm-seed-ball.expand { transform: scale(100); opacity: 0; }
        .pm-seed-text {
            margin-top: 30px; color: ${CONFIG.primaryColor}; font-family: "serif";
            letter-spacing: 8px; font-size: 12px; opacity: 0.6; transition: 0.8s;
            text-transform: uppercase; pointer-events: none;
        }
        #pm-seed-overlay.illuminated { background: #fff !important; }

        /* 網頁聚焦動畫 */
        body.pm-focus-active { animation: pm-web-focus 3s forwards; }
        @keyframes pm-web-focus {
            from { filter: blur(15px) brightness(2); transform: scale(0.95); }
            to { filter: blur(0px) brightness(1); transform: scale(1); }
        }
        @keyframes pm-pulse { 0%, 100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.05); opacity: 1; } }

        /* 音樂 UI */
        .pm-music-note { position: fixed; bottom: 85px; right: 20px; background: rgba(0,0,0,0.9); border-left: 4px solid ${CONFIG.accentColor}; padding: 12px 20px; border-radius: 8px; color: white; font-size: 14px; z-index: 99999; transform: translateX(180%); transition: 0.5s; pointer-events: none; font-family: sans-serif; }
        .pm-music-note.show { transform: translateX(0); }
        #pm-music-btn { position: fixed; bottom: 20px; right: 20px; width: 50px; height: 50px; background: #111; border: 1px solid ${CONFIG.primaryColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 99999; font-size: 20px; color: ${CONFIG.primaryColor}; }
        #pm-playlist { position: fixed; bottom: 80px; right: 20px; width: 260px; background: #0a0a0a; border: 1px solid #333; border-radius: 10px; display: none; flex-direction: column; z-index: 99998; overflow: hidden; font-family: sans-serif; }
        .pm-track { padding: 10px 15px; cursor: pointer; color: #888; border-bottom: 1px solid #1a1a1a; font-size: 13px; transition: 0.2s; }
        .pm-track:hover { background: #222; color: #fff; }
        .pm-track.active { color: ${CONFIG.accentColor}; background: rgba(255,59,59,0.1); border-left: 3px solid ${CONFIG.accentColor}; }
    `;
    document.head.appendChild(style);

    // --- 2. 注入 HTML 結構 ---
    const ui = document.createElement('div');
    ui.id = "pm-music-module";
    ui.innerHTML = `
        <div id="pm-seed-overlay">
            <div class="pm-seed-ball" id="pm-start-trigger"></div>
            <div class="pm-seed-text">Press to Manifest</div>
        </div>
        <div id="pm-notice" class="pm-music-note"></div>
        <div id="pm-music-btn">🎧</div>
        <div id="pm-playlist">
            <div style="padding:12px; color:${CONFIG.primaryColor}; font-size:11px; font-weight:bold; border-bottom:1px solid #333; letter-spacing:1px;">COGNITION FILTER ACTIVE</div>
            <div id="pm-playlist-list"></div>
        </div>
        <div id="pm-player-container" style="display:none;"></div>
    `;
    document.body.appendChild(ui);

    // --- 3. YouTube API 載入 ---
    if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
    }

    window.onYouTubeIframeAPIReady = function() {
        player = new YT.Player('pm-player-container', {
            height: '0', width: '0',
            videoId: CONFIG.tracks[0].id,
            playerVars: { 'autoplay': 0, 'controls': 0 },
            events: { 
                'onReady': () => {
                    document.getElementById('pm-start-trigger').onclick = startSequence;
                    initPlaylistUI();
                },
                'onStateChange': (e) => { if (e.data == YT.PlayerState.ENDED) nextTrack(); }
            }
        });
    };

    // --- 4. 核心邏輯 ---
    function transitionVolume(target, duration) {
        let start = player.getVolume();
        let startTime = performance.now();
        function update() {
            let elapsed = performance.now() - startTime;
            let prog = Math.min(elapsed / duration, 1);
            player.setVolume(start + (target - start) * prog);
            if (prog < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }

    function startSequence() {
        const btn = document.getElementById('pm-start-trigger');
        const overlay = document.getElementById('pm-seed-overlay');
        const text = document.querySelector('.pm-seed-text');

        player.playVideo();
        player.setVolume(0);
        transitionVolume(CONFIG.maxVolume, 3000);

        btn.classList.add('expand');
        text.style.opacity = '0';

        setTimeout(() => {
            overlay.classList.add('illuminated');
            document.body.classList.add('pm-focus-active');
            setTimeout(() => {
                overlay.style.opacity = '0';
                setTimeout(() => overlay.remove(), 2500);
            }, 400);
        }, 1200);

        setTimeout(() => showNotice(CONFIG.tracks[currentTrackIndex].name), 2500);
    }

    function initPlaylistUI() {
        document.getElementById('pm-music-btn').onclick = () => {
            const p = document.getElementById('pm-playlist');
            p.style.display = (p.style.display === 'flex') ? 'none' : 'flex';
        };
        const list = document.getElementById('pm-playlist-list');
        CONFIG.tracks.forEach((t, i) => {
            const row = document.createElement('div');
            row.className = `pm-track ${i === 0 ? 'active' : ''}`;
            row.innerText = t.name;
            row.onclick = () => playTrack(i);
            list.appendChild(row);
        });
    }

    function playTrack(i) {
        currentTrackIndex = i;
        player.loadVideoById(CONFIG.tracks[i].id);
        player.setVolume(CONFIG.maxVolume);
        document.querySelectorAll('.pm-track').forEach((el, idx) => el.classList.toggle('active', idx === i));
        showNotice(CONFIG.tracks[i].name);
        document.getElementById('pm-playlist').style.display = 'none';
    }

    function nextTrack() { playTrack((currentTrackIndex + 1) % CONFIG.tracks.length); }

    function showNotice(name) {
        const n = document.getElementById('pm-notice');
        n.innerHTML = `<span style="font-size:10px;color:#aaa">NOW LINKED:</span><br><b>${name}</b>`;
        n.classList.add('show');
        setTimeout(() => n.classList.remove('show'), 4000);
    }
})();
