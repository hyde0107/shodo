function initApp(data, videoElementId) {
    const video = document.getElementById(videoElementId);
    const listElement = document.getElementById('timestamp-list');
    const items = [];

    listElement.innerHTML = ""; // 初期化

    data.forEach(([timeStr, text, memo]) => {
        const parts = timeStr.trim().split(':').reverse();
        let seconds = parseInt(parts[0], 10) + (parseInt(parts[1], 10) * 60);
        if (parts[2]) seconds += (parseInt(parts[2], 10) * 3600);

        const item = document.createElement('div');
        item.className = 'timestamp-item';
        item.innerHTML = `
            <div class="item-main">
                <span class="time-badge">${timeStr}</span>
                <span class="text-content">${text}</span>
            </div>
            <div class="memo-content">${memo || ''}</div>
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
