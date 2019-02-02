var PopstateAction = (function () {
    function PopstateAction() {
        var self = this;
        window.onpopstate = function (e) { self.onPopState.call(self, e); };
    }
    PopstateAction.prototype.onPopState = function (event) {
        var state = event.state || {};
        cystem.page.setState(state);
    };
    return PopstateAction;
}());
//# sourceMappingURL=popstateaction.js.map