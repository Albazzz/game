/** Trang /games/lobby: tạo phòng, danh sách phòng public, join bằng mã. */
(function (global) {
    'use strict';

    var REFRESH_MS = 6000;
    var refreshTimer = null;

    function goToRoom(state) {
        global.location.href = '/games/room/' + encodeURIComponent(state.roomId);
    }

    function el(tag, className, text) {
        var node = document.createElement(tag);
        if (className) {
            node.className = className;
        }
        if (text !== undefined && text !== null) {
            node.textContent = text;
        }
        return node;
    }

    function renderRooms(rooms) {
        var host = document.querySelector('[data-room-list]');
        if (!host) {
            return;
        }
        host.innerHTML = '';

        if (!rooms.length) {
            var empty = el('div', 'state');
            empty.appendChild(el('p', null, 'Chưa có phòng công khai nào.'));
            empty.appendChild(el('p', null, 'Tạo phòng đầu tiên để bắt đầu.'));
            host.appendChild(empty);
            return;
        }

        rooms.forEach(function (room) {
            var row = el('div', 'info-row');
            var left = el('div');
            left.appendChild(el('div', 'info-row__value', room.gameDisplayName));
            left.appendChild(el('div', 'info-row__label',
                'Chủ phòng: ' + room.hostDisplayName + ' · Mã ' + room.roomCode));

            var right = el('div', null);
            right.style.display = 'flex';
            right.style.alignItems = 'center';
            right.style.gap = 'var(--sp-3)';
            right.appendChild(el('span', 'tag', room.playerCount + '/' + room.maxPlayers));

            var joinBtn = el('button', 'btn btn--primary', 'Vào');
            joinBtn.type = 'button';
            joinBtn.addEventListener('click', function () {
                joinBtn.disabled = true;
                global.ArenaApi.joinRoom(room.roomId)
                    .then(goToRoom)
                    .catch(function (err) {
                        joinBtn.disabled = false;
                        global.ArenaToast.error(err.message);
                    });
            });
            right.appendChild(joinBtn);

            row.appendChild(left);
            row.appendChild(right);
            host.appendChild(row);
        });
    }

    function loadRooms() {
        return global.ArenaApi.lobbyRooms()
            .then(renderRooms)
            .catch(function (err) {
                var host = document.querySelector('[data-room-list]');
                if (host) {
                    host.innerHTML = '';
                    var error = el('div', 'state');
                    error.appendChild(el('p', null, 'Không tải được danh sách phòng.'));
                    error.appendChild(el('p', 'info-row__label', err.message));
                    host.appendChild(error);
                }
            });
    }

    function loadGameOptions() {
        var select = document.querySelector('select[name="gameType"]');
        if (!select) {
            return Promise.resolve();
        }
        return global.ArenaApi.catalog().then(function (games) {
            select.innerHTML = '';
            games.forEach(function (game) {
                var option = document.createElement('option');
                option.value = game.gameType;
                option.textContent = game.displayName + ' (' +
                    game.minPlayers + '–' + game.maxPlayers + ' người)';
                select.appendChild(option);
            });
            // Ưu tiên game được chọn từ trang /games qua query param.
            var preset = new URLSearchParams(global.location.search).get('gameType');
            if (preset) {
                select.value = preset;
            }
        });
    }

    function bind() {
        var createForm = document.querySelector('[data-create-form]');
        if (createForm) {
            createForm.addEventListener('submit', function (event) {
                event.preventDefault();
                var submit = createForm.querySelector('button[type="submit"]');
                submit.disabled = true;
                global.ArenaApi.createRoom({
                    gameType: createForm.elements.gameType.value,
                    visibility: createForm.elements.visibility.value,
                    settings: { questionLevel: createForm.elements.questionLevel.value }
                }).then(goToRoom).catch(function (err) {
                    submit.disabled = false;
                    global.ArenaToast.error(err.message);
                });
            });
        }

        var joinForm = document.querySelector('[data-join-form]');
        if (joinForm) {
            joinForm.addEventListener('submit', function (event) {
                event.preventDefault();
                var code = (joinForm.elements.roomCode.value || '').trim();
                if (!code) {
                    global.ArenaToast.error('Vui lòng nhập mã phòng');
                    return;
                }
                var submit = joinForm.querySelector('button[type="submit"]');
                submit.disabled = true;
                global.ArenaApi.joinByCode(code)
                    .then(goToRoom)
                    .catch(function (err) {
                        submit.disabled = false;
                        global.ArenaToast.error(err.message);
                    });
            });
        }

        var refresh = document.querySelector('[data-refresh-rooms]');
        if (refresh) {
            refresh.addEventListener('click', loadRooms);
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        bind();
        loadGameOptions().catch(function (err) {
            global.ArenaToast.error(err.message);
        });
        loadRooms();
        refreshTimer = global.setInterval(loadRooms, REFRESH_MS);
    });

    global.addEventListener('beforeunload', function () {
        if (refreshTimer) {
            global.clearInterval(refreshTimer);
            refreshTimer = null;
        }
    });
})(window);
