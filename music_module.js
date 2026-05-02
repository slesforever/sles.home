(function() {
    const CONFIG = {
        tracks: [
            { name: "Malkuth Battle 3", id: "aeIXVi6iXFI" },
            { name: "Malkuth Story", id: "LhoSpUKQEbU" },
            { name: "The Blue Reverberation", id: "uXw1f0porfg" },
            { name: "Library of Ruina - Theme02", id: "On4Hk6b1KsY" }
        ],
        primaryColor: "#d4af37",
        accentColor: "#ff3b3b",
        maxVolume: 50
    };

    let player;
    let currentTrackIndex = 0;

    // --- 1. 暴力級 CSS：使用最大的 Z-Index ---
    const MAX_Z = "2147483647"; 
    const style = document.createElement('style');
    style.innerHTML = `
        /* 強制覆蓋所有容器的溢出限制 */
        html, body { overflow-x: hidden !important; }

        #pm-seed-overlay {
            position: fixed !important; 
            top: 0 !important; left: 0 !important; 
            width: 100vw !important; height: 100vh !important;
            background: #000 !important; 
            z-index: ${MAX_Z} !important; /* 瀏覽器极限值 */
            display: flex !important; flex-direction: column !important; 
            align-items: center !important; justify-content: center !important;
            transition: background 1.5s ease, opacity 2.5s cubic-bezier(0.4, 0, 0.2, 1) !important;
            pointer-events: all !important;
        }
        
        .pm-seed-ball {
            width: 85px; height: 85px; background: #fff; border-radius: 50%;
            box-shadow: 0 0 40px #fff, 0 0 80px ${CONFIG.primaryColor};
            cursor: pointer; z-index: ${MAX_Z};
            transition: transform 1.5s cubic-bezier(0.7, 0, 0.3, 1), opacity 1s ease;
            animation: pm-pulse 3s infinite;
        }
        .pm-seed-ball.expand { transform: scale(150) !important; opacity: 0 !important; }
        
        .pm-seed-text {
            margin-top: 30px; color: ${CONFIG.primaryColor}; font-family: serif;
            letter-spacing: 8px; font-size: 13px; opacity: 0.7;
            text-transform: uppercase; pointer-events: none;
        }

        #pm-seed-overlay.illuminated { background: #fff !important; }

        /* 網頁聚焦 */
        body.pm-focus-active { animation: pm-web-focus 3s forwards !important; }
        @keyframes pm-web-focus {
            from { filter: blur(20px) brightness(2); }
            to { filter: blur(0px) brightness(1); }
        }

        /* 介面層級也要夠高 */
        #pm-music-btn { position: fixed; bottom: 20px; right: 20px; width: 55px; height: 55px; background: #111; border: 1px solid ${CONFIG.primaryColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: ${MAX_Z}; color: ${CONFIG.primaryColor}; font-size: 24px; }
        #pm-playlist { position: fixed; bottom: 85px; right: 20px; width: 280px; background: #0a0a0a; border: 1px solid #333; border-radius: 12px; display: none; flex-direction: column; z-index: ${MAX_Z}; overflow: hidden; }
        .pm-music-note { position: fixed; bottom: 85px; right: 20px; background: rgba(0,0,0,0.95); border-left: 5px solid ${CONFIG.accentColor}; padding: 15px 25px; color: white; z-index: ${MAX_Z}; transform: translateX(200%); transition: 0.5s; pointer-events: none; }
        .pm-music-note.show { transform: translateX(0); }
        .pm-track { padding: 12px 18px; cursor: pointer; color: #888; border-bottom: 1px solid #1a1a1a; font-size: 14px; }
        .pm-track.active { color: ${CONFIG.accentColor}; background: rgba(255,59,59,0.1); border-left: 4px solid ${CONFIG.accentColor}; }
        @keyframes pm-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
    `;
    document.head.appendChild(style);

    // --- 2. 注入 HTML ---
    const ui = document.createElement('div');
    ui.id = "pm-music-root";
    ui.innerHTML = `
        <div id="pm-seed-overlay">
            <div class="pm-seed-ball" id="pm-trigger"></div>
            <div class="pm-seed-text">Press to Manifest</div>
        </div>
        <div id="pm-notice" class="pm-music-note"></div>
        <div id="pm-music-btn">🎧</div>
        <div id="pm-playlist">
            <div style="padding:15px; color:${CONFIG.primaryColor}; font-size:12px; font-weight:bold; border-bottom:1px solid #333;">COGNITION FILTER ACTIVE</div>
            <div id="pm-list-inner"></div>
        </div>
        <div id="pm-yt-frame" style="display:none;"></div>
    `;
    // 確保它被放在 body 的最後面，減少被覆蓋的機率
    document.body.appendChild(ui);

    // --- 3. YouTube API ---
    if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
    }

    window.onYouTubeIframeAPIReady = function() {
        player = new YT.Player('pm-yt-frame', {
            height: '0', width: '0',
            videoId: CONFIG.tracks[0].id,
            playerVars: { 'autoplay': 0, 'controls': 0 },
            events: { 
                'onReady': () => {
                    document.getElementById('pm-trigger').onclick = (e) => {
                        e.stopPropagation();
                        startSequence();
                    };
                    initUI();
                },
                'onStateChange': (e) => { if (e.data == YT.PlayerState.ENDED) nextTrack(); }
            }
        });
    };

    function startSequence() {
        const btn = document.getElementById('pm-trigger');
        const overlay = document.getElementById('pm-seed-overlay');
        
        player.playVideo();
        player.setVolume(0);
        
        // 平滑淡入
        let vol = 0;
        const interval = setInterval(() => {
            vol += 2;
            player.setVolume(vol);
            if (vol >= CONFIG.maxVolume) clearInterval(interval);
        }, 100);

        btn.classList.add('expand');
        document.querySelector('.pm-seed-text').style.opacity = '0';

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

    function initUI() {
        document.getElementById('pm-music-btn').onclick = () => {
            const p = document.getElementById('pm-playlist');
            p.style.display = (p.style.display === 'flex') ? 'none' : 'flex';
        };
        const list = document.getElementById('pm-list-inner');
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
