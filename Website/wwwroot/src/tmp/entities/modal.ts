import { inject, injectable, named } from "../../../../../node_modules/inversify/dts/inversify";
import { IModal } from "../interfaces/index";

export class Modal implements IModal {
    private $modal: JQuery;

    constructor(cystem: any, $: JQuery) {
        //cystem.register("Modal", modalHelper, this.init);
    }

    init(el: HTMLElement) : void {
        if (!this.$modal) {
            this.$modal = $(el).find('#modal');
            this.$modal.modal({
                onCloseEnd: function () { console.log(self); /*self.onClose();*/ }
            });
        }
    }

    open() : void {
        this.$modal.modal('open');
    }

    setContent(modalContent: string) : void {
        var $content: JQuery = $(modalContent);
        this.$modal.find('.content-wrapper').append($content);
    }

    onClose() : void {
        this.$modal.find('.content-wrapper').children().remove();
    }

    test(): void {
        console.log('test confirmed');
    }
}

/*(function (global, $) {
    var modalHelper, $modal;

    var ModalHelper = function () {
    };

    ModalHelper.prototype.init = function (el: HTMLElement) {
        var self = this;
        1
        if (!$modal) {
            $modal = $(el).find('#modal');
            $modal.modal({
                onCloseEnd: function () { console.log(self); /*self.onClose();* }
            });
        }
    };

    ModalHelper.prototype.open = function () {
        $modal.modal('open');
    };

    ModalHelper.prototype.setContent = function (modalContent: string) {
        var $content = $(modalContent);
        $modal.find('.content-wrapper').append($content);
    };

    ModalHelper.prototype.onClose = function () {
        $modal.find('.content-wrapper').children().remove();
    };

    modalHelper = new ModalHelper();

    global.Cystem.register("Modal", modalHelper, modalHelper.init);
})(this, jQuery);*/