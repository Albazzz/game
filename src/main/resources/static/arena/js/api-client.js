/**
 * REST client cho Arena. Token nằm ở cookie HttpOnly nên chỉ cần
 * credentials: 'same-origin'; unwrap envelope ApiResponse.
 */
(function (global) {
    'use strict';

    function request(method, url, body) {
        var options = {
            method: method,
            credentials: 'same-origin',
            headers: { 'Accept': 'application/json' }
        };
        if (body !== undefined && body !== null) {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(body);
        }
        return fetch(url, options).then(function (response) {
            if (response.status === 401) {
                global.location.href = '/login?redirect=' +
                    encodeURIComponent(global.location.pathname + global.location.search);
                return Promise.reject(new Error('Chưa đăng nhập'));
            }
            return response.json()
                .catch(function () {
                    return { success: false, message: 'Phản hồi không hợp lệ từ server' };
                })
                .then(function (payload) {
                    if (!response.ok || !payload || payload.success === false) {
                        var message = (payload && payload.message) || 'Yêu cầu thất bại';
                        var error = new Error(message);
                        error.status = response.status;
                        error.errors = payload && payload.errors;
                        return Promise.reject(error);
                    }
                    return payload.data;
                });
        });
    }

    global.ArenaApi = {
        catalog: function () {
            return request('GET', '/api/games/catalog');
        },
        lobbyRooms: function () {
            return request('GET', '/api/games/lobby/rooms');
        },
        lobbyStats: function () {
            return request('GET', '/api/games/lobby/stats');
        },
        createRoom: function (payload) {
            return request('POST', '/api/games/rooms', payload);
        },
        joinByCode: function (roomCode) {
            return request('POST', '/api/games/rooms/join-by-code', { roomCode: roomCode });
        },
        joinRoom: function (roomId) {
            return request('POST', '/api/games/rooms/' + encodeURIComponent(roomId) + '/join');
        },
        roomState: function (roomId) {
            return request('GET', '/api/games/rooms/' + encodeURIComponent(roomId));
        },
        setReady: function (roomId, ready) {
            return request('POST', '/api/games/rooms/' + encodeURIComponent(roomId) + '/ready',
                { ready: ready });
        },
        updateSettings: function (roomId, patch) {
            return request('PATCH', '/api/games/rooms/' + encodeURIComponent(roomId) + '/settings',
                patch);
        },
        start: function (roomId) {
            return request('POST', '/api/games/rooms/' + encodeURIComponent(roomId) + '/start');
        },
        leave: function (roomId) {
            return request('POST', '/api/games/rooms/' + encodeURIComponent(roomId) + '/leave');
        },
        createMemorySolo: function (settings) {
            return request('POST', '/api/memory/sessions', { settings: settings || {} });
        },
        memoryState: function (sessionId) {
            return request('GET', '/api/memory/sessions/' + encodeURIComponent(sessionId));
        },
        memoryPause: function (sessionId) {
            return request('POST', '/api/memory/sessions/' + encodeURIComponent(sessionId) + '/pause');
        },
        memoryResume: function (sessionId) {
            return request('POST', '/api/memory/sessions/' + encodeURIComponent(sessionId) + '/resume');
        },
        createAirDefenseSolo: function (settings) {
            return request('POST', '/api/air-defense/sessions', { settings: settings || {} });
        },
        airDefenseState: function (sessionId) {
            return request('GET', '/api/air-defense/sessions/' + encodeURIComponent(sessionId));
        },
        airDefensePause: function (sessionId) {
            return request('POST', '/api/air-defense/sessions/' + encodeURIComponent(sessionId) + '/pause');
        },
        airDefenseResume: function (sessionId) {
            return request('POST', '/api/air-defense/sessions/' + encodeURIComponent(sessionId) + '/resume');
        },
        me: function () {
            return request('GET', '/api/auth/me');
        },
        login: function (email, password) {
            return request('POST', '/api/auth/login', { email: email, password: password });
        },
        register: function (email, password, fullName) {
            return request('POST', '/api/auth/register',
                { email: email, password: password, fullName: fullName });
        },
        googleLogin: function (idToken) {
            return request('POST', '/api/auth/google', { idToken: idToken });
        },
        logout: function () {
            return request('POST', '/api/auth/logout');
        }
    };
})(window);
