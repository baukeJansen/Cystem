(function (global, $) {
    var overlay;
    var $body = $('body');
    var $window = $(global);

    var Overlay = function () {

    };

    Overlay.prototype.init = function (el) {

    };

    Overlay.prototype.open = function (overlayWrapper) {
        var self = this;
        var $overlayWrapper = $(overlayWrapper);
        var $closeButton = $overlayWrapper.find('.close');
        var $background = $overlayWrapper;

        $closeButton.click(function () { self.close($overlayWrapper); });

        $background.click(function (e) {
            var $target = $(e.target);

            if ($target.hasClass('overlay-wrapper')) {
                self.close($overlayWrapper);
            }
        });

        this._moveParents($overlayWrapper, 'left');

        $overlayWrapper.addClass('fade');

        $body.append($overlayWrapper);
        global.Cystem.init($overlayWrapper[0]);

        setTimeout(function () {
            $overlayWrapper.removeClass('fade');
        }, 50);

        return $overlayWrapper;
    };

    Overlay.prototype.close = function ($overlayWrapper) {
        if ($overlayWrapper.hasClass('fade')) return;

        $overlayWrapper.addClass('fade');
        this._moveParents($overlayWrapper, 'right');
        this._reloadParent($overlayWrapper);

        setTimeout(function () {
            $overlayWrapper.remove();
        }, 400);
    };

    Overlay.prototype._moveParents = function ($overlayWrapper, direction) {
        $('.overlay-wrapper .content').not($overlayWrapper).each(function (_, el) {
            var leftOffset = parseInt($(el).css('margin-left'));

            if (direction === 'left') {
                leftOffset -= $window.width() / 40;
            } else {
                leftOffset += $window.width() / 40;
            }
            $(el).css('margin-left', leftOffset);
        });
    };

    Overlay.prototype._reloadParent = function ($overlayWrapper) {

        var $overlayWrappers = $('.overlay-wrapper');
        var $content;

        if ($overlayWrappers.length > 1) {
            $content = $overlayWrappers.eq(-2).find('.content');
        } else {
            $content = $('.main-content .content');
        }

        global.Cystem.Navigate.reload($content);
    };

    overlay = new Overlay();

    global.Cystem.register("Overlay", overlay, overlay.init);
})(this, jQuery);