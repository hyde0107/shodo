/**
 * アプリケーションの初期化
 * @param {Array} data - myData（[時間, 歌詞, メモ]）の配列
 * @param {string} videoElementId - 動画要素のID（HTML5 video用、YouTubeの場合はnullでも可）
 */
function initApp(data, videoElementId) {
    const video = document.getElementById(videoElementId);
    const listElement = document.getElementById('timestamp-list');
    const items = [];

    listElement.innerHTML = ""; // リストの初期化

    data.forEach(([timeStr, text, memo]) => {
        // --- 1. 時間（"01:23"）を秒数に変換 ---
        const parts = timeStr.trim().split(':').reverse();
        let seconds = parseInt(parts[0], 10) + (parseInt(parts[1], 10) * 60);
        if (parts[2]) seconds += (parseInt(parts[2], 10) * 3600);

        // --- 2. メモの内容に応じた5色の色分け判定 ---
        let colorClass = "";
        if (memo) {
            const m = memo.trim();
            if (m.includes("決め") || m.includes("重要")) {
                colorClass = "memo-color-1"; // 赤系
            } else if (m.includes("サビ")) {
                colorClass = "memo-color-2"; // 青・緑系（目立つ色）
            } else if (m.includes("間奏") || m.includes("♪") || m.includes("Instrumental")) {
                colorClass = "memo-color-3"; // 緑系（楽器セクション）
            } else if (m.includes("期待") || m.includes("変化")) {
                colorClass = "memo-color-4"; // オレンジ系
            } else {
                colorClass = "memo-color-5"; // 紫系（その他）
            }
        }

        // --- 3. HTML要素の生成 ---
        const item = document.createElement('div');
        item.className = 'timestamp-item';
        item.innerHTML = `
            <div class="item-main">
                <span class="time-badge">${timeStr}</span>
                <span class="text-content">${text}</span>
            </div>
            <div class="memo-content ${colorClass}">${memo || ''}</div>
        `;
        
        // --- 4. クリックイベント（動画の再生位置移動） ---
        item.onclick = () => {
            // YouTube Player API が利用可能な場合
            if (window.player && window.player.seekTo) {
                window.player.seekTo(seconds, true);
                window.player.playVideo();
            } 
            // 通常の <video> タグの場合
            else if (video) {
                video.currentTime = seconds;
                video.play();
            }
        };

        listElement.appendChild(item);
        items.push({ seconds, element: item });
    });

    /**
     * 現在の再生時間に合わせてハイライトと自動スクロールを更新
     */
    const updateHighlight = (currentTime) => {
        if (currentTime === undefined) return;
        
        items.forEach((item, index) => {
            const nextItem = items[index + 1];
            // 現在の時間がこのアイテムの開始時間以上、かつ次のアイテムの開始時間未満か判定
            const isPlaying = currentTime >= item.seconds && (!nextItem || currentTime < nextItem.seconds);
            
            if (isPlaying) {
                if (!item.element.classList.contains('playing')) {
                    // 他のアイテムのハイライトを解除
                    items.forEach(i => i.element.classList.remove('playing'));
                    // 自要素にハイライトを付与
                    item.element.classList.add('playing');
                    // 中央に自動スクロール
                    item.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
    };

    // HTML5 video 要素がある場合のイベント登録
    if (video) {
        video.addEventListener('timeupdate', () => updateHighlight(video.currentTime));
    }

    return { updateHighlight };
}
