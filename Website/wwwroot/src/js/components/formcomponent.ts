class FormComponent {
    constructor(public $form: JQuery) {
        $form.data('component', this);
    }

    send(): void {
        var $formContent: JQuery = this.$form.find('> .form-content');
        new SubmitAnimation(this.$form, $formContent)
    }

    succes(): void {
        this.$form.removeClass('loading').addClass('succes');
    }

    error(message: JQuery): void {
        this.$form.removeClass('loading').addClass('error');
        new FadeInAnimation(this.$form, message);
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