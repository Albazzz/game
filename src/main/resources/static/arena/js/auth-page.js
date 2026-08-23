/**
 * Trang /login — login/register bằng cùng một form, kèm Google Sign-In
 * và nút đăng nhập nhanh cho tài khoản demo (chỉ hiện khi seed đang bật).
 */
(function (global) {
    'use strict';

    var mode = 'login';
    var GOOGLE_LOAD_RETRIES = 20;

    function setMode(next) {
        mode = next;
        var nameField = document.querySelector('[data-name-field]');
        var submit = document.querySelector('[data-submit]');
        var password = document.getElementById('auth-password');

        nameField.hidden = mode !== 'register';
        nameField.querySelector('input').required = mode === 'register';
        submit.textContent = mode === 'register' ? 'Tạo tài khoản' : 'Đăng nhập';
        password.setAttribute('autocomplete',
            mode === 'register' ? 'new-password' : 'current-password');

        document.querySelectorAll('[data-tab]').forEach(function (button) {
            var active = button.getAttribute('data-tab') === mode;
            button.classList.toggle('btn--primary', active);
            button.classList.toggle('btn--ghost', !active);
        });
    }

    function redirectTarget() {
        var target = new URLSearchParams(global.location.search).get('redirect');
        // Chỉ cho phép redirect nội bộ để tránh open redirect.
        // Không quay lại endpoint nội bộ /error. Trường hợp error-dispatch bị chặn
        // trước login sẽ tạo redirect=/error và dẫn tới Whitelabel status 999.
        if (target && target.charAt(0) === '/' && target.charAt(1) !== '/'
            && target !== '/error' && target.indexOf('/error?') !== 0) {
            return target;
        }
        return '/games';
    }

    /** Google Identity Services trả credential = ID token, server tự verify. */
    function initGoogleSignIn(attempt) {
        var container = document.getElementById('googleBtnContainer');
        if (!container) {
            return;
        }
        var clientId = (document.body.dataset.googleClientId || '').trim();
        if (!clientId) {
            return;
        }
        var gsi = global.google && global.google.accounts && global.google.accounts.id;
        if (!gsi) {
            if (attempt < GOOGLE_LOAD_RETRIES) {
                global.setTimeout(function () {
                    initGoogleSignIn(attempt + 1);
                }, 150);
            } else {
                container.parentElement.hidden = true;
            }
            return;
        }

        gsi.initialize({
            client_id: clientId,
            auto_select: false,
            callback: function (response) {
                if (!response || !response.credential) {
                    global.ArenaToast.error('Google không trả về thông tin đăng nhập.');
                    return;
                }
                global.ArenaApi.googleLogin(response.credential)
                    .then(function () {
                        global.location.href = redirectTarget();
                    })
                    .catch(function (err) {
                        global.ArenaToast.error(err.message);
                    });
            }
        });
        gsi.renderButton(container, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'pill',
            width: Math.min(container.clientWidth || 360, 380)
        });
    }

    /** Nút demo: điền sẵn email/mật khẩu rồi login luôn, khỏi phải nhập tay. */
    function initQuickLogin() {
        var box = document.querySelector('[data-quick-login]');
        if (!box) {
            return;
        }
        var password = box.dataset.demoPassword || '';

        box.querySelectorAll('[data-quick-user]').forEach(function (button) {
            button.addEventListener('click', function () {
                var email = button.getAttribute('data-quick-user');

                setMode('login');
                var form = document.querySelector('[data-auth-form]');
                form.elements.email.value = email;
                form.elements.password.value = password;

                box.querySelectorAll('[data-quick-user]').forEach(function (other) {
                    other.disabled = true;
                });
                global.ArenaApi.login(email, password)
                    .then(function () {
                        global.location.href = redirectTarget();
                    })
                    .catch(function (err) {
                        box.querySelectorAll('[data-quick-user]').forEach(function (other) {
                            other.disabled = false;
                        });
                        global.ArenaToast.error(err.message);
                    });
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setMode('login');
        initGoogleSignIn(0);
        initQuickLogin();

        document.querySelectorAll('[data-tab]').forEach(function (button) {
            button.addEventListener('click', function () {
                setMode(button.getAttribute('data-tab'));
            });
        });

        var form = document.querySelector('[data-auth-form]');
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var submit = form.querySelector('[data-submit]');
            submit.disabled = true;

            var email = form.elements.email.value.trim();
            var password = form.elements.password.value;
            var request = mode === 'register'
                ? global.ArenaApi.register(email, password, form.elements.fullName.value.trim())
                : global.ArenaApi.login(email, password);

            request.then(function () {
                global.location.href = redirectTarget();
            }).catch(function (err) {
                submit.disabled = false;
                global.ArenaToast.error(err.message);
            });
        });
    });
})(window);
