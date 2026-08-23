/** Trang /games: stats, tạo phòng, join bằng mã, chơi nhanh. */
(function (global) {
    'use strict';

    var STATS_INTERVAL_MS = 10000;
    var statsTimer = null;

    function loadStats() {
        return global.ArenaApi.lobbyStats().then(function (stats) {
            var online = document.querySelector('[data-stat-online]');
            var rooms = document.querySelector('[data-stat-rooms]');
            if (online) {
                online.textContent = stats.onlinePlayers;
            }
            if (rooms) {
                rooms.textContent = stats.activeRooms;
            }
        }).catch(function () {
            /* stats không critical, bỏ qua lỗi */
        });
    }

    function goToRoom(state) {
        global.location.href = '/games/room/' + encodeURIComponent(state.roomId);
    }

    function createRoom(gameType, button) {
        button.disabled = true;
        global.ArenaApi.createRoom({ gameType: gameType, visibility: 'PUBLIC' })
            .then(goToRoom)
            .catch(function (err) {
                button.disabled = false;
                global.ArenaToast.error(err.message);
            });
    }

    function createSolo(gameType, button) {
        if (gameType === 'CANNON_BATTLE') {
            global.location.href = '/games/air-defense';
            return;
        }
        button.disabled = true;
        global.ArenaApi.createMemorySolo({})
            .then(function (state) {
                global.location.href = '/games/memory/' + encodeURIComponent(state.sessionId);
            })
            .catch(function (err) {
                button.disabled = false;
                global.ArenaToast.error(err.message);
            });
    }

    function bind() {
        document.querySelectorAll('[data-create-room]').forEach(function (button) {
            button.addEventListener('click', function () {
                createRoom(button.getAttribute('data-create-room'), button);
            });
        });

        document.querySelectorAll('[data-solo-game]').forEach(function (button) {
            button.addEventListener('click', function () {
                createSolo(button.getAttribute('data-solo-game'), button);
            });
        });

        var joinForm = document.querySelector('[data-join-form]');
        if (joinForm) {
            joinForm.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = joinForm.querySelector('input[name="roomCode"]');
                var code = (input.value || '').trim();
                if (!code) {
                    global.ArenaToast.error('Vui lòng nhập mã phòng');
                    input.focus();
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

        var quickPlay = document.querySelector('[data-quick-play]');
        if (quickPlay) {
            quickPlay.addEventListener('click', function () {
                quickPlay.disabled = true;
                global.ArenaApi.lobbyRooms().then(function (rooms) {
                    var open = rooms.filter(function (room) {
                        return room.status === 'WAITING' && room.playerCount < room.maxPlayers;
                    });
                    if (!open.length) {
                        global.ArenaToast.info('Chưa có phòng công khai — hãy tạo phòng mới');
                        global.location.href = '/games/lobby';
                        return;
                    }
                    return global.ArenaApi.joinRoom(open[0].roomId).then(goToRoom);
                }).catch(function (err) {
                    quickPlay.disabled = false;
                    global.ArenaToast.error(err.message);
                });
            });
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        bind();
        loadStats();
        statsTimer = global.setInterval(loadStats, STATS_INTERVAL_MS);
    });

    global.addEventListener('beforeunload', function () {
        if (statsTimer) {
            global.clearInterval(statsTimer);
            statsTimer = null;
        }
    });
})(window);
