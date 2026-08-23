/**
 * Trang phòng chờ: render slot, settings, countdown, reconnect.
 * Toàn bộ hành động đi qua WebSocket; server là nguồn sự thật duy nhất.
 */
(function (global) {
    'use strict';

    var STATUS_LABEL = {
        WAITING: 'Đang chờ',
        COUNTDOWN: 'Đếm ngược',
        IN_GAME: 'Đang chơi',
        FINISHED: 'Đã kết thúc',
        CLOSED: 'Đã đóng'
    };

    var MODE_LABEL = {
        KANJI_TO_HIRAGANA: 'Kanji → Hiragana',
        KANJI_TO_MEANING: 'Kanji → Nghĩa',
        HIRAGANA_TO_MEANING: 'Hiragana → Nghĩa',
        MEANING_TO_KANJI: 'Nghĩa → Kanji'
    };

    var store = null;
    var countdownTimer = null;
    var settingsDirty = false;
    var gameNavigationStarted = false;

    function $(selector) {
        return document.querySelector(selector);
    }

    function initials(name) {
        if (!name) {
            return '?';
        }
        var parts = String(name).trim().split(/\s+/);
        return (parts[0].charAt(0) + (parts.length > 1 ? parts[parts.length - 1].charAt(0) : ''))
            .toUpperCase();
    }

    // ---------------- Render: slots ----------------

    function buildSlot(player, state) {
        var node = document.createElement('div');
        var classes = ['slot'];

        if (!player) {
            classes.push('slot--empty');
            node.className = classes.join(' ');
            var placeholder = document.createElement('div');
            placeholder.className = 'slot__avatar';
            placeholder.textContent = '+';
            node.appendChild(placeholder);
            var waiting = document.createElement('div');
            waiting.className = 'slot__name';
            waiting.textContent = 'Đang chờ…';
            node.appendChild(waiting);
            return node;
        }

        if (player.ready) {
            classes.push('slot--ready');
        }
        if (!player.connected) {
            classes.push('slot--offline');
        }
        if (store.currentUserId && player.userId === store.currentUserId) {
            classes.push('slot--me');
        }
        if (player.team === 0 || player.team === 1) {
            classes.push('slot--team-' + player.team);
        }
        node.className = classes.join(' ');

        var avatar = document.createElement('div');
        avatar.className = 'slot__avatar';
        if (player.avatar) {
            var img = document.createElement('img');
            img.src = player.avatar;
            img.alt = '';
            avatar.appendChild(img);
        } else {
            avatar.textContent = initials(player.displayName);
        }
        node.appendChild(avatar);

        var name = document.createElement('div');
        name.className = 'slot__name';
        name.textContent = player.displayName;
        node.appendChild(name);

        var badges = document.createElement('div');
        badges.className = 'slot__badges';
        if (player.isHost) {
            var host = document.createElement('span');
            host.className = 'tag tag--sakura';
            host.textContent = 'Host';
            badges.appendChild(host);
        }
        if (player.team === 0 || player.team === 1) {
            var team = document.createElement('span');
            team.className = player.team === 0 ? 'tag tag--sakura' : 'tag tag--cyan';
            team.textContent = 'Đội ' + (player.team + 1);
            badges.appendChild(team);
        }
        if (!player.connected) {
            var offline = document.createElement('span');
            offline.className = 'tag';
            offline.textContent = 'Mất kết nối';
            badges.appendChild(offline);
        }
        node.appendChild(badges);

        var ready = document.createElement('div');
        ready.className = 'slot__ready';
        var check = document.createElement('span');
        check.className = 'slot__check';
        check.textContent = '✓';
        ready.appendChild(check);
        var readyText = document.createElement('span');
        readyText.textContent = player.isHost
            ? 'Chủ phòng'
            : (player.ready ? 'Sẵn sàng' : 'Chưa sẵn sàng');
        ready.appendChild(readyText);
        node.appendChild(ready);

        return node;
    }

    function renderSlots(state) {
        var host = $('[data-versus]');
        if (!host) {
            return;
        }
        host.innerHTML = '';
        var duel = state.maxPlayers === 2;
        host.className = 'versus ' + (duel ? 'versus--duel' : 'versus--squad');

        var bySlot = {};
        (state.players || []).forEach(function (player) {
            bySlot[player.slot] = player;
        });

        for (var i = 0; i < state.maxPlayers; i++) {
            host.appendChild(buildSlot(bySlot[i] || null, state));
            if (duel && i === 0) {
                var divider = document.createElement('div');
                divider.className = 'versus__divider jp';
                divider.textContent = 'VS';
                host.appendChild(divider);
            }
        }
    }

    // ---------------- Render: info + settings ----------------

    function renderInfo(state) {
        $('[data-room-code]').textContent = state.roomCode;
        $('[data-info-game]').textContent = state.gameDisplayName;
        $('[data-info-status]').textContent = STATUS_LABEL[state.status] || state.status;
        $('[data-info-players]').textContent =
            (state.players || []).length + '/' + state.maxPlayers +
            ' (tối thiểu ' + state.minPlayers + ')';
        $('[data-info-visibility]').textContent =
            state.visibility === 'PUBLIC' ? 'Công khai' : 'Riêng tư';

        var invite = $('[data-invite-link]');
        if (invite && !invite.value) {
            invite.value = global.location.origin + '/games/room/' + state.roomId;
        }
    }

    function renderSettings(state) {
        var form = $('[data-settings-form]');
        if (!form) {
            return;
        }
        var isHost = store.isHost();
        $('[data-host-only]').hidden = !isHost;
        $('[data-guest-note]').hidden = isHost;

        var editable = isHost && state.status === 'WAITING';
        Array.prototype.forEach.call(form.elements, function (element) {
            element.disabled = !editable;
        });

        // Không ghi đè khi host đang chỉnh dở.
        if (settingsDirty) {
            return;
        }

        var modeSelect = form.elements.answerMode;
        if (modeSelect) {
            var supportedModes = state.gameType === 'CANNON_BATTLE'
                ? ['KANJI_TO_HIRAGANA', 'KANJI_TO_MEANING']
                : (state.gameType === 'MEMORY_MATCH'
                    ? ['KANJI_TO_HIRAGANA', 'KANJI_TO_MEANING', 'HIRAGANA_TO_MEANING']
                    : Object.keys(MODE_LABEL));
            var currentOptions = Array.prototype.map.call(modeSelect.options,
                function (option) { return option.value; }).join(',');
            if (currentOptions !== supportedModes.join(',')) {
                modeSelect.innerHTML = '';
            }
            var modes = supportedModes;
            modes.forEach(function (mode) {
                if (Array.prototype.some.call(modeSelect.options,
                    function (option) { return option.value === mode; })) {
                    return;
                }
                var option = document.createElement('option');
                option.value = mode;
                option.textContent = MODE_LABEL[mode];
                modeSelect.appendChild(option);
            });
        }

        var airSettings = $('[data-air-settings]');
        if (airSettings) {
            airSettings.hidden = state.gameType !== 'CANNON_BATTLE';
        }

        var settings = state.settings || {};
        if (settings.questionLevel) {
            form.elements.questionLevel.value = settings.questionLevel;
        }
        if (settings.questionSource) {
            form.elements.questionSource.value = settings.questionSource;
        }
        if (settings.answerMode) {
            form.elements.answerMode.value = settings.answerMode;
        }
        if (settings.questionCount) {
            form.elements.questionCount.value = settings.questionCount;
        }
        if (settings.secondsPerQuestion) {
            form.elements.secondsPerQuestion.value = settings.secondsPerQuestion;
        }
        if (state.gameType === 'CANNON_BATTLE') {
            var extra = settings.extra || {};
            form.elements.airObjective.value = extra.objective || 'SCORE_RACE';
            form.elements.airDifficulty.value = extra.difficulty || 'NORMAL';
            form.elements.airTargetScore.value = extra.targetScore || 10;
            form.elements.airMaxHp.value = extra.maxHp || 3;
        }
    }

    function renderActions(state) {
        var me = store.me();
        var isHost = store.isHost();
        var readyBtn = $('[data-ready-btn]');
        var startBtn = $('[data-start-btn]');
        var hint = $('[data-action-hint]');
        var waiting = state.status === 'WAITING';

        readyBtn.hidden = isHost || !waiting;
        startBtn.hidden = !isHost || !waiting;

        if (!readyBtn.hidden && me) {
            readyBtn.textContent = me.ready ? 'Bỏ sẵn sàng' : 'Sẵn sàng';
            readyBtn.classList.toggle('btn--primary', !me.ready);
            readyBtn.classList.toggle('btn--ghost', me.ready);
        }

        if (!startBtn.hidden) {
            startBtn.disabled = !state.canStart;
        }

        if (state.status !== 'WAITING') {
            hint.textContent = STATUS_LABEL[state.status] || state.status;
        } else if (state.startBlockedReason) {
            hint.textContent = state.startBlockedReason;
        } else {
            hint.textContent = isHost ? 'Đủ điều kiện — bấm Bắt đầu' : 'Chờ chủ phòng bắt đầu';
        }
    }

    // ---------------- Countdown ----------------

    function stopCountdown() {
        if (countdownTimer) {
            global.clearInterval(countdownTimer);
            countdownTimer = null;
        }
        $('[data-countdown-overlay]').classList.add('is-hidden');
    }

    /** Tick từ startAt/endAt của server + độ lệch đồng hồ, không dùng bộ đếm riêng. */
    function runCountdown(state) {
        var overlay = $('[data-countdown-overlay]');
        var number = $('[data-countdown-number]');
        if (!state.countdownEndAt) {
            return;
        }
        var endAt = new Date(state.countdownEndAt).getTime();
        overlay.classList.remove('is-hidden');

        function tick() {
            var remainMs = endAt - store.serverNow();
            if (remainMs <= 0) {
                number.textContent = 'START';
                return;
            }
            var seconds = Math.ceil(remainMs / 1000);
            if (number.textContent !== String(seconds)) {
                number.textContent = String(seconds);
                // Re-trigger animation cho mỗi con số.
                number.style.animation = 'none';
                void number.offsetWidth;
                number.style.animation = '';
            }
        }

        tick();
        if (countdownTimer) {
            global.clearInterval(countdownTimer);
        }
        countdownTimer = global.setInterval(tick, 100);
    }

    // ---------------- Wiring ----------------

    function navigateToGame(state) {
        if (gameNavigationStarted || !state || state.status !== 'IN_GAME'
            || !state.sessionId
            || (state.gameType !== 'MEMORY_MATCH' && state.gameType !== 'CANNON_BATTLE')) {
            return;
        }
        gameNavigationStarted = true;
        var route = state.gameType === 'CANNON_BATTLE'
            ? '/games/air-defense/' : '/games/memory/';
        global.location.href = route + encodeURIComponent(state.sessionId);
    }

    function render(state) {
        var loading = $('[data-versus-loading]');
        if (loading && loading.parentNode) {
            loading.parentNode.removeChild(loading);
        }
        renderSlots(state);
        renderInfo(state);
        renderSettings(state);
        renderActions(state);

        if (state.status === 'COUNTDOWN') {
            runCountdown(state);
        } else {
            stopCountdown();
        }
        navigateToGame(state);
    }

    function handleEvent(envelope) {
        var E = global.GameRoomStore.EVENT;
        switch (envelope.type) {
            case E.ROOM_ERROR:
                global.ArenaToast.error(envelope.payload && envelope.payload.message);
                break;
            case E.PLAYER_JOINED:
                global.ArenaToast.info('Có người vừa vào phòng');
                break;
            case E.PLAYER_LEFT:
                global.ArenaToast.info('Một người chơi đã rời phòng');
                break;
            case E.PLAYER_RECONNECTED:
                global.ArenaToast.success('Người chơi đã kết nối lại');
                break;
            case E.HOST_CHANGED:
                global.ArenaToast.info('Chủ phòng đã thay đổi');
                break;
            case E.ROOM_SETTINGS_UPDATED:
                settingsDirty = false;
                global.ArenaToast.info('Cấu hình phòng đã cập nhật');
                break;
            case E.GAME_STARTED:
                global.ArenaToast.success('Trận đấu bắt đầu!');
                global.setTimeout(stopCountdown, 900);
                global.setTimeout(function () {
                    navigateToGame(envelope.payload);
                }, 350);
                break;
            case E.ROOM_CLOSED:
                global.ArenaToast.error('Phòng đã đóng');
                global.setTimeout(function () {
                    global.location.href = '/games/lobby';
                }, 1200);
                break;
            default:
                break;
        }
    }

    function bindUi() {
        var readyBtn = $('[data-ready-btn]');
        readyBtn.addEventListener('click', function () {
            var me = store.me();
            store.setReady(!(me && me.ready));
        });

        var startBtn = $('[data-start-btn]');
        startBtn.addEventListener('click', function () {
            // Chặn double-click ở client; server vẫn là chốt cuối.
            startBtn.disabled = true;
            store.requestStart();
        });

        var settingsForm = $('[data-settings-form]');
        settingsForm.addEventListener('input', function () {
            settingsDirty = true;
        });
        settingsForm.addEventListener('change', function () {
            settingsDirty = false;
            var patch = {
                questionLevel: settingsForm.elements.questionLevel.value,
                questionSource: settingsForm.elements.questionSource.value,
                answerMode: settingsForm.elements.answerMode.value,
                questionCount: parseInt(settingsForm.elements.questionCount.value, 10) || null,
                secondsPerQuestion:
                    parseInt(settingsForm.elements.secondsPerQuestion.value, 10) || null
            };
            if (store.state && store.state.gameType === 'CANNON_BATTLE') {
                patch.extra = {
                    objective: settingsForm.elements.airObjective.value,
                    difficulty: settingsForm.elements.airDifficulty.value,
                    targetScore: parseInt(settingsForm.elements.airTargetScore.value, 10) || 10,
                    maxHp: parseInt(settingsForm.elements.airMaxHp.value, 10) || 3
                };
            }
            store.updateSettings(patch);
        });

        function copy(text, button, label) {
            var done = function () {
                button.classList.add('is-copied');
                var original = button.textContent;
                button.textContent = 'Đã copy';
                global.setTimeout(function () {
                    button.classList.remove('is-copied');
                    button.textContent = original;
                }, 1400);
                global.ArenaToast.success(label + ' đã được sao chép');
            };
            if (global.navigator.clipboard) {
                global.navigator.clipboard.writeText(text).then(done).catch(function () {
                    global.ArenaToast.error('Không sao chép được, hãy copy thủ công');
                });
            } else {
                global.ArenaToast.info(label + ': ' + text);
            }
        }

        $('[data-copy-code]').addEventListener('click', function () {
            if (store.state) {
                copy(store.state.roomCode, this, 'Mã phòng');
            }
        });

        $('[data-copy-link]').addEventListener('click', function () {
            copy($('[data-invite-link]').value, this, 'Link mời');
        });

        $('[data-leave-room]').addEventListener('click', function () {
            store.leave();
        });

        $('[data-reload-page]').addEventListener('click', function () {
            global.location.reload();
        });

        function toggleDrawer(panelSelector, button) {
            var panel = $(panelSelector);
            var open = panel.classList.toggle('is-open');
            button.setAttribute('aria-expanded', String(open));
        }

        $('[data-toggle-left]').addEventListener('click', function () {
            toggleDrawer('[data-panel-left]', this);
        });
        $('[data-toggle-right]').addEventListener('click', function () {
            toggleDrawer('[data-panel-right]', this);
        });
    }

    function bindConnection() {
        store.on('connection', function (status) {
            var badge = $('[data-conn]');
            var label = $('[data-conn-label]');
            badge.className = 'conn conn--' + status;
            label.textContent = status === 'online'
                ? 'Đã kết nối'
                : (status === 'connecting' ? 'Đang kết nối' : 'Mất kết nối');
            $('[data-reconnect-overlay]').classList.toggle('is-hidden', status !== 'offline');
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        var roomId = document.body.getAttribute('data-room-id');
        if (!roomId) {
            return;
        }
        store = new global.GameRoomStore(roomId);
        global.ArenaRoomStore = store;

        bindUi();
        bindConnection();
        store.on('change', render);
        store.on('event', handleEvent);

        // Lấy state qua REST trước (xác nhận là thành viên) rồi mới mở WS.
        global.ArenaApi.me().then(function (user) {
            store.currentUserId = user.userId;
            return global.ArenaApi.roomState(roomId);
        }).then(function (state) {
            store.applyState(state);
            store.connect();
        }).catch(function (err) {
            global.ArenaToast.error(err.message);
            global.setTimeout(function () {
                global.location.href = '/games/lobby';
            }, 1500);
        });
    });

    // Dọn kết nối + timer khi rời trang (tránh leak & listener trùng).
    global.addEventListener('beforeunload', function () {
        stopCountdown();
        if (store) {
            store.destroy();
        }
    });
})(window);
