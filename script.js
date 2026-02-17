/**
 * 時間表記("01:23")を秒数に変換する共通関数
 */
function toSeconds(t) {
    if (!t) return 0;
    const p = t.toString().trim().split(':').reverse();
    return parseInt(p[0], 10) + (parseInt(p[1] || 0, 10) * 60) + (parseInt(p[2] || 0, 10) * 3600);
}

/**
 * 【リスト画面用】01.html / 02.html で使用
 * 歌詞リストの生成と自動スクロール・ハイライトを制御
 */
function initApp(data, videoElementId) {
    const video = document.getElementById(videoElementId);
    const listElement = document.getElementById('timestamp-list');
    const items = [];

    listElement.innerHTML = ""; 

    data.forEach(([timeStr, text, memo]) => {
        const seconds = toSeconds(timeStr);

        // メモの内容による色分け（CSSのクラス名に対応）
        let colorClass = "";
        if (memo) {
            const m = memo.trim();
            if (m.includes("大字") || m.includes("書く")) colorClass = "memo-color-1"; // 赤
            else if (m.includes("色") || m.includes("入場")) colorClass = "memo-color-2"; // 青
            else if (m.includes("文字") || m.includes("絵")) colorClass = "memo-color-3"; // 緑
            else if (m.includes("スプレー") || m.includes("色塗り")) colorClass = "memo-color-4"; // オレンジ
            else colorClass = "memo-color-5"; // 紫（その他）
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
        
        // クリックでその時間にジャンプ
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

    // 再生位置に合わせて光らせる関数
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

/**
 * 【モニター画面用】01-screen.html / 02-screen.html で使用
 * 背景色変更、巨大文字、準備中アニメーションを制御
 */
function updateMonitorUI(currentTime, data, elements) {
    const { lyricsEl, actionEl, nameEl, container } = elements;
    let lastMemoIndex = -1;
    let currentLyrics = "";
    
    // データの解析
    const dataSec = data.map(d => ({s: toSeconds(d[0]), l: d[1], m: d[2]}));
    
    for (let i = 0; i < dataSec.length; i++) {
        if (currentTime >= dataSec[i].s) {
            currentLyrics = dataSec[i].l;
            if (dataSec[i].m && dataSec[i].m.trim() !== "") lastMemoIndex = i;
        } else break;
    }

    // 歌詞の更新
    if (lyricsEl) lyricsEl.innerText = currentLyrics || "";

    // メモに基づくアクションと背景の更新
    if (lastMemoIndex !== -1) {
        let memo = dataSec[lastMemoIndex].m;
        let parts = memo.split(/[、]/);
        let action = parts[0] || "";
        let names = (parts[1] || "").replace(/・/g, '\n');
        let isPrep = action.includes("準備");

        if (actionEl) actionEl.innerText = action;
        if (nameEl) nameEl.innerText = names;

        // 準備中クラスの切り替え
        if (container) {
            if (isPrep) container.classList.add('is-prep');
            else container.classList.remove('is-prep');
        }

        // 背景色判定
        let base = "purple";
        if (memo.includes("大字") || memo.includes("書く") || memo.includes("はがす")) base = "red";
        else if (memo.includes("色") || memo.includes("入場") || memo.includes("退場")) base = "blue";
        else if (memo.includes("文字") || memo.includes("絵") || memo.includes("板")) base = "green";
        else if (memo.includes("スプレー") || memo.includes("色塗り")) base = "orange";
        
        document.body.className = "monitor-body bg-" + base + (isPrep ? "-prep" : "");
    }
}
