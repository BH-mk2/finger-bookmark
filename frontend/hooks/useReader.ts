import { useState } from "react";
import { Pane, Finger, ReaderState } from "../types/reader";

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

    // 4. ペインを追加する（マルチペイン対応）
    const addPane = () => {
        setState((prevState) => {
            const newPaneId = `pane-${Date.now()}`;
            const activePane = prevState.panes.find((p) => p.id == prevState.activePaneId);
            const initialPage = activePane ? activePane.currentPageNumber : 1;

            const newPane: Pane = {
                id: newPaneId,
                currentPageNumber: initialPage,
            };

            return {
                ...prevState,
                panes: [...prevState.panes, newPane],
                activePaneId: newPaneId,
            };
        });
    };

    // 5. ペインを削除する（最低１つは維持）
    const removePane = (paneId: string) => {
        setState((prevState) => {
            if (prevState.panes.length <= 1) return prevState;

            const newPanes = prevState.panes.filter((p) => p.id != paneId);
            const newActiveId = prevState.activePaneId == paneId ? newPanes[0].id : prevState.activePaneId;

            return {
                ...prevState,
                panes: newPanes,
                activePaneId: newActiveId,
            };
        });
    };

    // 6. 操作対象のペインを選択・切替する
    const selectPane = (paneId: string) => {
        setState((prevState) => {
            const targetPane = prevState.panes.find((p) => p.id == paneId);
            if (!targetPane) return prevState;

            return {
                ...prevState,
                activePaneId: paneId,
            };
        });
    };

    return {
        state,
        turnPage,
        addFinger,
        jumpToFinger,
        addPane,
        removePane,
        selectPane,
    };
}