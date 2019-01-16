var Action = (function () {
    function Action(method, url, data, $source, actionResult) {
        this._readyStack = [];
        this.method = method;
        this.url = url;
        this.data = data;
        this.actionResult = actionResult || ActionResult.DISPLAY;
        this.setSource($source);
    }
    Action.prototype.setSource = function ($source) {
        this.$source = $source || undefined;
        var $target;
        if (this.hasSource()) {
            var target = this.$source.data('target');
            $target = target ? $(target) : undefined;
            if (!($target && $target.length)) {
                $target = this.$source.closest('.content-wrapper');
            }
            if (!($target && $target.length)) {
                $target = undefined;
            }
        }
        this.$target = $target || $('.content-wrapper.main-content');
        this.$oldContent = this.$target.find('.content');
        this.$newContent = undefined;
    };
    Action.prototype.hasSource = function () {
        return !!(this.$source && this.$source.length);
    };
    Action.prototype.hasTarget = function () {
        return !!(this.$target && this.$target.length);
    };
    Action.prototype.hasOldContent = function () {
        return !!(this.$oldContent && this.$oldContent.length);
    };
    Action.prototype.hasNewContent = function () {
        return !!(this.$newContent && this.$newContent.length);
    };
    Action.prototype.onReady = function (fn) {
        this._readyStack.push(fn);
    };
    Action.prototype.ready = function () {
        this.onReady = function (fn) {
            fn();
        };
        this._readyStack.forEach(function (fn) { fn(); });
    };
    return Action;
}());
//# sourceMappingURL=action.js.map