window.addEventListener('DOMContentLoaded', () => {

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

    let player = null;
    let currentTrackIndex = 0;
    let unlocked = false;
    let fadeInterval = null;

    // ===== CSS =====
    const style = document.createElement('style');
    style.innerHTML = `
        .music-note { position: fixed; bottom: 85px; right: 20px; background: rgba(0,0,0,0.9); border-left: 4px solid #ff3b3b; padding: 12px 20px; border-radius: 8px; color: white; z-index: 9999; transform: translateX(150%); transition: 0.4s; }
        .music-note.show { transform: translateX(0); }
        #music-control-btn { position: fixed; bottom: 20px; right: 20px; width: 55px; height: 55px; background: #151515; border: 1px solid #d4af37; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 9999; font-size: 22px; }
        #playlist-window { position: fixed; bottom: 85px; right: 20px; width: 280px; background: #0f0f0f; border-radius: 12px; display: none; flex-direction: column; z-index: 9998; }
        #playlist-window.open { display: flex; }
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
            <div style="padding:10px;color:#d4af37;">ARCHIVE AUDIO</div>
            <div id="playlist-content"></div>
        </div>
        <div id="youtube-player" style="display:none;"></div>
    `;
    document.body.appendChild(container);

    // ===== UI INIT（不依賴播放器）=====
    function initUI() {
        const btn = document.getElementById('music-control-btn');
        const content = document.getElementById('playlist-content');

        btn.onclick = () => {
            unlockAudio();
            document.getElementById('playlist-window').classList.toggle('open');
        };

        tracks.forEach((t, i) => {
            const item = document.createElement('div');
            item.className = `track-item ${i === 0 ? 'active' : ''}`;
            item.innerText = `${i + 1}. ${t.name}`;
            item.onclick = () => switchTrack(i);
            content.appendChild(item);
        });
    }

    initUI(); // ⭐ UI 永遠先出來

    // ===== 載入 YouTube API =====
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode.insertBefore(tag, firstScript);

    window.onYouTubeIframeAPIReady = function() {
        player = new YT.Player('youtube-player', {
            height: '0',
            width: '0',
            videoId: tracks[0].id,
            events: {
                'onReady': () => {
                    player.cueVideoById(tracks[0].id);
                    player.setVolume(0);
                    player.mute();
                },
                'onStateChange': (e) => {
                    if (e.data === YT.PlayerState.ENDED) nextTrack();
                }
            }
        });
    };

    // ===== 解鎖音訊 =====
    function unlockAudio() {
        if (unlocked || !player) return;
        unlocked = true;

        player.playVideo();
        player.unMute();

        setTimeout(() => fadeIn(), 200);
    }

    window.addEventListener('mousemove', unlockAudio, { once: true });
    window.addEventListener('touchstart', unlockAudio, { once: true });

    // ===== 淡入 =====
    function fadeIn(target = 100) {
        clearInterval(fadeInterval);
        let vol = player.getVolume();

        fadeInterval = setInterval(() => {
            if (vol < target) {
                vol += 5;
                player.setVolume(vol);
            } else clearInterval(fadeInterval);
        }, 50);
    }

    // ===== 淡出 =====
    function fadeOut(callback) {
        clearInterval(fadeInterval);
        let vol = player.getVolume();

        fadeInterval = setInterval(() => {
            if (vol > 0) {
                vol -= 5;
                player.setVolume(vol);
            } else {
                clearInterval(fadeInterval);
                callback && callback();
            }
        }, 50);
    }

    // ===== 切歌 =====
    function switchTrack(i) {
        currentTrackIndex = i;

        if (!player) return;

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
        note.innerHTML = `<small>Now Playing</small><br><b>${name}</b>`;
        note.classList.add('show');
        setTimeout(() => note.classList.remove('show'), 3000);
    }

})();
});
