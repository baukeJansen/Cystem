class HistoryAction {
    constructor(url, state) {
        history.pushState(state, "", url);
    }
}