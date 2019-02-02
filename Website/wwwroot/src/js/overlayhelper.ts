class OverlayHelper {
    private $window: JQuery<Window>;
    private _overlays: Overlay2[] = [];
    $body: JQuery;
    $overlayTemplate: JQuery;

    bind(el: HTMLElement): void {
        var $template = this.$body.find('.overlay-template');

        if ($template.length) {
            this.$overlayTemplate = $template;
            this.$overlayTemplate.removeClass('overlay-template');
            this.$overlayTemplate.detach();
        }
    }

    open()/*: Overlay*/ {
        //var overlay = new Overlay(this._serviceManager, this);
        //this._overlays.push(overlay);
        //return overlay;
    }

    setContent(content: string): void {

    }

    close(): void {
        if (this._overlays.length) {
            var overlay: Overlay2 = this._overlays.pop();
            overlay.close();
        }
    }

    moveParents(overlay, direction): void {
        var self = this;
        $('.overlay-wrapper .content').not(overlay.$overlay).each(function (_, el) {
            var leftOffset = parseInt($(el).css('margin-left'));

            if (direction === 'left') {
                leftOffset -= self.$window.width() / 40;
            } else {
                leftOffset += self.$window.width() / 40;
            }
            $(el).css('margin-left', leftOffset);
        });
    }

    reloadParent(overlay): void {

        var $overlayWrappers = $('.overlay-wrapper');
        var $content;

        if ($overlayWrappers.length > 1) {
            $content = $overlayWrappers.eq(-2).find('.content');
        } else {
            $content = $('.main-content .content');
        }

        //var navigate: Navigate = this._serviceManager.get(Navigate);
        //navigate.reload($content);
    }
}