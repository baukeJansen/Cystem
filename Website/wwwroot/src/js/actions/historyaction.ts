class HistoryAction implements IAction {
    public constructor(url) {
        var state: object = cystem.page.getState();
        history.pushState(state, '', url);
        history.state;
    }

    public static reloadState() {
        history.replaceState(cystem.page.getState(), '');
    }
}