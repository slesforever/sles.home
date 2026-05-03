(function() {
    // 0. 防重疊機制：如果已經存在，先移除舊的
    const existingOverlay = document.getElementById('seed-overlay');
    if (existingOverlay) existingOverlay.remove();
    const existingBtn = document.getElementById('music-control-btn');
    if (existingBtn) existingBtn.remove();

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

    const style = document.createElement('style');
    style.innerHTML = `
        #seed-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: #000; z-index: 20000;
            display: flex; align-items: center; justify-content: center;
            overflow: hidden;
            transition: opacity 1.5s ease-in-out;
        }

        /* 放大用的容器 */
        #seed-container {
            position: relative;
            width: 70px; height: 70px;
            transition: transform 1.2s cubic-bezier(0.45, 0.05, 0.55, 0.95);
            display: flex; align-items: center; justify-content: center;
            z-index: 20001;
            cursor: pointer;
        }

        /* 呼吸用的光球 */
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

        /* 點擊後的炸裂狀態 */
        #seed-container.grow {
            transform: scale(400); /* 夠大才能填滿螢幕 */
        }
        #seed-container.grow .seed-of-light {
            animation: none !important; /* 停止呼吸 */
            opacity: 1;
        }

        #seed-overlay.fade-out {
            opacity: 0;
            pointer-events: none;
        }

        .seed-text {
            position: absolute; bottom: 15%;
            color: #d4af37; font-family: "serif";
            letter-spacing: 10px; font-size: 13px; font-weight: bold;
            /* 文字亮暗跟著球體同步 */
            animation: text-pulse 4s infinite ease-in-out;
            transition: opacity 0.5s;
            pointer-events: none;
        }

        @keyframes text-pulse {
            0%, 100% { opacity: 0.2; filter: blur(1px); }
            50% { opacity: 1; filter: blur(0px); text-shadow: 0 0 15px #d4af37; }
        }

        body.focus-in { 
            animation: web-focus 4s ease-out forwards; 
        }
        @keyframes web-focus {
            0% { filter: blur(20px) brightness(2.5); }
            100% { filter: blur(0px) brightness(1); }
        }

        /* UI 介面保持原樣 */
        .music-note { position: fixed; bottom: 85px; right: 20px; background: rgba(0,0,0,0.9); border-left: 4px solid #ff3b3b; padding: 12px 20px; border-radius: 8px; color: white; font-size: 14px; z-index: 9999; transform: translateX(150%); transition: 0.5s; pointer-events: none; font-family: sans-serif; }
        .music-note.show { transform: translateX(0); }
        #music-control-btn { position: fixed; bottom: 20px; right: 20px; width: 55px; height: 55px; background: #151515; border: 1px solid #d4af37; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 9999; font-size: 22px; box-shadow: 0 0 15px rgba(0,0,0,0.5); }
        #playlist-window { position: fixed; bottom: 85px; right: 20px; width: 280px; background: #0f0f0f; border-radius: 12px; display: none; flex-direction: column; z-index: 9998; border: 1px solid #333; font-family: sans-serif; }
        #playlist-window.open { display: flex; }
        .track-item { padding: 12px; cursor: pointer; color: #888; font-size: 13px; border-bottom: 1px solid #1a1a1a; }
        .track-item.active { color: #ff3b3b; background: rgba(255, 59, 59, 0.1); }
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
        <div id="music-control-btn">🎵</div>
        <div id="playlist-window"><div id="playlist-content"></div></div>
        <div id="youtube-player" style="display:none;"></div>
    `;
    document.body.appendChild(container);

    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);

    window.onYouTubeIframeAPIReady = function() {
        player = new YT.Player('youtube-player', {
            height: '0', width: '0', videoId: tracks[currentTrackIndex].id,
            events: { 'onReady': () => { 
                document.getElementById('seed-container').onclick = startRitual; 
            } }
        });
    };

    function startRitual() {
        const container = document.getElementById('seed-container');
        const overlay = document.getElementById('seed-overlay');
        const text = document.querySelector('.seed-text');

        // 1. 立即讓球體開始放大
        container.classList.add('grow');
        text.style.opacity = '0'; // 點擊瞬間文字消失，避免遮擋

        // 2. 音樂預熱
        player.playVideo();
        player.setVolume(targetVolume);
        document.body.classList.add('focus-in');

        // 3. 延遲執行「背景淡出」，確保球體已經「撐滿螢幕」
        // 球體 transition 是 1.2s，我們在 0.8s 左右球體已經覆蓋大部分視野時開始淡出
        setTimeout(() => {
            overlay.classList.add('fade-out');
            setTimeout(() => {
                overlay.remove();
                initUI();
            }, 1500); // 等待淡出動畫結束才移除 DOM
        }, 800);

        setTimeout(() => showNotice(tracks[currentTrackIndex].name), 2000);
    }

    function initUI() {
        document.getElementById('music-control-btn').onclick = () => document.getElementById('playlist-window').classList.toggle('open');
        const content = document.getElementById('playlist-content');
        if (content.children.length > 0) return;
        tracks.forEach((t, i) => {
            const item = document.createElement('div');
            item.className = `track-item ${i === currentTrackIndex ? 'active' : ''}`;
            item.innerText = `${i+1}. ${t.name}`;
            item.onclick = () => {
                currentTrackIndex = i;
                player.loadVideoById(tracks[i].id);
                showNotice(tracks[i].name);
                document.querySelectorAll('.track-item').forEach((el, idx) => el.classList.toggle('active', idx === i));
            };
            content.appendChild(item);
        });
    }

    function showNotice(name) {
        const note = document.getElementById('music-notification');
        note.innerHTML = `<small>Now Playing</small><br><b>${name}</b>`;
        note.classList.add('show');
        setTimeout(() => note.classList.remove('show'), 3500);
    }
})();
