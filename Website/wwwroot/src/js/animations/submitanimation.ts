class SubmitAnimation {
    constructor($wrapper: JQuery, $content: JQuery, fnReady?: Function) {
        $wrapper.css({ width: $wrapper.outerWidth(), height: $wrapper.outerHeight() });
        $wrapper.addClass('loading');

        $content.addClass('send');

        setTimeout(function () {
            $content.remove();

            if (fnReady) {
                fnReady();
            }
        }, 1000);
    }
}