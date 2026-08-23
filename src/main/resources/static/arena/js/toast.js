/**
 * Toast + modal helpers. Không dùng alert() (p1.md §13).
 * Tự tạo stack container nếu trang chưa có.
 */
(function (global) {
    'use strict';

    var stack = null;

    function ensureStack() {
        if (stack && document.body.contains(stack)) {
            return stack;
        }
        stack = document.querySelector('.toast-stack');
        if (!stack) {
            stack = document.createElement('div');
            stack.className = 'toast-stack';
            stack.setAttribute('role', 'status');
            stack.setAttribute('aria-live', 'polite');
            document.body.appendChild(stack);
        }
        return stack;
    }

    function show(message, variant, timeoutMs) {
        if (!message) {
            return;
        }
        var host = ensureStack();
        var el = document.createElement('div');
        el.className = 'toast toast--' + (variant || 'info');
        // textContent để tránh XSS từ message của server.
        el.textContent = String(message);
        host.appendChild(el);

        var ttl = typeof timeoutMs === 'number' ? timeoutMs : 3600;
        var timer = global.setTimeout(function () {
            el.classList.add('is-leaving');
            global.setTimeout(function () {
                if (el.parentNode) {
                    el.parentNode.removeChild(el);
                }
            }, 200);
        }, ttl);

        el.addEventListener('click', function () {
            global.clearTimeout(timer);
            if (el.parentNode) {
                el.parentNode.removeChild(el);
            }
        });
    }

    global.ArenaToast = {
        info: function (msg) { show(msg, 'info'); },
        success: function (msg) { show(msg, 'success'); },
        error: function (msg) { show(msg, 'error', 5000); },
        show: show
    };
})(window);
