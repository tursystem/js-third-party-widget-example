/**
 * @author Sandor Turanszky <sandor.turanszky@gmail.com>
 * Date: 11.03.14
 * Time: 14:00
 */

(function (window, undefined) {
    'use strict';

    var jQuery,
        serverUrl       = 'http://localhost/jswidget/server/server.php',
        parentId        = 'widget_example',
        parentCss       = 'width: 200px; height: 30px; text-align: center;',
        log             = true;

    function loadScript(url, callback) {
        var pattern = new RegExp("jquery"),
            isJquery = pattern.test(url);

        if (isJquery) {
            if (window.jQuery === undefined || window.jQuery.fn.jquery !== '2.1.0') {
                if (log) {
                    console.log('we need to load jQuery ver: 2.1.0');
                }
            } else {
                jQuery = window.jQuery;
                callback();
                if (log) {
                    console.log('jQuery already exists on page');
                }
                return true;
            }
        }

        var script = document.createElement('script');
        script.async = true;
        script.src = url;

        var entry = document.getElementsByTagName('script')[0];
        entry.parentNode.insertBefore(script, entry);

        script.onload = script.onreadystatechange = function () {
            var rdyState = script.readyState;

            if (!rdyState || /complete|loaded/.test(script.readyState)) {
                if (log) {
                    console.log('File has been loaded: ' + url);
                }
                if (isJquery) {
                    jQuery = window.jQuery.noConflict();
                }

                callback();

                script.onload = null;
                script.onreadystatechange = null;
            }
        }
    }

    function loadStylesheet(url, callback) {
        loadStylesheetFile(url);

        var cssIsLoaded = document.createElement('span');
        cssIsLoaded.id = 'css-is-loaded';
        cssIsLoaded.style = 'color: #fff';
        document.body.insertBefore(cssIsLoaded, document.body.firstChild);

        (function poll() {
            var node = document.getElementById('css-is-loaded');
            var value;

            if(window.getComputedStyle) {
                value = document.defaultView
                    .getComputedStyle(cssIsLoaded, null)
                    .getPropertyValue('color');
            }
            else if (node.currentStyle) {
                value = node.currentStyle.color;
            }

            if (value && value === 'rgb(186, 218, 85)' || value.toLowerCase() === '#bada55') {
                if (log) {
                    console.log('Css sheet is loaded: ' + url);
                }
                document.body.removeChild(node);
                callback();
            } else {
                if (log) {
                    console.log('Continue to check if css is loaded');
                }
                setTimeout(poll, 500)
            }
        })()
    }

    function loadStylesheetFile(url) {
        var link    = document.createElement('link');
        link.rel    = 'stylesheet';
        link.type   = 'text/css';
        link.href   = url;

        var entry = document.getElementsByTagName('script')[0];
        entry.parentNode.insertBefore(link, entry);
    }

    function getWidgetParams() {
        var data = {};
        for (var i = 0; i < window._wep.length; i++) {
            data[window._wep[i][0]] = window._wep[i][1];
        }
        return data;
    }

    /**
     * Populate data object with additional data to be sent to server (widget params + additional data)
     * @returns {array}
     */
    function prepareData() {
        var data = getWidgetParams();
        data._url = window.location.href;
        return data;
    }

    function loadData() {
        jQuery.getJSON(serverUrl + '?callback=?', {data: prepareData()})
            .done(function (json) {
                renderWidget(json);
                if (log) {
                    console.log('Data loaded from server');
                }
            })
            .fail(function (jqxhr, textStatus, error) {
                var err = textStatus + ", " + error;
                if (log) {
                    console.log("Request Failed: " + err);
                }
            });
    }

    function createMainDiv(elem, callback) {
        var elem = document.createElement(elem);
        elem.id = parentId;
        elem.innerHTML = '<img src="img/ajax-loader.gif" class="ajax-loader"/>';
        elem.setAttribute('style', parentCss);
        document.body.insertBefore(elem, document.body.firstChild);
        callback();
        if (log) {
            console.log('Element has been added to body: ' + elem.id);
        }
    }

    function beforeRenderWidget(callback) {
        createMainDiv('div', function() {
            callback();
        })
    }

    function renderWidget(data) {
        var div = document.getElementById(parentId);
        div.innerHTML = data.html;
        document.body.insertBefore(div, document.body.firstChild);
        if (log) {
            console.log('Widget has been rendered: ' + data);
        }
    }

    function init() {
        beforeRenderWidget(function() {
            loadScript('js/vendor/jquery-2.1.0.min.js', function () {
                loadStylesheet('css/style.css', function() {
                    loadData();
                });
            });
        });
    }

    init();
})(window);

