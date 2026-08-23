/**
 * GameRoomStore — state management tối giản, tách khỏi render.
 * Một instance duy nhất giữ 1 kết nối STOMP; subscribe/unsubscribe tường minh
 * để không bị listener trùng khi re-render (p1.md §15).
 */
(function (global) {
    'use strict';

    var EVENT = {
        ROOM_STATE: 'ROOM_STATE',
        PLAYER_JOINED: 'PLAYER_JOINED',
        PLAYER_LEFT: 'PLAYER_LEFT',
        PLAYER_UPDATED: 'PLAYER_UPDATED',
        PLAYER_RECONNECTED: 'PLAYER_RECONNECTED',
        ROOM_SETTINGS_UPDATED: 'ROOM_SETTINGS_UPDATED',
        COUNTDOWN_STARTED: 'COUNTDOWN_STARTED',
        GAME_STARTED: 'GAME_STARTED',
        HOST_CHANGED: 'HOST_CHANGED',
        ROOM_CLOSED: 'ROOM_CLOSED',
        ROOM_ERROR: 'ROOM_ERROR'
    };

    function GameRoomStore(roomId) {
        this.roomId = roomId;
        this.state = null;
        this.connection = 'connecting';
        /** Lệch giờ client-server (ms) để countdown đồng bộ theo startAt. */
        this.clockSkewMs = 0;
        this.listeners = { change: [], event: [], connection: [] };
        this.client = null;
        this.subscriptions = [];
        this.destroyed = false;
        this.reconnectAttempt = 0;
        this.reconnectTimer = null;
    }

    GameRoomStore.EVENT = EVENT;

    GameRoomStore.prototype.on = function (type, handler) {
        var list = this.listeners[type];
        if (!list || typeof handler !== 'function') {
            return function () {};
        }
        list.push(handler);
        var self = this;
        return function off() {
            var index = list.indexOf(handler);
            if (index >= 0) {
                list.splice(index, 1);
            }
            return self;
        };
    };

    GameRoomStore.prototype.emit = function (type, payload) {
        var list = this.listeners[type] || [];
        for (var i = 0; i < list.length; i++) {
            try {
                list[i](payload, this);
            } catch (err) {
                if (global.console) {
                    global.console.error('[arena] listener error', err);
                }
            }
        }
    };

    GameRoomStore.prototype.setConnection = function (status) {
        if (this.connection === status) {
            return;
        }
        this.connection = status;
        this.emit('connection', status);
    };

    /** Chỉ nhận state mới hơn — event tới trái thứ tự không làm state lùi. */
    GameRoomStore.prototype.applyState = function (next) {
        if (!next) {
            return;
        }
        if (this.state && typeof next.stateVersion === 'number'
            && next.stateVersion < this.state.stateVersion) {
            return;
        }
        if (next.serverTime) {
            this.clockSkewMs = new Date(next.serverTime).getTime() - Date.now();
        }
        this.state = next;
        this.emit('change', next);
    };

    GameRoomStore.prototype.serverNow = function () {
        return Date.now() + this.clockSkewMs;
    };

    GameRoomStore.prototype.me = function () {
        if (!this.state || !this.currentUserId) {
            return null;
        }
        var players = this.state.players || [];
        for (var i = 0; i < players.length; i++) {
            if (players[i].userId === this.currentUserId) {
                return players[i];
            }
        }
        return null;
    };

    GameRoomStore.prototype.isHost = function () {
        return !!(this.state && this.currentUserId
            && this.state.hostUserId === this.currentUserId);
    };

    // ---------------- STOMP transport ----------------

    GameRoomStore.prototype.connect = function () {
        if (this.destroyed || this.client) {
            return;
        }
        var self = this;
        this.setConnection('connecting');

        var socket = new global.SockJS('/ws-arena');
        var client = global.Stomp.over(socket);
        client.debug = null;
        // Heartbeat để phát hiện mất kết nối sớm.
        client.heartbeat.outgoing = 10000;
        client.heartbeat.incoming = 10000;
        this.client = client;

        client.connect({}, function () {
            self.reconnectAttempt = 0;
            self.setConnection('online');
            self.subscribeAll();
            // Xin snapshot ngay sau khi subscribe để không bỏ event nào.
            self.send('/state');
        }, function () {
            self.client = null;
            self.subscriptions = [];
            if (self.destroyed) {
                return;
            }
            self.setConnection('offline');
            self.scheduleReconnect();
        });
    };

    GameRoomStore.prototype.subscribeAll = function () {
        var self = this;
        this.unsubscribeAll();

        this.subscriptions.push(this.client.subscribe(
            '/topic/arena/room/' + this.roomId,
            function (frame) { self.handleFrame(frame); }));

        this.subscriptions.push(this.client.subscribe(
            '/user/queue/arena',
            function (frame) { self.handleFrame(frame); }));
    };

    GameRoomStore.prototype.unsubscribeAll = function () {
        for (var i = 0; i < this.subscriptions.length; i++) {
            try {
                this.subscriptions[i].unsubscribe();
            } catch (err) {
                /* ignore: socket có thể đã đóng */
            }
        }
        this.subscriptions = [];
    };

    GameRoomStore.prototype.handleFrame = function (frame) {
        var envelope;
        try {
            envelope = JSON.parse(frame.body);
        } catch (err) {
            return;
        }
        if (!envelope || !envelope.type) {
            return;
        }
        // Payload của mọi event state đều là RoomStateView.
        if (envelope.payload && envelope.payload.roomId) {
            this.applyState(envelope.payload);
        }
        this.emit('event', envelope);
    };

    GameRoomStore.prototype.scheduleReconnect = function () {
        if (this.destroyed || this.reconnectTimer) {
            return;
        }
        var self = this;
        this.reconnectAttempt += 1;
        // Backoff 1s → 8s, dừng ở 8s để vẫn vào lại trước khi hết grace period.
        var delay = Math.min(8000, 1000 * Math.pow(2, this.reconnectAttempt - 1));
        this.reconnectTimer = global.setTimeout(function () {
            self.reconnectTimer = null;
            self.connect();
        }, delay);
    };

    GameRoomStore.prototype.send = function (suffix, body) {
        if (!this.client || this.connection !== 'online') {
            return false;
        }
        try {
            this.client.send('/app/arena/room/' + this.roomId + suffix, {},
                JSON.stringify(body || {}));
            return true;
        } catch (err) {
            return false;
        }
    };

    GameRoomStore.prototype.setReady = function (ready) {
        return this.send('/ready', { ready: !!ready });
    };

    GameRoomStore.prototype.updateSettings = function (patch) {
        return this.send('/settings', patch || {});
    };

    GameRoomStore.prototype.requestStart = function () {
        return this.send('/start');
    };

    GameRoomStore.prototype.leave = function () {
        return this.send('/leave');
    };

    /** Huỷ toàn bộ listener/timer/subscription — gọi khi rời trang. */
    GameRoomStore.prototype.destroy = function () {
        this.destroyed = true;
        if (this.reconnectTimer) {
            global.clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        this.unsubscribeAll();
        if (this.client) {
            try {
                this.client.disconnect();
            } catch (err) {
                /* ignore */
            }
            this.client = null;
        }
        this.listeners = { change: [], event: [], connection: [] };
    };

    global.GameRoomStore = GameRoomStore;
})(window);
