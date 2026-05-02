(function() {
    // 檢查是否已經存在，避免重複執行
    if (document.getElementById('pm-global-root')) return;

    const CONFIG = {
        tracks: [
            { name: "Malkuth Battle 3", id: "aeIXVi6iXFI" },
            { name: "Malkuth Story", id: "LhoSpUKQEbU" },
            { name: "The Blue Reverberation", id: "uXw1f0porfg" }
        ],
        primaryColor: "#d4af37",
        maxVolume: 50
    };

    // 1. 建立 Shadow Root (最強隔離)
    const host = document.createElement('div');
    host.id = 'pm-global-root';
    host.style.cssText = "position:fixed; top:0; left:0; z-index:2147483647;";
    document.documentElement.appendChild(host);
    const shadow = host.attachShadow({mode: 'open'});

    // 2. 注入 Shadow DOM 專用樣式
    const style = document.createElement('style');
    style.textContent = `
        :host { all: initial; }
        #overlay {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: #000; display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            transition: opacity 2.5s cubic-bezier(0.4, 0, 0.2, 1);
            font-family: "Palatino Linotype", "Book Antiqua", Palatino, serif;
        }
        .seed {
            width: 90px; height: 90px; background: #fff; border-radius: 50%;
            box-shadow: 0 0 50px #fff, 0 0 100px ${CONFIG.primaryColor};
            cursor: pointer; transition: transform 1.5s cubic-bezier(0.7, 0, 0.3, 1), opacity 1s;
            animation: pulse 3s infinite;
        }
        .seed.expand { transform: scale(150); opacity: 0; }
        .text {
            margin-top: 30px; color: ${CONFIG.primaryColor};
            letter-spacing: 10px; font-size: 14px; text-transform: uppercase;
            opacity: 0.8; pointer-events: none;
        }
        .white-out { background: #fff !important; }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        
        /* 播放器隱藏 */
        #yt-wrap { position: absolute; width: 0; height: 0; opacity: 0; pointer-events: none; }
    `;
    shadow.appendChild(style);

    // 3. 注入 HTML
    const container = document.createElement('div');
    container.id = "overlay";
    container.innerHTML = `
        <div class="seed" id="trigger"></div>
        <div class="text">Extracting Seed</div>
        <div id="yt-wrap"><div id="yt-player"></div></div>
    `;
    shadow.appendChild(container);

    // 4. 網頁聚焦動畫 (作用於主文件 body)
    const bodyStyle = document.createElement('style');
    bodyStyle.id = "pm-body-style";
    bodyStyle.innerHTML = `
        .pm-focus-active { animation: pm-focus 3s forwards !important; }
        @keyframes pm-focus {
            from { filter: blur(20px) brightness(2); }
            to { filter: blur(0px) brightness(1); }
        }
    `;
    document.head.appendChild(bodyStyle);

    // 5. YouTube API 處理
    let player;
    const loadYT = () => {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
    };

    window.onYouTubeIframeAPIReady = () => {
        player = new YT.Player(shadow.getElementById('yt-player'), {
            height: '0', width: '0', videoId: CONFIG.tracks[0].id,
            events: { 'onReady': () => console.log("Cognition Filter Synchronized.") }
        });
    };

    if (!window.YT) loadYT(); else window.onYouTubeIframeAPIReady();

    // 6. 點擊邏輯
    shadow.getElementById('trigger').onclick = function() {
        if (player && player.playVideo) {
            player.playVideo();
            player.setVolume(CONFIG.maxVolume);
        }

        this.classList.add('expand');
        shadow.querySelector('.text').style.opacity = '0';

        setTimeout(() => {
            container.classList.add('white-out');
            document.body.classList.add('pm-focus-active');
            
            setTimeout(() => {
                container.style.opacity = '0';
                setTimeout(() => host.remove(), 2500);
            }, 400);
        }, 1200);
    };
})();
