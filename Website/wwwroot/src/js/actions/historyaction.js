var HistoryAction = (function () {
    function HistoryAction(url) {
        var state = cystem.page.getState();
        history.pushState(state, '', url);
        history.state;
    }
    HistoryAction.reloadState = function () {
        history.replaceState(cystem.page.getState(), '');
    };
    return HistoryAction;
}());
//# sourceMappingURL=historyaction.js.map