(function (global, $) {
    var navigate;
    var Navigate = function () {
    };

    Navigate.prototype.init = function (target) {
        var $target = $(target);
        var $getButton = $target.find('.ajax-get');
        var $postButton = $target.find('.ajax-post');
        var $putButton = $target.find('.ajax-put');
        var $deleteButton = $target.find('.ajax-delete');
        var $submitButton = $target.find('.ajax-submit');

        $getButton.click(function (e) {
            return navigate.get(navigate, e, $(this));
        });
        $postButton.click(function (e) {
            return navigate.post(navigate, e, $(this));
        });
        $putButton.click(function (e) {
            return navigate.put(navigate, e, $(this));
        });
        $deleteButton.click(function (e) {
            return navigate._delete(navigate, e, $(this));
        });
        $submitButton.click(function (e) {
            return navigate.submit(navigate, e, $(this));
        });

        window.onpopstate = navigate.onPopState;
    };

    Navigate.prototype.reload = function ($content) {
        var self = navigate;
        self.get(self, null, $content);
    };

    Navigate.prototype.get = function (self, event, $el) {
        var action = $el ? $el.data('on-result') : 'display';
        action = action ? action.toLowerCase() : 'display';

        var url = self._getUrl(self, $el);

        var data = {
            jsPage: true,
            overlay: action === 'overlay'
        };

        var o = self._beforeSend(self, $el);
        var state;
        if (state === undefined) { state = {}; }
        history.pushState(state, "", url);

        $.get(url, data).done(function (response) {
            o.response = response;
            self._done(self, $el, o);
        });

        return false;
    };

    Navigate.prototype.post = function (self, event, $el) {
        var url = self._getUrl(self, $el, true);
        var data = self._getPostaData(self, $el);
        var o = self._beforeSend(self, $el);

        $.post(url, data).done(function (response) {
            o.response = response;
            self._done(self, $el, o);
        });

        return false;
    };

    Navigate.prototype.put = function (self, event, $el) {
        var url = self._getUrl(self, $el, true);
        var data = self._getPostaData(self, $el);
        var o = self._beforeSend(self, $el);

        $.put(url, data).done(function (response) {
            o.response = response;
            self._done(self, $el, o);
        });

        return false;
    };

    Navigate.prototype._delete = function (self, event, $el) {
        var url = self._getUrl(self, $el, true);
        var data = self._getPostaData(self, $el);
        var o = self._beforeSend(self, $el);

        $.delete(url, data).done(function (response) {
            o.response = response;
            self._done(self, $el, o);
        });

        return false;
    };

    // Browser navigate => back or forward button
    Navigate.prototype.onPopState = function (event) {
        var self = navigate;
        var url = document.location;
        var state = event.state;

        var data = {
            jsPage: true
        };

        var o = self._beforeSend(self, null);

        $.get(url, data).done(function (response) {
            o.response = response;
            self._done(self, null, o);
        });
    };

    Navigate.prototype._beforeSend = function (self, $el) {
        var o = {};
        var action = $el ? $el.data('on-result') : 'display';
        action = action ? action.toLowerCase() : 'display';

        switch (action) {
            case 'display':
            case 'reload':
                if ($el) {
                    var wrapper = $el.data('target');

                    if (wrapper) {
                        o.$wrapper = $(wrapper);
                    }
                }
                o.$wrapper = o.$wrapper || $('.content-wrapper.main-content');
                o.$oldContent = o.$wrapper.find('.content');

                if (o.$oldContent.length) {
                    o.$wrapper.css({ height: o.$oldContent.outerHeight() });
                    o.$oldContent.addClass('fade-out');
                }

                o.onReady = function (fn) { o.readyStack.push(fn); };
                o.readyStack = [];

                setTimeout(function () {
                    o.onReady = function (fn) {
                        fn();
                    };
                    o.$oldContent.remove();
                    o.readyStack.forEach(function (fn) { fn(); });
                }, 50);

                break;
            case 'overlay':
                break;
            case 'popup':
                break;
            case 'close':
                break;
            case 'none':
            default:
                break;
        }

        return o;
    };

    Navigate.prototype.submit = function (self, event, $el) {
        var $form = $el.closest('form');
        var url = $form.attr('action');
        var method = $form.attr('method');
        var data = $form.serialize();

        var o = {};

        switch (method.toLowerCase()) {
            case 'get': $.get(url, data).done(function (response) {
                o.response = response;
                self._done(self, $el, o);
            }); break;
            default:
            case 'post': $.post(url, data).done(function (response) {
                o.response = response;
                self._done(self, $el, o);
            }); break;
            case 'put': $.put(url, data).done(function (response) {
                o.response = response;
                self._done(self, $el, o);
            }); break;
            case 'delete': $.delete(url).done(function (response) {
                o.response = response;
                self._done(self, $el, o);
            }); break;
        }

        return false;
    };

    Navigate.prototype._done = function (self, $el, o) {
        var action = $el ? $el.data('on-result') : 'display';
        action = action ? action.toLowerCase() : 'display';

        switch (action.toLowerCase()) {

            case 'display':
            case 'reload':
                self._display(self, $el, o);
                break;
            case 'overlay':
                self._overlay(self, $el, o);
                break;
            case 'popup':
                break;
            case 'close':
                self._close(self, $el, o);
                break;
            case 'none':
            default:
                break;
        }
    };

    Navigate.prototype._display = function (self, $el, o) {
        var $wrapper = o.$wrapper;
        var response = o.response;
        var $newContent = $(response);
        $newContent.addClass('fade-in');

        o.onReady(function () {
            $wrapper.append($newContent);

            global.Cystem.init($newContent[0]);
            $wrapper.css({ height: $newContent.outerHeight() });

            setTimeout(function () {
                $newContent.removeClass('fade-in');
                $wrapper.css({ height: 'auto' });
            }, 30);

            
        });
    };

    Navigate.prototype._overlay = function (self, $el, o) {
        global.Cystem.Overlay.open(o.response);
    };

    Navigate.prototype._close = function (self, $el, o) {
        var $overlayWrapper = $el.closest('.overlay-wrapper');
        if ($overlayWrapper.length) {
            global.Cystem.Overlay.close($overlayWrapper);
        }
    };

    Navigate.prototype._getUrl = function (self, $el, removeParams) {
        var url;
        if ($el[0].hasAttribute('href')) {
            url = $el.attr('href');
        } else {
            url = $el.data('url');
        }

        if (removeParams) {
            return url.split('?')[0];
        } else {
            return url;
        }
    };

    Navigate.prototype._getPostaData = function (self, $el) {
        var data = {};

        var url = self._getUrl(self, $el).split('?');
        if (url.length > 1) {
            var paramString = url[1];
            var params = paramString.split('&');

            $.each(params, function (_, param) {
                var keyValuePair = param.split('=');

                if (keyValuePair.length === 2) {
                    data[keyValuePair[0]] = keyValuePair[1];
                }
            });
        }

        return data;
    };

    navigate = new Navigate();

    global.Cystem.register('Navigate', navigate, navigate.init);
})(this, jQuery);