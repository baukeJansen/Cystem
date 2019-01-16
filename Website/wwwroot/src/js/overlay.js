var Overlay = (function () {
    function Overlay(serviceManager, helper) {
        var self = this;
        this._serviceManager = serviceManager;
        this._helper = helper;
        this.$overlay = helper.$overlayTemplate.clone();
        var $closeButton = this.$overlay.find('.close');
        $closeButton.click(function () { self.close(); });
        this.$overlay.click(function (e) {
            var $target = $(e.target);
            if ($target.hasClass('overlay-wrapper')) {
                self.close();
            }
        });
        this.open();
    }
    Overlay.prototype.open = function () {
        var self = this;
        this._helper.moveParents(this, 'left');
        this.$overlay.removeClass('hide');
        this.$overlay.addClass('fade');
        this._helper.$body.append(this.$overlay);
        setTimeout(function () {
            self.$overlay.removeClass('fade');
        }, 50);
        return this;
    };
    Overlay.prototype.setContent = function (overlayContent) {
        var $overlayContent = $(overlayContent);
        var $contentWrapper = this.$overlay.find('.content-wrapper');
        $contentWrapper.append($overlayContent);
        var cystem = this._serviceManager.get(Cystem);
        cystem.bindNew(this.$overlay[0]);
    };
    Overlay.prototype.close = function () {
        var self = this;
        if (this.$overlay.hasClass('fade'))
            return;
        this.$overlay.addClass('fade');
        this._helper.moveParents(this, 'right');
        this._helper.reloadParent(this);
        setTimeout(function () {
            self.$overlay.remove();
        }, 400);
    };
    return Overlay;
}());
//# sourceMappingURL=overlay.js.map