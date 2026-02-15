// リスト生成と自動スクロールの共通エンジン
function initApp(data, videoElementId) {
    const video = document.getElementById(videoElementId);
    const listElement = document.getElementById('timestamp-list');
    const items = [];

    // リストの生成
    data.forEach(([timeStr, text, memo]) => {
        const parts = timeStr.split(':').reverse();
        let seconds = parseInt(parts[0]) + (parseInt(parts[1]) * 60);
        if (parts[2]) seconds += (parseInt(parts[2]) * 3600);

        const item = document.createElement('div');
        item.className = 'timestamp-item';
        item.innerHTML = `
            <div class="item-main">
                <span class="time-badge">${timeStr}</span>
                <span class="text-content">${text}</span>
            </div>
            <div class="memo-content">${memo}</div>
        `;
        
        item.onclick = () => {
            if (typeof player !== 'undefined' && player.seekTo) {
                player.seekTo(seconds, true);
                player.playVideo();
            } else if (video) {
                video.currentTime = seconds;
                video.play();
            }
        };
        listElement.appendChild(item);
        items.push({ seconds, element: item });
    });

    // スクロール処理の共通化
    const updateHighlight = (currentTime) => {
        items.forEach((item, index) => {
            const nextItem = items[index + 1];
            const isPlaying = currentTime >= item.seconds && (!nextItem || currentTime < nextItem.seconds);
            if (isPlaying) {
                if (!item.element.classList.contains('playing')) {
                    item.element.classList.add('playing');
                    item.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            } else {
                item.element.classList.remove('playing');
            }
        });
    };

    // Cloudinary/通常ビデオ用
    if (video) {
        video.addEventListener('timeupdate', () => updateHighlight(video.currentTime));
    }
    
    // YouTube用のタイマー（外部から呼べるように返す）
    return { updateHighlight };
}
