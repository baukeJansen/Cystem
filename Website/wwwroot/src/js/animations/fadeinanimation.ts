class FadeInAnimation {
    constructor($wrapper: JQuery, $content: JQuery, fnReady?: Function) {
        $content.addClass('fade-in');
        $wrapper.css({ height: $content.outerHeight() });

        setTimeout(function () {
            $content.removeClass('fade-in');
            $wrapper.css({ height: 'auto' });

            if (fnReady) {
                fnReady();
            }
        }, 300);
    }
}