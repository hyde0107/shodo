function initApp(data, videoElementId) {
    const video = document.getElementById(videoElementId);
    const listElement = document.getElementById('timestamp-list');
    const items = [];

    listElement.innerHTML = ""; 

    data.forEach(([timeStr, text, memo]) => {
        const parts = timeStr.trim().split(':').reverse();
        let seconds = parseInt(parts[0], 10) + (parseInt(parts[1], 10) * 60);
        if (parts[2]) seconds += (parseInt(parts[2], 10) * 3600);

        // --- 判定はこれだけでOK ---
        let colorClass = "";
        if (memo) {
            const m = memo.trim();
            if (m.includes("大字")) {
                colorClass = "memo-color-1"; // 赤
            } else if (m.includes("色")) {
                colorClass = "memo-color-2"; // 青
            } else if (m.includes("文字")) {
                colorClass = "memo-color-3"; // 緑
            } else if (m.includes("スプレー")) {
                colorClass = "memo-color-4"; // オレンジ
            } else {
                colorClass = "memo-color-5"; // 紫（その他全部）
            }
        }

        const item = document.createElement('div');
        item.className = 'timestamp-item';
        item.innerHTML = `
            <div class="item-main">
                <span class="time-badge">${timeStr}</span>
                <span class="text-content">${text}</span>
            </div>
            <div class="memo-content ${colorClass}">${memo || ''}</div>
        `;
        
        item.onclick = () => {
            if (window.player && window.player.seekTo) {
                window.player.seekTo(seconds, true);
                window.player.playVideo();
            } else if (video) {
                video.currentTime = seconds;
                video.play();
            }
        };

        listElement.appendChild(item);
        items.push({ seconds, element: item });
    });

    const updateHighlight = (currentTime) => {
        if (currentTime === undefined) return;
        items.forEach((item, index) => {
            const nextItem = items[index + 1];
            const isPlaying = currentTime >= item.seconds && (!nextItem || currentTime < nextItem.seconds);
            if (isPlaying) {
                if (!item.element.classList.contains('playing')) {
                    items.forEach(i => i.element.classList.remove('playing'));
                    item.element.classList.add('playing');
                    item.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
    };

    if (video) {
        video.addEventListener('timeupdate', () => updateHighlight(video.currentTime));
    }

    return { updateHighlight };
}
