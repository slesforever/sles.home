(function() {
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
    let targetVolume = 50;

    // --- 1. CSS 強化：加入聚焦與光擴散過渡 ---
    const style = document.createElement('style');
    style.innerHTML = `
        #seed-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: #000; z-index: 20000;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            transition: background 1.5s ease, opacity 2.5s cubic-bezier(0.4, 0, 0.2, 1);
            pointer-events: all;
        }
        
        .seed-of-light {
            width: 80px; height: 80px;
            background: #fff;
            border-radius: 50%;
            box-shadow: 0 0 40px #fff, 0 0 80px #d4af37;
            cursor: pointer;
            z-index: 20001;
            transition: transform 1.5s cubic-bezier(0.7, 0, 0.3, 1), opacity 1s ease;
        }

        /* 照亮狀態：白光層 */
        #seed-overlay.illuminated {
            background: #fff !important;
        }

        /* 核心：光球炸開並變淡 */
        .seed-of-light.expand {
            transform: scale(100);
            opacity: 0;
        }

        /* 文字淡出 */
        .seed-text {
            margin-top: 30px; color: #d4af37; font-family: "serif";
            letter-spacing: 8px; font-size: 12px; opacity: 0.5;
            transition: opacity 0.8s ease;
        }

        /* 網頁聚焦：給 body 加一個過渡 */
        body.focus-in {
            animation: web-focus 3s forwards;
        }

        @keyframes web-focus {
            from { filter: blur(10px) brightness(2); transform: scale(0.98); }
            to { filter: blur(0px) brightness(1); transform: scale(1); }
        }

        /* UI 介面 */
        .music-note { position: fixed; bottom: 85px; right: 20px; background: rgba(0,0,0,0.9); border-left: 4px solid #ff3b3b; padding: 12px 20px; border-radius: 8px; color: white; font-size: 14px; z-index: 9999; transform: translateX(150%); transition: 0.5s; pointer-events: none; }
        .music-note.show { transform: translateX(0); }
        #music-control-btn { position: fixed; bottom: 20px; right: 20px; width: 55px; height: 55px; background: #151515; border: 1px solid #d4af37; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 9999; font-size: 22px; }
        #playlist-window { position: fixed; bottom: 85px; right: 20px; width: 280px; background: #0f0f0f; border: 1px solid #2e2e2e; border-radius: 12px; display: none; flex-direction: column; z-index: 9998; overflow: hidden; }
        #playlist-window.open { display: flex; }
        .track-item { padding: 12px; cursor: pointer; color: #888; border-bottom: 1px solid #1a1a1a; font-size: 13px; }
        .track-item.active { color: #ff3b3b; background: rgba(255, 59, 59, 0.1); border-left: 3px solid #ff3b3b; }
    `;
    document.head.appendChild(style);

    // --- 2. HTML 結構 ---
    const container = document.createElement('div');
    container.innerHTML = `
        <div id="seed-overlay">
            <div class="seed-of-light" id="start-btn"></div>
            <div class="seed-text">SEED OF LIGHT</div>
        </div>
        <div id="music-notification" class="music-note"></div>
        <div id="music-control-btn">🎵</div>
        <div id="playlist-window">
            <div style="padding:15px; color:#d4af37; font-weight:bold; border-bottom:1px solid #333; font-size:12px;">LIBRARY AUDIO</div>
            <div id="playlist-content"></div>
        </div>
        <div id="youtube-player" style="position:fixed; top:-1000px;"></div>
    `;
    document.body.appendChild(container);

    // --- 3. YouTube API ---
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);

    window.onYouTubeIframeAPIReady = function() {
        player = new YT.Player('youtube-player', {
            height: '0', width: '0', videoId: tracks[currentTrackIndex].id,
            playerVars: { 'autoplay': 0, 'controls': 0 },
            events: { 
                'onReady': () => {
                    document.getElementById('start-btn').onclick = startFocusRitual;
                    initUI();
                },
                'onStateChange': (e) => { if (e.data == YT.PlayerState.ENDED) nextTrack(); }
            }
        });
    };

    function transitionVolume(start, end, duration) {
        const startTime = performance.now();
        function update() {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            player.setVolume(start + (end - start) * progress);
            if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }

    // --- 4. 關鍵核心：從光芒到網頁的絲滑聚焦 ---
    function startFocusRitual() {
        const btn = document.getElementById('start-btn');
        const overlay = document.getElementById('seed-overlay');
        const text = document.querySelector('.seed-text');

        // 啟動音樂與淡入
        player.playVideo();
        transitionVolume(0, targetVolume, 3000);

        // A. 光球膨脹
        btn.classList.add('expand');
        text.style.opacity = '0';
        
        // B. 變白瞬間
        setTimeout(() => {
            overlay.classList.add('illuminated');
            
            // C. 啟動網頁聚焦動畫 (Blur + Brightness 過渡)
            document.body.classList.add('focus-in');

            // D. 白色層慢慢變透明消失
            setTimeout(() => {
                overlay.style.opacity = '0'; 
                setTimeout(() => {
                    overlay.remove();
                }, 2500);
            }, 300);
        }, 1200);

        setTimeout(() => showNotice(tracks[currentTrackIndex].name), 3000);
    }

    // --- 其他邏輯 ---
    function initUI() {
        document.getElementById('music-control-btn').onclick = () => document.getElementById('playlist-window').classList.toggle('open');
        const content = document.getElementById('playlist-content');
        tracks.forEach((t, i) => {
            const item = document.createElement('div');
            item.className = `track-item ${i === currentTrackIndex ? 'active' : ''}`;
            item.innerText = `${i+1}. ${t.name}`;
            item.onclick = () => playTrack(i);
            content.appendChild(item);
        });
    }

    function playTrack(i) {
        transitionVolume(targetVolume, 0, 800);
        setTimeout(() => {
            currentTrackIndex = i;
            player.loadVideoById(tracks[i].id);
            transitionVolume(0, targetVolume, 1200);
            document.querySelectorAll('.track-item').forEach((el, idx) => el.classList.toggle('active', idx === i));
            showNotice(tracks[i].name);
        }, 850);
        document.getElementById('playlist-window').classList.remove('open');
    }

    function nextTrack() { playTrack((currentTrackIndex + 1) % tracks.length); }
    function showNotice(name) {
        const note = document.getElementById('music-notification');
        note.innerHTML = `<div style="font-size:10px; color:#888;">Now Playing</div><b>${name}</b>`;
        note.classList.add('show');
        setTimeout(() => note.classList.remove('show'), 4000);
    }
})();
