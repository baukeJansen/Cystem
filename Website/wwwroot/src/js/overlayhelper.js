var OverlayHelper = (function () {
    function OverlayHelper() {
        this._overlays = [];
    }
    OverlayHelper.prototype.bind = function (el) {
        var $template = this.$body.find('.overlay-template');
        if ($template.length) {
            this.$overlayTemplate = $template;
            this.$overlayTemplate.removeClass('overlay-template');
            this.$overlayTemplate.detach();
        }
    };
    OverlayHelper.prototype.open = function () {
    };
    OverlayHelper.prototype.setContent = function (content) {
    };
    OverlayHelper.prototype.close = function () {
        if (this._overlays.length) {
            var overlay = this._overlays.pop();
            overlay.close();
        }
    };
    OverlayHelper.prototype.moveParents = function (overlay, direction) {
        var self = this;
        $('.overlay-wrapper .content').not(overlay.$overlay).each(function (_, el) {
            var leftOffset = parseInt($(el).css('margin-left'));
            if (direction === 'left') {
                leftOffset -= self.$window.width() / 40;
            }
            else {
                leftOffset += self.$window.width() / 40;
            }
            $(el).css('margin-left', leftOffset);
        });
    };
    OverlayHelper.prototype.reloadParent = function (overlay) {
        var $overlayWrappers = $('.overlay-wrapper');
        var $content;
        if ($overlayWrappers.length > 1) {
            $content = $overlayWrappers.eq(-2).find('.content');
        }
        else {
            $content = $('.main-content .content');
        }
    };
    return OverlayHelper;
}());
//# sourceMappingURL=overlayhelper.js.map