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

    const style = document.createElement('style');
    style.innerHTML = `
        #seed-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: #000; z-index: 20000;
            display: flex; align-items: center; justify-content: center;
            overflow: hidden;
            transition: opacity 2s cubic-bezier(0.4, 0, 0.2, 1) 0.8s;
        }
        
        .seed-of-light {
            position: absolute;
            top: 50%; left: 50%;
            width: 70px; height: 70px;
            background: #fffdf0; /* 暖白黃基底 */
            border-radius: 50%;
            box-shadow: 0 0 40px #fff, 0 0 70px #d4af37, 0 0 100px rgba(212, 175, 55, 0.5);
            cursor: pointer;
            z-index: 20001;
            /* 初始位置與呼吸動畫 */
            transform: translate(-50%, -50%) scale(1);
            animation: seed-breathing 4s infinite ease-in-out;
            transition: transform 1.8s cubic-bezier(0.5, 0, 0.2, 1), background 1s ease;
        }

        /* 呼吸動畫：輕微縮放與光暈深淺 */
        @keyframes seed-breathing {
            0%, 100% { transform: translate(-50%, -50%) scale(0.96); opacity: 0.8; }
            50% { transform: translate(-50%, -50%) scale(1.04); opacity: 1; box-shadow: 0 0 50px #fff, 0 0 90px #d4af37; }
        }

        /* 核心：滑順放大覆蓋（強制停止呼吸動畫） */
        .seed-of-light.grow {
            animation: none !important;
            transform: translate(-50%, -50%) scale(400) !important; 
            background: #fffdf0;
        }

        #seed-overlay.fade-out {
            opacity: 0;
            pointer-events: none;
        }

        .seed-text {
            position: absolute; bottom: 15%;
            color: #d4af37; font-family: "serif";
            letter-spacing: 10px; font-size: 13px; font-weight: bold;
            text-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
            transition: opacity 0.5s;
        }

        body.focus-in { 
            animation: web-focus 5s ease-out forwards; 
        }
        @keyframes web-focus {
            0% { filter: blur(25px) brightness(3); }
            100% { filter: blur(0px) brightness(1); }
        }

        /* UI 選單 */
        .music-note { position: fixed; bottom: 85px; right: 20px; background: rgba(0,0,0,0.9); border-left: 4px solid #ff3b3b; padding: 12px 20px; border-radius: 8px; color: white; font-size: 14px; z-index: 9999; transform: translateX(150%); transition: 0.5s; pointer-events: none; font-family: sans-serif; }
        .music-note.show { transform: translateX(0); }
        #music-control-btn { position: fixed; bottom: 20px; right: 20px; width: 55px; height: 55px; background: #151515; border: 1px solid #d4af37; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 9999; font-size: 22px; box-shadow: 0 0 15px rgba(0,0,0,0.5); }
        #playlist-window { position: fixed; bottom: 85px; right: 20px; width: 280px; background: #0f0f0f; border-radius: 12px; display: none; flex-direction: column; z-index: 9998; border: 1px solid #333; font-family: sans-serif; overflow: hidden; }
        #playlist-window.open { display: flex; }
        .track-item { padding: 12px; cursor: pointer; color: #888; font-size: 13px; border-bottom: 1px solid #1a1a1a; transition: 0.2s; }
        .track-item:hover { background: #222; color: #fff; }
        .track-item.active { color: #ff3b3b; background: rgba(255, 59, 59, 0.1); border-left: 3px solid #ff3b3b; }
    `;
    document.head.appendChild(style);

    const container = document.createElement('div');
    container.innerHTML = `
        <div id="seed-overlay">
            <div class="seed-of-light" id="start-btn"></div>
            <div class="seed-text">SEED OF LIGHT</div>
        </div>
        <div id="music-notification" class="music-note"></div>
        <div id="music-control-btn">🎵</div>
        <div id="playlist-window">
            <div style="padding:15px; color:#d4af37; font-weight:bold; border-bottom:1px solid #333; font-size:11px;">LOBOTOMY AUDIO</div>
            <div id="playlist-content"></div>
        </div>
        <div id="youtube-player" style="display:none;"></div>
    `;
    document.body.appendChild(container);

    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);

    window.onYouTubeIframeAPIReady = function() {
        player = new YT.Player('youtube-player', {
            height: '0', width: '0', videoId: tracks[currentTrackIndex].id,
            events: { 'onReady': () => { document.getElementById('start-btn').onclick = startRitual; } }
        });
    };

    function startRitual() {
        const btn = document.getElementById('start-btn');
        const overlay = document.getElementById('seed-overlay');
        const text = document.querySelector('.seed-text');

        // 啟動炸裂動畫
        btn.classList.add('grow');
        text.style.opacity = '0';

        // 播放音樂與聚焦效果
        player.playVideo();
        player.setVolume(targetVolume);
        document.body.classList.add('focus-in');

        // 當暖白光球覆蓋全螢幕後，整個層淡出
        setTimeout(() => {
            overlay.classList.add('fade-out');
            setTimeout(() => {
                overlay.remove();
                initUI();
            }, 2500);
        }, 1300);

        setTimeout(() => showNotice(tracks[currentTrackIndex].name), 2500);
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
        note.innerHTML = `<small style="color:#888;">Now Synchronizing...</small><br><b>${name}</b>`;
        note.classList.add('show');
        setTimeout(() => note.classList.remove('show'), 4000);
    }
})();
