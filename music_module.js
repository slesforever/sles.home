(function() {
    // 1. 先把 body 藏起來，確保黑幕絕對存在
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed !important; top: 0 !important; left: 0 !important;
        width: 100vw !important; height: 100vh !important;
        background: #000 !important; z-index: 2147483647 !important;
        display: flex !important; align-items: center !important; justify-content: center !important;
        cursor: pointer !important; transition: opacity 2s ease !important;
    `;
    
    const seed = document.createElement('div');
    seed.style.cssText = `
        width: 80px; height: 80px; background: #fff; border-radius: 50%;
        box-shadow: 0 0 60px #fff, 0 0 100px #d4af37;
        transition: transform 1.5s cubic-bezier(0.7, 0, 0.3, 1), opacity 1s;
    `;
    
    overlay.appendChild(seed);
    document.documentElement.appendChild(overlay);

    // 2. 嘗試加載音樂（如果失敗了也不要影響動畫）
    let playerReady = false;
    try {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
        
        window.onYouTubeIframeAPIReady = () => {
            const ytDiv = document.createElement('div');
            ytDiv.id = 'temp-yt-player';
            overlay.appendChild(ytDiv);
            const player = new YT.Player('temp-yt-player', {
                height: '0', width: '0', videoId: 'aeIXVi6iXFI',
                events: { 'onReady': () => { playerReady = true; } }
            });
            window.pmPlayer = player;
        };
    } catch(e) { console.log("Music blocked by site CSP."); }

    // 3. 點擊啟動（無論有沒有音樂都執行動畫）
    overlay.onclick = () => {
        if (playerReady && window.pmPlayer) {
            window.pmPlayer.playVideo();
            window.pmPlayer.setVolume(50);
        }

        seed.style.transform = "scale(150)";
        seed.style.opacity = "0";
        
        setTimeout(() => {
            overlay.style.background = "#fff";
            // 加入聚焦濾鏡
            const focusStyle = document.createElement('style');
            focusStyle.innerHTML = `body { animation: pm-f 3s forwards !important; } @keyframes pm-f { from { filter: blur(20px) brightness(2); } to { filter: none; } }`;
            document.head.appendChild(focusStyle);

            setTimeout(() => {
                overlay.style.opacity = "0";
                setTimeout(() => overlay.remove(), 2000);
            }, 500);
        }, 1200);
    };
})();
