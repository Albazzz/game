/** Trang /games: stats, tạo phòng, join bằng mã, chơi nhanh. */
(function (global) {
    'use strict';

    var STATS_INTERVAL_MS = 10000;
    var statsTimer = null;
    var airSoloButton = null;

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
        global.ArenaApi.createRoom({ gameType: gameType, visibility: 'PRIVATE' })
            .then(goToRoom)
            .catch(function (err) {
                button.disabled = false;
                global.ArenaToast.error(err.message);
            });
    }

    function createSolo(gameType, button) {
        if (gameType === 'CANNON_BATTLE') {
            openAirSolo(button);
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

    function openAirSolo(button) {
        var modal = document.querySelector('[data-air-solo-modal]');
        if (!modal) {
            return;
        }
        airSoloButton = button;
        modal.classList.remove('is-hidden');
        var first = modal.querySelector('select, input, button');
        if (first) {
            first.focus();
        }
    }

    function closeAirSolo() {
        var modal = document.querySelector('[data-air-solo-modal]');
        if (modal) {
            modal.classList.add('is-hidden');
        }
        if (airSoloButton) {
            airSoloButton.focus();
        }
        airSoloButton = null;
    }

    function bindAirSolo() {
        var modal = document.querySelector('[data-air-solo-modal]');
        var form = document.querySelector('[data-air-solo-form]');
        if (!modal || !form) {
            return;
        }
        modal.querySelector('[data-air-solo-close]').addEventListener('click', closeAirSolo);
        modal.addEventListener('click', function (event) {
            if (event.target === modal) {
                closeAirSolo();
            }
        });
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && !modal.classList.contains('is-hidden')) {
                closeAirSolo();
            } else if (event.key === 'Tab' && !modal.classList.contains('is-hidden')) {
                var focusable = Array.prototype.slice.call(modal.querySelectorAll(
                    'button:not([disabled]), select:not([disabled]), input:not([disabled])'));
                if (!focusable.length) {
                    return;
                }
                var first = focusable[0];
                var last = focusable[focusable.length - 1];
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            }
        });
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var submit = form.querySelector('button[type="submit"]');
            submit.disabled = true;
            var difficulty = form.elements.difficulty.value;
            var travelSeconds = difficulty === 'EASY' ? 18 : (difficulty === 'HARD' ? 10 : 14);
            var settings = {
                questionLevel: form.elements.questionLevel.value,
                answerMode: form.elements.answerMode.value,
                questionCount: parseInt(form.elements.questionCount.value, 10) || 10,
                secondsPerQuestion: travelSeconds,
                extra: {
                    objective: form.elements.objective.value,
                    difficulty: difficulty,
                    maxHp: 3,
                    targetScore: 10,
                    durationSeconds: 120
                }
            };
            global.ArenaApi.createAirDefenseSolo(settings).then(function (state) {
                global.location.href = '/games/air-defense/' + encodeURIComponent(state.sessionId);
            }).catch(function (err) {
                submit.disabled = false;
                global.ArenaToast.error(err.message);
            });
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
                // Chưa có matchmaking: vào phòng public đang chờ, nếu không có thì mở lobby.
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
        bindAirSolo();
        loadStats();
        statsTimer = global.setInterval(loadStats, STATS_INTERVAL_MS);
    });

    // Dọn timer khi rời trang để không leak.
    global.addEventListener('beforeunload', function () {
        if (statsTimer) {
            global.clearInterval(statsTimer);
            statsTimer = null;
        }
    });
})(window);
