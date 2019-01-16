var ModalHelper = (function () {
    function ModalHelper() {
        this.Name = ServiceName.ModalHelper;
    }
    ModalHelper.prototype.construct = function (serviceManager) {
        this._serviceManager = serviceManager;
    };
    ModalHelper.prototype.bind = function (el) {
        var self = this;
        if (!(this.$modal && this.$modal.length)) {
            this.$modal = $(el).find('#modal');
            this.$modal.modal({
                onCloseEnd: function () { self.onClose(); }
            });
        }
    };
    ModalHelper.prototype.open = function ($button) {
        this.$button = $button;
        this.$modal.modal('open');
        return this;
    };
    ModalHelper.prototype.setContent = function (content) {
        var $content = $(content);
        var $onAccept = this.$button.parent().find('.modal-accept');
        if ($onAccept.length) {
            var $acceptButton = $content.find('.accept-btn');
            $acceptButton.click(function () { $onAccept.click(); });
        }
        var $onDecline = this.$button.parent().find('.modal-decline');
        if ($onDecline.length) {
            var $declineButton = $content.find('.decline-btn');
            $declineButton.click(function () { $onDecline.click(); });
        }
        this.$modal.append($content);
    };
    ModalHelper.prototype.onClose = function () {
        this.$modal.children().remove();
    };
    ;
    return ModalHelper;
}());
//# sourceMappingURL=modalhelper.js.map