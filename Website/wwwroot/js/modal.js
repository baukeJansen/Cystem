(function (global, $) {
    var modalHelper, $body, $modal;

    var ModalHelper = function () {
        $body = $('body');
    };

    ModalHelper.prototype.init = function (el) {
        var self = this;
        $modal = $body.find('#modal');
        $modal.modal({
            onCloseEnd: function () { self.onClose(); }
        });
    };

    ModalHelper.prototype.open = function () {
        $modal.modal('open');
    };

    ModalHelper.prototype.setContent = function (modalContent) {
        var $content = $(modalContent);
        $modal.find('.content-wrapper').append($content);
    };

    ModalHelper.prototype.onClose = function () {
        $modal.find('.content-wrapper').children().remove();
    };

    modalHelper = new ModalHelper();

    global.Cystem.register("Overlay", modalHelper, modalHelper.init);
})(this, jQuery);