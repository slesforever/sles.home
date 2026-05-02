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
            z-index: 9999;
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
            z-index: 9999;
            font-size: 22px;
        }

        #playlist-window {
            position: fixed;
            bottom: 85px;
            right: 20px;
            width: 280px;
            background: #0f0f0f;
            border-radius: 12px;
            display: none;
            flex-direction: column;
            z-index: 9998;
        }

        #playlist-window.open { display: flex; }

        .track-item {
            padding: 10px;
            cursor: pointer;
            color: #888;
            font-size: 13px;
        }

        .track-item.active { color: #ff3b3b; }
    `;
    document.head.appendChild(style);

    // =========================
    // UI HTML
    // =========================
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

    // =========================
    // YouTube API
    // =========================
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);

    window.onYouTubeIframeAPIReady = function() {
        player = new YT.Player('youtube-player', {
            height: '0',
            width: '0',
            videoId: tracks[currentTrackIndex].id,
            events: {
                onReady: () => {
                    // ⭐ 核心：預熱播放（0音量）
                    player.mute();
                    player.setVolume(0);
                    player.playVideo(); // 已在跑 = 低延遲關鍵

                    initUI();
                },
                onStateChange: (e) => {
                    if (e.data === YT.PlayerState.ENDED) nextTrack();
                }
            }
        });
    };

    // =========================
    // UI init（不依賴播放器）
    // =========================
    function initUI() {
        const btn = document.getElementById('music-control-btn');
        btn.onclick = () => {
            document.getElementById('playlist-window').classList.toggle('open');
            unlockAudio(); // 點UI也能解鎖
        };

        const content = document.getElementById('playlist-content');

        tracks.forEach((t, i) => {
            const item = document.createElement('div');
            item.className = `track-item ${i === currentTrackIndex ? 'active' : ''}`;
            item.innerText = `${i + 1}. ${t.name}`;
            item.onclick = () => playTrack(i);
            content.appendChild(item);
        });
    }

    // =========================
    // ⭐ 核心：滑鼠一動立即出聲
    // =========================
    function unlockAudio() {
        if (unlocked || !player) return;
        unlocked = true;

        player.unMute();
        fadeInFast();
    }

    window.addEventListener("mousemove", unlockAudio, { once: true });
    window.addEventListener("touchstart", unlockAudio, { once: true });

    // =========================
    // 超快淡入（幾乎瞬間）
    // =========================
    function fadeInFast() {
        let vol = 0;
        player.setVolume(0);

        const step = () => {
            vol += 25;
            if (vol >= 100) {
                player.setVolume(100);
                return;
            }
            player.setVolume(vol);
            requestAnimationFrame(step);
        };

        step();
    }

    // =========================
    // 淡出
    // =========================
    function fadeOut(cb) {
        let vol = player.getVolume();

        clearInterval(fadeInterval);

        fadeInterval = setInterval(() => {
            if (vol > 0) {
                vol -= 5;
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

        fadeOut(() => {
            player.loadVideoById(tracks[i].id);

            if (unlocked) {
                player.unMute();
                fadeInFast();
            }
        });

        updateUI();
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
        note.innerHTML = `<small>Now Playing</small><br><b>${name}</b>`;
        note.classList.add('show');
        setTimeout(() => note.classList.remove('show'), 2500);
    }

    // =========================
    // UI 關閉
    // =========================
    window.addEventListener('click', (e) => {
        const win = document.getElementById('playlist-window');
        const btn = document.getElementById('music-control-btn');

        if (win.classList.contains('open') &&
            !win.contains(e.target) &&
            !btn.contains(e.target)) {
            win.classList.remove('open');
        }
    });

})();
