/**
 * 共通ユーティリティ: 時間文字列を秒数に変換
 * 例: "01:23" -> 83
 */
function parseTime(timeStr) {
    if (!timeStr) return 0;
    const parts = timeStr.trim().split(':').reverse();
    let seconds = parseInt(parts[0], 10) + (parseInt(parts[1] || 0, 10) * 60);
    if (parts[2]) seconds += (parseInt(parts[2], 10) * 3600);
    return seconds;
}

/**
 * 共通ユーティリティ: メモからアクションタイプと色情報を取得
 * 戻り値: { type: string, colorClass: string, bgClass: string, isPrep: boolean }
 */
function getMemoInfo(memo) {
    if (!memo) return { type: "normal", colorClass: "", bgClass: "bg-black", isPrep: false };
    
    const m = memo.trim();
    const isPrep = m.includes("準備");
    
    let colorClass = "memo-color-5"; // デフォルト（紫/その他）
    let bgBase = "purple";           // デフォルト背景色

    if (m.includes("大字")) {
        colorClass = "memo-color-1"; // 赤
        bgBase = "red";
    } else if (m.includes("色")) {
        colorClass = "memo-color-2"; // 青
        bgBase = "blue";
    } else if (m.includes("文字")) {
        colorClass = "memo-color-3"; // 緑
        bgBase = "green";
    } else if (m.includes("スプレー")) {
        colorClass = "memo-color-4"; // 橙
        bgBase = "orange";
    }

    // "bg-red" または "bg-red-prep" のようなクラス名を生成
    const bgClass = `bg-${bgBase}${isPrep ? "-prep" : ""}`;

    return { 
        type: bgBase, 
        colorClass: colorClass, 
        bgClass: bgClass, 
        isPrep: isPrep 
    };
}

// -------------------------------------------------------
// 以下、リスト表示用ロジック (元のinitAppを修正して維持)
// -------------------------------------------------------

function initApp(data, videoElementId) {
    const video = document.getElementById(videoElementId);
    const listElement = document.getElementById('timestamp-list');
    const items = [];

    if(listElement) listElement.innerHTML = "";

    data.forEach(([timeStr, text, memo]) => {
        // 共通関数を使用
        const seconds = parseTime(timeStr);
        const info = getMemoInfo(memo);

        // リストアイテム生成（リスト表示画面用）
        if (listElement) {
            const item = document.createElement('div');
            item.className = 'timestamp-item';
            // info.colorClass を使用
            item.innerHTML = `
                <div class="item-main">
                    <span class="time-badge">${timeStr}</span>
                    <span class="text-content">${text}</span>
                </div>
                <div class="memo-content ${info.colorClass}">${memo || ''}</div>
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
        }
    });

    const updateHighlight = (currentTime) => {
        if (currentTime === undefined || !listElement) return;
        
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
