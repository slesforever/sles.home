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
    let unlocked = false;
    let fadeInterval = null;

    // ===== CSS =====
    const style = document.createElement('style');
    style.innerHTML = `
        .music-note { position: fixed; bottom: 85px; right: 20px; background: rgba(0,0,0,0.9); border-left: 4px solid #ff3b3b; padding: 12px 20px; border-radius: 8px; color: white; font-size: 14px; z-index: 9999; transform: translateX(150%); transition: 0.5s; }
        .music-note.show { transform: translateX(0); }
        #music-control-btn { position: fixed; bottom: 20px; right: 20px; width: 55px; height: 55px; background: #151515; border: 1px solid #d4af37; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 9999; font-size: 22px; }
        #playlist-window { position: fixed; bottom: 85px; right: 20px; width: 280px; background: #0f0f0f; border-radius: 12px; display: none; flex-direction: column; z-index: 9998; }
        #playlist-window.open { display: flex; }
        .pmu-header { padding: 15px; color: #d4af37; }
        #playlist-content { max-height: 350px; overflow-y: auto; padding: 10px; }
        .track-item { padding: 10px; cursor: pointer; color: #888; }
        .track-item.active { color: #ff3b3b; }
    `;
    document.head.appendChild(style);

    // ===== HTML =====
    const container = document.createElement('div');
    container.innerHTML = `
        <div id="music-notification" class="music-note"></div>
        <div id="music-control-btn">🎵</div>
        <div id="playlist-window">
            <div class="pmu-header">ARCHIVE AUDIO SETTINGS</div>
            <div id="playlist-content"></div>
        </div>
        <div id="youtube-player" style="display:none;"></div>
    `;
    document.body.appendChild(container);

    // ===== YouTube API =====
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);

    window.onYouTubeIframeAPIReady = function() {
        player = new YT.Player('youtube-player', {
            height: '0',
            width: '0',
            videoId: tracks[currentTrackIndex].id,
            events: {
                'onReady': onPlayerReady,
                'onStateChange': (e) => {
                    if (e.data === YT.PlayerState.ENDED) nextTrack();
                }
            }
        });
    };

    function onPlayerReady() {
        player.setVolume(0);
        player.mute();
        player.playVideo(); // 靜音自動播放
        initUI();
    }

    // ===== 解鎖音訊（滑鼠 / 手機）=====
    function unlockAudio() {
        if (unlocked || !player) return;
        unlocked = true;

        player.unMute();
        fadeIn(100, 20); // 淡入音量
    }

    window.addEventListener('mousemove', unlockAudio, { once: true });
    window.addEventListener('touchstart', unlockAudio, { once: true });

    // ===== 淡入 =====
    function fadeIn(target = 100, step = 5) {
        clearInterval(fadeInterval);
        let vol = player.getVolume();

        fadeInterval = setInterval(() => {
            if (vol < target) {
                vol += step;
                player.setVolume(Math.min(vol, target));
            } else {
                clearInterval(fadeInterval);
            }
        }, 50);
    }

    // ===== 淡出 =====
    function fadeOut(callback) {
        clearInterval(fadeInterval);
        let vol = player.getVolume();

        fadeInterval = setInterval(() => {
            if (vol > 0) {
                vol -= 5;
                player.setVolume(Math.max(vol, 0));
            } else {
                clearInterval(fadeInterval);
                if (callback) callback();
            }
        }, 50);
    }

    // ===== UI =====
    function initUI() {
        const btn = document.getElementById('music-control-btn');
        btn.onclick = () => {
            unlockAudio(); // 點擊也能解鎖
            document.getElementById('playlist-window').classList.toggle('open');
        };

        const content = document.getElementById('playlist-content');
        tracks.forEach((t, i) => {
            const item = document.createElement('div');
            item.className = `track-item ${i === currentTrackIndex ? 'active' : ''}`;
            item.innerText = `${i + 1}. ${t.name}`;
            item.onclick = () => switchTrack(i);
            content.appendChild(item);
        });
    }

    // ===== 切歌（淡出 → 換 → 淡入）=====
    function switchTrack(i) {
        currentTrackIndex = i;

        fadeOut(() => {
            player.loadVideoById(tracks[i].id);

            if (unlocked) {
                player.unMute();
                fadeIn();
            }
        });

        updateUI(i);
        showNowPlaying(tracks[i].name);
    }

    function nextTrack() {
        let next = (currentTrackIndex + 1) % tracks.length;
        switchTrack(next);
    }

    function updateUI(i) {
        document.querySelectorAll('.track-item').forEach((el, idx) => {
            el.classList.toggle('active', idx === i);
        });
    }

    function showNowPlaying(name) {
        const note = document.getElementById('music-notification');
        note.innerHTML = `<div style="font-size:10px;color:#888;">Now Playing</div><b>${name}</b>`;
        note.classList.add('show');
        setTimeout(() => note.classList.remove('show'), 3000);
    }

})();
