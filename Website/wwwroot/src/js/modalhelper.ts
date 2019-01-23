/*class ModalHelper{
    Name: ServiceName = ServiceName.ModalHelper;
    private $modal: JQuery;

    private _serviceManager: IServiceManager;

    constructor() {
        
    }

    construct(serviceManager: IServiceManager) {
        this._serviceManager = serviceManager;
    }

    bind(el: HTMLElement) {
        var self = this;
        if (!(this.$modal && this.$modal.length)) {
            this.$modal = $(el).find('#modal');
            this.$modal.modal({
                inDuration: 100,
                outDuration: 100,
                onCloseEnd: function () { self.onClose(); }
            });
        }
    }

    open(): ModalHelper {
        this.$modal.modal('open');
        return this;
    }

    setContent(content: string): void {
        var $content = $(content);
        this.setJqueryContent($content);
    }

    setJqueryContent($content: JQuery): void {
        this.$modal.append($content);

        var cystem: Cystem = this._serviceManager.get(Cystem);
        cystem.bindNew($content[0]);
    }

    onClose(): void {
        this.$modal.children().remove();
    };
}*/