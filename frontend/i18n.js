const translations = {
    en: {
        "title-index": "Select Your Fruit - Pass Apple",
        "title-apple": "Sleek Sketch - White on Black",
        "about-app": "About this app",
        "select-fruit": "Select a Fruit",
        "choose-canvas": "Choose your canvas to start drawing",
        "fruit-apple": "Apple",
        "fruit-maron": "Maron",
        "fruit-radish": "Radish",
        "fruit-watermelon": "Watermelon",
        "brush-size": "Size",
        "undo": "Undo",
        "redo": "Redo",
        "clear": "Clear",
        "save": "Save",
        "back": "Back",
        "hint": "Draw with finger or mouse",
        "processing": "Processing Image...",
        "result-title": "Processed Result",
        "download": "Download Result",
        "saving": "Saving...",
        "error-no-path": "Saved to server successfully, but no return path found!",
        "error-save": "Error saving to server.",
        "lang-en": "EN",
        "lang-ja": "JA"
    },
    ja: {
        "title-index": "フルーツを選択 - パスアップル",
        "title-apple": "お絵描き - 黒背景に白",
        "about-app": "このアプリについて",
        "select-fruit": "フルーツを選択",
        "choose-canvas": "キャンバスを選んで描画を開始しましょう",
        "fruit-apple": "りんご",
        "fruit-maron": "くり",
        "fruit-radish": "だいこん",
        "fruit-watermelon": "すいか",
        "brush-size": "サイズ",
        "undo": "元に戻す",
        "redo": "やり直し",
        "clear": "全消去",
        "save": "保存",
        "back": "戻る",
        "hint": "指やマウスで描いてください",
        "processing": "画像を処理中...",
        "result-title": "処理結果",
        "download": "結果をダウンロード",
        "saving": "保存中...",
        "error-no-path": "サーバーに保存されましたが、返却パスが見つかりませんでした！",
        "error-save": "サーバーへの保存中にエラーが発生しました。",
        "lang-en": "英語",
        "lang-ja": "日本語"
    }
};

let currentLang = localStorage.getItem('language') || (navigator.language.startsWith('ja') ? 'ja' : 'en');

function t(key) {
    return translations[currentLang][key] || key;
}

function updateContent() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translation = t(key);
        if (el.tagName === 'INPUT' && (el.type === 'button' || el.type === 'submit')) {
            el.value = translation;
        } else if (el.tagName === 'IMG') {
            el.alt = translation;
        } else {
            el.textContent = translation;
        }
    });

    // Update document title if applicable
    if (document.body.dataset.pageTitle) {
        document.title = t(document.body.dataset.pageTitle);
    }
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('language', lang);
    updateContent();
}

function initI18n() {
    updateContent();
}

// Export for main.js to use
window.i18n = {
    t,
    setLanguage,
    currentLang: () => currentLang
};

document.addEventListener('DOMContentLoaded', initI18n);
