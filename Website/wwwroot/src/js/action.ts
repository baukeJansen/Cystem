class Action {
    private _readyStack: Function[] = [];
    method: string;
    url: string;
    data: any;
    response: string;
    actionResult: ComponentAction;
    $source: JQuery;
    $target: JQuery;
    $oldContent: JQuery;
    $newContent: JQuery;

    overlay: Overlay;
    modal: ModalHelper;

    constructor(method: string, url: string, data: any, $source: JQuery, actionResult: ComponentAction) {
        this.method = method;
        this.url = url;
        this.data = data;
        this.actionResult = actionResult || ComponentAction.LOAD;
        this.setSource($source);
    }

    setSource($source: JQuery): void {
        this.$source = $source || undefined;
        var $target;

        if (this.hasSource()) {
            var target = this.$source.data('target');
            $target = target ? $(target) : undefined;

            if (!($target && $target.length)) {
                $target = this.$source.closest('.component-wrapper');
            }

            if (!($target && $target.length)) {
                $target = undefined;
            }
        }

        this.$target = $target || $('.component-wrapper.main-component');
        this.$oldContent = this.$target.find('.component');
        this.$newContent = undefined;
    }

    hasSource(): boolean {
        return !!(this.$source && this.$source.length);
    }

    hasTarget(): boolean {
        return !!(this.$target && this.$target.length);
    }

    hasOldContent(): boolean {
        return !!(this.$oldContent && this.$oldContent.length);
    }

    hasNewContent(): boolean {
        return !!(this.$newContent && this.$newContent.length);
    }

    onReady (fn: Function): void {
        this._readyStack.push(fn);
    }

    ready(): void {
        this.onReady = function (fn: Function) {
            fn();
        };

        this._readyStack.forEach(function (fn: Function) { fn(); });
    }
}