var Modal = (function () {
    function Modal(cystem, $) {
    }
    Modal.prototype.init = function (el) {
        if (!this.$modal) {
            this.$modal = $(el).find('#modal');
            this.$modal.modal({
                onCloseEnd: function () { console.log(self); }
            });
        }
    };
    Modal.prototype.open = function () {
        this.$modal.modal('open');
    };
    Modal.prototype.setContent = function (modalContent) {
        var $content = $(modalContent);
        this.$modal.find('.content-wrapper').append($content);
    };
    Modal.prototype.onClose = function () {
        this.$modal.find('.content-wrapper').children().remove();
    };
    Modal.prototype.test = function () {
        console.log('test confirmed');
    };
    return Modal;
}());
export { Modal };
