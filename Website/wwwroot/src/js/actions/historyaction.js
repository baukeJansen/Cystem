var HistoryAction = (function () {
    function HistoryAction(url, state) {
        history.pushState(state, "", url);
    }
    return HistoryAction;
}());
//# sourceMappingURL=historyaction.js.map