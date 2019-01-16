(function (global, $) {
    var overlays = [], overlayHelper, $body, $window, $overlayTemplate;

    var Overlay = function () {
        var self = this;
        this.$overlay = $overlayTemplate.clone();

        var $closeButton = this.$overlay.find('.close');

        $closeButton.click(function () { self.close(); });
        this.$overlay.click(function (e) {
            var $target = $(e.target);

            if ($target.hasClass('overlay-wrapper')) {
                self.close();
            }
        });

        this.open();
    };

    Overlay.prototype.open = function () {
        var self = this;
        overlayHelper._moveParents(this, 'left');

        this.$overlay.removeClass('hide');
        this.$overlay.addClass('fade');

        $body.append(this.$overlay);

        setTimeout(function () {
            self.$overlay.removeClass('fade');
        }, 50);
    };

    Overlay.prototype.setContent = function (overlayContent) {
        var $overlayContent = $(overlayContent);
        var $contentWrapper = this.$overlay.find('.content-wrapper');
        $contentWrapper.append($overlayContent);
        global.Cystem.init(this.$overlay[0]);
    };

    Overlay.prototype.close = function () {
        var self = this;
        if (this.$overlay.hasClass('fade')) return;

        this.$overlay.addClass('fade');
        overlayHelper._moveParents(this, 'right');
        overlayHelper._reloadParent(this);

        setTimeout(function () {
            self.$overlay.remove();
        }, 400);
    };

    var OverlayHelper = function () {
        $window = $(global);
        $body = $('body');
    };

    OverlayHelper.prototype.init = function (el) {
        var $template = $body.find('.overlay-template');

        if ($template.length) {
            $overlayTemplate = $template;
            $overlayTemplate.removeClass('overlay-template');
            $overlayTemplate.detach();
        }
    };

    OverlayHelper.prototype.open = function () {
        var self = this;
        var overlay = new Overlay();
        overlays.push(overlay);
        return overlay;
    };

    OverlayHelper.prototype.close = function () {
        if (overlays.length) {
            overlayHelper = overlays.pop();
        }
        overlayHelper.close();
    };

    OverlayHelper.prototype._moveParents = function (overlay, direction) {
        $('.overlay-wrapper .content').not(overlay.$overlay).each(function (_, el) {
            var leftOffset = parseInt($(el).css('margin-left'));

            if (direction === 'left') {
                leftOffset -= $window.width() / 40;
            } else {
                leftOffset += $window.width() / 40;
            }
            $(el).css('margin-left', leftOffset);
        });
    };

    OverlayHelper.prototype._reloadParent = function (overlay) {

        var $overlayWrappers = $('.overlay-wrapper');
        var $content;

        if ($overlayWrappers.length > 1) {
            $content = $overlayWrappers.eq(-2).find('.content');
        } else {
            $content = $('.main-content .content');
        }

        global.Cystem.Navigate.reload($content);
    };

    overlayHelper = new OverlayHelper();

    global.Cystem.register("Overlay", overlayHelper, overlayHelper.init);
})(this, jQuery);