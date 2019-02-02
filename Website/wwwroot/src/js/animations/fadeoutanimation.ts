class FadeOutAnimation {
    constructor($wrapper: JQuery, $content: JQuery, fnReady?: Function) {
        $wrapper.css({ height: $content.outerHeight() });
        $content.addClass('fade-out');

        setTimeout(function () {
            if (fnReady) {
                fnReady();
            }
        }, 500);
    }
}