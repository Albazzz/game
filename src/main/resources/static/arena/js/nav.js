/** Nav: hiển thị user hiện tại + logout. */
(function (global) {
    'use strict';

    function initials(name) {
        if (!name) {
            return '?';
        }
        var parts = String(name).trim().split(/\s+/);
        var first = parts[0].charAt(0);
        var last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
        return (first + last).toUpperCase();
    }

    function render(user) {
        var nameEl = document.querySelector('[data-arena-user-name]');
        var avatarEl = document.querySelector('[data-arena-user-avatar]');
        if (nameEl) {
            nameEl.textContent = user.fullName || user.email;
        }
        if (avatarEl) {
            if (user.avatar) {
                var img = document.createElement('img');
                img.src = user.avatar;
                img.alt = '';
                avatarEl.innerHTML = '';
                avatarEl.appendChild(img);
            } else {
                avatarEl.textContent = initials(user.fullName || user.email);
            }
        }
        global.ArenaCurrentUser = user;
        document.dispatchEvent(new CustomEvent('arena:user', { detail: user }));
    }

    document.addEventListener('DOMContentLoaded', function () {
        var container = document.querySelector('[data-arena-user]');
        if (container) {
            global.ArenaApi.me().then(render).catch(function () {
                var nameEl = document.querySelector('[data-arena-user-name]');
                if (nameEl) {
                    nameEl.textContent = 'Khách';
                }
            });
        }

        var logout = document.querySelector('[data-arena-logout]');
        if (logout) {
            logout.addEventListener('click', function () {
                global.ArenaApi.logout().then(function () {
                    global.location.href = '/login';
                });
            });
        }
    });
})(window);
