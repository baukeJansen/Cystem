class ModalHelper{
    private $modal: JQuery;
    private $button: JQuery;

    bind(el: HTMLElement) {
        var self = this;
        if (!(this.$modal && this.$modal.length)) {
            this.$modal = $(el).find('#modal');
            this.$modal.modal({
                onCloseEnd: function () { self.onClose(); }
            });
        }
    }

    open($button: JQuery): ModalHelper {
        this.$button = $button;
        this.$modal.modal('open');
        return this;
    }

    setContent(content: string): void {
        var $content = $(content);

        // accept button after delete button as html doesnt allow nested anchors
        var $onAccept: JQuery = this.$button.parent().find('.modal-accept');
        if ($onAccept.length) {
            var $acceptButton: JQuery = $content.find('.accept-btn');
            $acceptButton.click(function () { $onAccept.click(); });
        }

        var $onDecline: JQuery = this.$button.parent().find('.modal-decline');
        if ($onDecline.length) {
            var $declineButton: JQuery = $content.find('.decline-btn');
            $declineButton.click(function () { $onDecline.click(); });
        }

        this.$modal.append($content);
    }

    onClose(): void {
        this.$modal.children().remove();
    };
}