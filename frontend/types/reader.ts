// 1. ペイン（画面上の分割表示領域）
export interface Pane {
    id: string;
    currentPageNumber: number;
}

// 2. 指（一時キープしたページ）
export interface Finger {
    id: string;
    pageNumber: number;
}

// 3. しおり（恒久的な名前付き付箋）
export interface Bookmark {
    id: string;
    pageNumber: number;
    title: string;
}

// 4. アプリ全体のリポジトリ（全体状態）
export interface ReaderState {
    panes: Pane[];
    fingers: Finger[];
    bookmarks: Bookmark[];
    activePaneId: string;
}