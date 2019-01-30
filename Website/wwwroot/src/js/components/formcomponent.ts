class FormComponent {
    constructor(public $form: JQuery) {
        $form.data('component', this);
    }

    send(): void {
        this.$form.css({ width: this.$form.outerWidth(), height: this.$form.outerHeight() });
        this.$form.addClass('loading');

        var $content: JQuery = this.$form.find('> .form-content');
        $content.addClass('send');
    }

    succes(): void {
        this.$form.removeClass('loading').addClass('succes');
    }

    error(message: JQuery): void {
        this.$form.removeClass('loading').addClass('error');
        this.$form.empty().append($(message));
    }

    getMethod(): Method {
        var method: string = this.$form.attr('method').toLowerCase();

        var resultKey = method.toUpperCase() as keyof typeof Method;
        return Method[resultKey];
    }

    getUrl(): string {
        return this.$form.attr('action');
    }

    getData(): string {
        return this.$form.serialize();
    }
}