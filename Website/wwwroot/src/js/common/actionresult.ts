enum ActionResult {
    DISPLAY = 'display',
    LOAD = 'load',
    RELOAD = 'reload',
    OVERLAY = 'overlay',
    MODAL = 'popup',
    CLOSE = 'close',
    NONE = 'none',

    /*this.get = function (actionResult) {

        switch (actionResult) {
            case ActionResult.DISPLAY: return ActionResult.DISPLAY;
            case ActionResult.LOAD: return ActionResult.LOAD;
            case ActionResult.RELOAD: return ActionResult.RELOAD;
            case ActionResult.OVERLAY: return ActionResult.OVERLAY;
            case ActionResult.MODAL: return ActionResult.MODAL;
            case ActionResult.CLOSE: return ActionResult.CLOSE;
            case ActionResult.NONE: return ActionResult.NONE;
            default: console.log('Invalid action result for:', $el);
        }
    };*/
}