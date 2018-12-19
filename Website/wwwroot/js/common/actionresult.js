var ActionResult = new (function () {
    this.DISPLAY = 'display';
    this.LOAD = 'load';
    this.RELOAD = 'reload';
    this.OVERLAY = 'overlay';
    this.POPUP = 'popup';
    this.CLOSE = 'close';
    this.NONE = 'none';

    this.get = function (actionResult) {

        switch (actionResult) {
            case ActionResult.DISPLAY: return ActionResult.DISPLAY;
            case ActionResult.LOAD: return ActionResult.LOAD;
            case ActionResult.RELOAD: return ActionResult.RELOAD;
            case ActionResult.OVERLAY: return ActionResult.OVERLAY;
            case ActionResult.POPUP: return ActionResult.POPUP;
            case ActionResult.CLOSE: return ActionResult.CLOSE;
            case ActionResult.NONE: return ActionResult.NONE;
            default: console.log('Invalid action result for:', $el);
        }
    };
});