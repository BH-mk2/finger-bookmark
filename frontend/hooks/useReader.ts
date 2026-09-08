import { useState } from "react";
import { Finger, ReaderState } from "../types/reader";

export function useReader() {
    const [state, setState] = useState<ReaderState>({
        panes: [{ id: "pane-1", currentPageNumber: 1 }],
        fingers: [],
        bookmarks: [],
        activePaneId: "pane-1",
    });

    // 1. ページをめくる（UC-1）
    const turnPage = (delta: number) => {
        setState((prevState) => {
            const newPanes = prevState.panes.map((pane) => {
                if (pane.id == prevState.activePaneId) {
                    // ページ番号が１未満にならないようにガード
                    const newPage = Math.max(1, pane.currentPageNumber + delta);
                    return { ...pane, currentPageNumber: newPage };
                }
                return pane;
            })
            return { ...prevState, panes: newPanes };
        });
    };

    // 2. 指を挟む（UC-2）
    const addFinger = () => {
        setState((prevState) => {
            const activePane = prevState.panes.find((p) => p.id == prevState.activePaneId);
            if (!activePane) return prevState;

            const newFinger: Finger = {
                id: `finger-${Date.now()}`,
                pageNumber: activePane.currentPageNumber,
            };
            return { ...prevState, fingers: [...prevState.fingers, newFinger] };
        });
    };

    // 3. 挟んでいる指のページに戻る（UC-3）
    const jumpToFinger = (fingerId: string) => {
        setState((prevState) => {
            const targetFinger = prevState.fingers.find((f) => f.id == fingerId);
            if (!targetFinger) return prevState;

            const newPanes = prevState.panes.map((pane) => {
                if (pane.id == prevState.activePaneId) {
                    return { ...pane, currentPageNumber: targetFinger.pageNumber };
                }
                return pane;
            });
            return { ...prevState, panes: newPanes };
        });
    };

    return {
        state,
        turnPage,
        addFinger,
        jumpToFinger,
    };
}