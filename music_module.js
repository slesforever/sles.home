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

    // --- 1. 強化視覺平滑度 ---
    const style = document.createElement('style');
    style.innerHTML = `
        #seed-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: #000; z-index: 20000;
            display: flex; align-items: center; justify-content: center;
            overflow: hidden;
            transition: opacity 2s ease-out 0.5s; /* 最後白幕淡出的時間 */
        }
        
        .seed-of-light {
            width: 60px; height: 60px;
            background: #fff;
            border-radius: 50%;
            box-shadow: 0 0 40px #fff, 0 0 80px #fff;
            cursor: pointer;
            z-index: 20001;
            /* 使用極致平滑的擴張曲線 */
            transition: transform 1.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* 核心：放大覆蓋全螢幕 */
        .seed-of-light.grow {
            transform: scale(100); /* 放大 100 倍足以覆蓋任何螢幕 */
        }

        #seed-overlay.fade-out {
            opacity: 0;
            pointer-events: none;
        }

        .seed-text {
            position: absolute; bottom: 20%;
            color: #d4af37; font-family: "serif";
            letter-spacing: 8px; font-size: 12px;
            transition: opacity 0.5s;
        }

        body.focus-in { 
            animation: web-focus 4s ease-out forwards; 
        }
        @keyframes web-focus {
            from { filter: blur(15px) brightness(2.5); }
            to { filter: blur(0px) brightness(1); }
        }

        /* UI */
        .music-note { position: fixed; bottom: 85px; right: 20px; background: rgba(0,0,0,0.9); border-left: 4px solid #ff3b3b; padding: 12px 20px; border-radius: 8px; color: white; font-size: 14px; z-index: 9999; transform: translateX(150%); transition: 0.5s; pointer-events: none; }
        .music-note.show { transform: translateX(0); }
        #music-control-btn { position: fixed; bottom: 20px; right: 20px; width: 55px; height: 55px; background: #151515; border: 1px solid #d4af37; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 9999; font-size: 22px; }
        #playlist-window { position: fixed; bottom: 85px; right: 20px; width: 280px; background: #0f0f0f; border-radius: 12px; display: none; flex-direction: column; z-index: 9998; border: 1px solid #333; }
        #playlist-window.open { display: flex; }
        .track-item { padding: 12px; cursor: pointer; color: #888; font-size: 13px; }
        .track-item.active { color: #ff3b3b; background: rgba(255, 59, 59, 0.1); }
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
            events: { 'onReady': () => { document.getElementById('start-btn').onclick = startRitual; } }
        });
    };

    function startRitual() {
        const btn = document.getElementById('start-btn');
        const overlay = document.getElementById('seed-overlay');
        const text = document.querySelector('.seed-text');

        // 1. 球體慢慢滑順放大
        btn.classList.add('grow');
        text.style.opacity = '0';

        // 2. 音樂啟動
        player.playVideo();
        player.setVolume(targetVolume);

        // 3. 網頁背景開始聚焦
        document.body.classList.add('focus-in');

        // 4. 當球體蓋滿螢幕後，整個層慢慢變透明
        setTimeout(() => {
            overlay.classList.add('fade-out');
            setTimeout(() => {
                overlay.remove();
                initUI();
            }, 2500);
        }, 1200); // 這裡的時間對準球體放大的節奏

        setTimeout(() => showNotice(tracks[currentTrackIndex].name), 2000);
    }

    function initUI() {
        document.getElementById('music-control-btn').onclick = () => document.getElementById('playlist-window').classList.toggle('open');
        const content = document.getElementById('playlist-content');
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
