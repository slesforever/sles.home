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
    let isUnlocked = false;

    // 1. 自動注入 CSS
    const style = document.createElement('style');
    style.innerHTML = `
        /* 隱形點擊層：進網頁時覆蓋全螢幕 */
        #music-unlock-layer {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.01); /* 幾乎透明 */
            z-index: 10000; cursor: pointer;
            display: flex; align-items: center; justify-content: center;
        }
        /* 提示小文字（可選，讓玩家知道點一下有驚喜） */
        #unlock-hint {
            color: rgba(212, 175, 55, 0.3); font-family: sans-serif; 
            font-size: 12px; pointer-events: none;
        }
        .music-note { position: fixed; bottom: 85px; right: 20px; background: rgba(0,0,0,0.9); border-left: 4px solid #ff3b3b; padding: 12px 20px; border-radius: 8px; color: white; font-size: 14px; z-index: 9999; transform: translateX(150%); transition: 0.5s; box-shadow: 0 10px 30px rgba(0,0,0,0.5); pointer-events: none; }
        .music-note.show { transform: translateX(0); }
        #music-control-btn { position: fixed; bottom: 20px; right: 20px; width: 55px; height: 55px; background: #151515; border: 1px solid #d4af37; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 9999; font-size: 22px; transition: 0.3s; }
        #playlist-window { position: fixed; bottom: 85px; right: 20px; width: 280px; background: #0f0f0f; border: 1px solid #2e2e2e; border-radius: 12px; display: none; flex-direction: column; z-index: 9998; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        #playlist-window.open { display: flex; }
        .track-item { padding: 12px; cursor: pointer; color: #888; border-bottom: 1px solid #1a1a1a; font-size: 13px; }
        .track-item.active { color: #ff3b3b; background: rgba(255, 59, 59, 0.1); }
    `;
    document.head.appendChild(style);

    // 2. 自動注入 HTML
    const container = document.createElement('div');
    container.innerHTML = `
        <div id="music-unlock-layer"><span id="unlock-hint">Click anywhere to initialize Archive Audio...</span></div>
        <div id="music-notification" class="music-note"></div>
        <div id="music-control-btn">🎵</div>
        <div id="playlist-window">
            <div style="padding:15px; color:#d4af37; font-weight:bold; border-bottom:1px solid #333;">AUDIO SETTINGS</div>
            <div id="playlist-content"></div>
        </div>
        <div id="youtube-player"></div>
    `;
    document.body.appendChild(container);

    // 3. YouTube API
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);

    window.onYouTubeIframeAPIReady = function() {
        player = new YT.Player('youtube-player', {
            height: '0', width: '0',
            videoId: tracks[currentTrackIndex].id,
            playerVars: { 'autoplay': 1, 'controls': 0 },
            events: {
                'onReady': (e) => { 
                    initUI();
                    setupUnlocker();
                },
                'onStateChange': (e) => { if (e.data == YT.PlayerState.ENDED) nextTrack(); }
            }
        });
    };

    function setupUnlocker() {
        const layer = document.getElementById('music-unlock-layer');
        layer.addEventListener('click', () => {
            if (isUnlocked) return;
            player.playVideo();
            player.setVolume(50);
            isUnlocked = true;
            
            // 播放成功後顯示通知並移除遮罩
            showNotice(tracks[currentTrackIndex].name);
            layer.style.display = 'none'; 
            console.log("Audio Unlocked!");
        });
    }

    function initUI() {
        document.getElementById('music-control-btn').onclick = () => {
            document.getElementById('playlist-window').classList.toggle('open');
        };
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
        currentTrackIndex = i;
        player.loadVideoById(tracks[i].id);
        document.querySelectorAll('.track-item').forEach((el, idx) => el.classList.toggle('active', idx === i));
        showNotice(tracks[i].name);
        document.getElementById('playlist-window').classList.remove('open');
    }

    function showNotice(name) {
        const note = document.getElementById('music-notification');
        note.innerHTML = `<div style="font-size:10px; color:#888;">Now Playing</div><b>${name}</b>`;
        note.classList.add('show');
        setTimeout(() => note.classList.remove('show'), 4000);
    }

    function nextTrack() {
        currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
        playTrack(currentTrackIndex);
    }
})();
