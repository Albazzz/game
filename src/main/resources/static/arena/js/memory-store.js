/**
 * MemoryStore — kết nối STOMP tới bàn Memory Match và giữ snapshot mới nhất.
 * Mirror GameRoomStore: server là nguồn sự thật, client chỉ gửi ý định lật thẻ.
 */
(function (global) {
    'use strict';

    var EVENT = {
        SESSION_STATE: 'MEMORY_SESSION_STATE',
        CARD_REVEALED: 'MEMORY_CARD_REVEALED',
        PAIR_MATCHED: 'MEMORY_PAIR_MATCHED',
        PAIR_MISMATCH: 'MEMORY_PAIR_MISMATCH',
        CARDS_HIDDEN: 'MEMORY_CARDS_HIDDEN',
        NEXT_TURN: 'MEMORY_NEXT_TURN',
        TURN_TIMEOUT: 'MEMORY_TURN_TIMEOUT',
        PLAYER_UPDATED: 'MEMORY_PLAYER_UPDATED',
        PAUSED: 'MEMORY_PAUSED',
        RESUMED: 'MEMORY_RESUMED',
        GAME_OVER: 'MEMORY_GAME_OVER',
        ERROR: 'MEMORY_ERROR'
    };

    function MemoryStore(sessionId) {
        this.sessionId = sessionId;
        this.state = null;
        this.connection = 'connecting';
        this.currentUserId = null;
        this.clockSkewMs = 0;
        this.listeners = { change: [], event: [], connection: [] };
        this.client = null;
        this.subscriptions = [];
        this.destroyed = false;
        this.reconnectAttempt = 0;
        this.reconnectTimer = null;
    }

    MemoryStore.EVENT = EVENT;

    MemoryStore.prototype.on = function (type, handler) {
        var list = this.listeners[type];
        if (!list || typeof handler !== 'function') {
            return function () {};
        }
        list.push(handler);
        return function off() {
            var index = list.indexOf(handler);
            if (index >= 0) {
                list.splice(index, 1);
            }
        };
    };

    MemoryStore.prototype.emit = function (type, payload) {
        var list = this.listeners[type] || [];
        for (var i = 0; i < list.length; i++) {
            try {
                list[i](payload, this);
            } catch (err) {
                if (global.console) {
                    global.console.error('[memory] listener error', err);
                }
            }
        }
    };

    MemoryStore.prototype.setConnection = function (status) {
        if (this.connection === status) {
            return;
        }
        this.connection = status;
        this.emit('connection', status);
    };

    /** Bỏ snapshot cũ hơn: event tới trái thứ tự không làm bàn lùi trạng thái. */
    MemoryStore.prototype.applyState = function (next) {
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

    MemoryStore.prototype.serverNow = function () {
        return Date.now() + this.clockSkewMs;
    };

    MemoryStore.prototype.me = function () {
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

    MemoryStore.prototype.isMyTurn = function () {
        return !!(this.state && this.currentUserId
            && this.state.currentTurnUserId === this.currentUserId);
    };

    // ---------------- STOMP transport ----------------

    MemoryStore.prototype.connect = function () {
        if (this.destroyed || this.client) {
            return;
        }
        var self = this;
        this.setConnection('connecting');

        var socket = new global.SockJS('/ws-arena');
        var client = global.Stomp.over(socket);
        client.debug = null;
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

    MemoryStore.prototype.subscribeAll = function () {
        var self = this;
        this.unsubscribeAll();

        this.subscriptions.push(this.client.subscribe(
            '/topic/memory/' + this.sessionId,
            function (frame) { self.handleFrame(frame); }));

        this.subscriptions.push(this.client.subscribe(
            '/user/queue/memory',
            function (frame) { self.handleFrame(frame); }));
    };

    MemoryStore.prototype.unsubscribeAll = function () {
        for (var i = 0; i < this.subscriptions.length; i++) {
            try {
                this.subscriptions[i].unsubscribe();
            } catch (err) {
                /* ignore: socket có thể đã đóng */
            }
        }
        this.subscriptions = [];
    };

    MemoryStore.prototype.handleFrame = function (frame) {
        var envelope;
        try {
            envelope = JSON.parse(frame.body);
        } catch (err) {
            return;
        }
        if (!envelope || !envelope.type) {
            return;
        }
        // Payload của mọi event state đều là MemoryStateView.
        if (envelope.payload && envelope.payload.sessionId) {
            this.applyState(envelope.payload);
        }
        this.emit('event', envelope);
    };

    MemoryStore.prototype.scheduleReconnect = function () {
        if (this.destroyed || this.reconnectTimer) {
            return;
        }
        var self = this;
        this.reconnectAttempt += 1;
        // Backoff 1s → 8s, giống room store.
        var delay = Math.min(8000, 1000 * Math.pow(2, this.reconnectAttempt - 1));
        this.reconnectTimer = global.setTimeout(function () {
            self.reconnectTimer = null;
            self.connect();
        }, delay);
    };

    MemoryStore.prototype.send = function (suffix, body) {
        if (!this.client || this.connection !== 'online') {
            return false;
        }
        try {
            this.client.send('/app/memory/' + this.sessionId + suffix, {},
                JSON.stringify(body || {}));
            return true;
        } catch (err) {
            return false;
        }
    };

    MemoryStore.prototype.flip = function (cardInstanceId) {
        return this.send('/flip', { cardInstanceId: cardInstanceId });
    };

    /** Huỷ toàn bộ listener/timer/subscription — gọi khi rời trang. */
    MemoryStore.prototype.destroy = function () {
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

    global.MemoryStore = MemoryStore;
})(window);
