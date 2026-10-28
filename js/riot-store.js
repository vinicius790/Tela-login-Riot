/**
 * riot-store.js — Riot Games Client Redux-like State Container & Event Bus
 * 
 * Slices:
 *   - auth: session status, user profile, token, roles, 2faStatus
 *   - social: friends list, online presence, active chat messages
 *   - matchmaking: queue status, match details, estimated time
 *   - settings: sound volume, theme, custom cursor, locale, high contrast
 * 
 * Features:
 *   - Predictable dispatch/reducer unidirectional data flow
 *   - Selector pattern with memoized change emission
 *   - Integrated Pub/Sub Event Bus for cross-module orchestration
 *   - LocalStorage synchronization
 * 
 * API:
 *   window.RiotStore = {
 *     getState(),
 *     dispatch(action),
 *     subscribe(listener),
 *     select(selector, callback),
 *     emit(event, data),
 *     on(event, callback),
 *     off(event, callback)
 *   }
 */

(function (global) {
  'use strict';

  const STORAGE_KEY = 'riot_client_redux_state';

  // Initial Default State
  const INITIAL_STATE = {
    auth: {
      isAuthenticated: false,
      user: null,
      token: null,
      roles: ['SUMMONER'],
      mfaVerified: false
    },
    social: {
      presence: 'online', // online, away, dnd, mobile, offline
      friends: [
        { id: 'f1', name: 'Faker#T1', status: 'In Game (LeBlanc 14/0)', rank: 'Challenger', presence: 'in-game' },
        { id: 'f2', name: 'TenZ#SEN', status: 'In Queue', rank: 'Radiant', presence: 'online' },
        { id: 'f3', name: 'Caps#G2', status: 'Online', rank: 'Grandmaster', presence: 'online' },
        { id: 'f4', name: 'Doublelift#NA1', status: 'Away (Streaming)', rank: 'Master', presence: 'away' }
      ],
      chatMessages: []
    },
    matchmaking: {
      status: 'idle', // idle, queuing, match_found, champ_select, in_game
      queueType: 'RANKED_SOLO_5V5',
      queueStartTime: null,
      estimatedWaitSeconds: 45,
      activeMatchId: null
    },
    settings: {
      theme: 'riot',
      locale: 'pt-BR',
      volume: 0.6,
      sfxMuted: false,
      customCursor: true,
      highContrast: false,
      reducedMotion: false
    }
  };

  // Root Reducer
  function rootReducer(state = INITIAL_STATE, action) {
    if (!action || !action.type) return state;

    switch (action.type) {
      // --- AUTH ACTIONS ---
      case 'AUTH_LOGIN_SUCCESS':
        return {
          ...state,
          auth: {
            ...state.auth,
            isAuthenticated: true,
            user: action.payload.user,
            token: action.payload.token,
            mfaVerified: !!action.payload.mfaVerified
          }
        };

      case 'AUTH_LOGOUT':
        return {
          ...state,
          auth: {
            isAuthenticated: false,
            user: null,
            token: null,
            roles: ['SUMMONER'],
            mfaVerified: false
          },
          matchmaking: {
            ...state.matchmaking,
            status: 'idle'
          }
        };

      // --- SOCIAL ACTIONS ---
      case 'SOCIAL_UPDATE_PRESENCE':
        return {
          ...state,
          social: {
            ...state.social,
            presence: action.payload
          }
        };

      case 'SOCIAL_ADD_FRIEND':
        return {
          ...state,
          social: {
            ...state.social,
            friends: [...state.social.friends, action.payload]
          }
        };

      case 'SOCIAL_SEND_CHAT':
        return {
          ...state,
          social: {
            ...state.social,
            chatMessages: [
              ...state.social.chatMessages.slice(-50), // keep last 50
              {
                id: 'msg_' + Date.now(),
                sender: action.payload.sender,
                text: action.payload.text,
                timestamp: new Date().toISOString()
              }
            ]
          }
        };

      // --- MATCHMAKING ACTIONS ---
      case 'MATCH_START_QUEUE':
        return {
          ...state,
          matchmaking: {
            ...state.matchmaking,
            status: 'queuing',
            queueType: action.payload?.queueType || state.matchmaking.queueType,
            queueStartTime: Date.now()
          }
        };

      case 'MATCH_FOUND':
        return {
          ...state,
          matchmaking: {
            ...state.matchmaking,
            status: 'match_found',
            activeMatchId: action.payload?.matchId || 'MATCH-' + Math.floor(100000 + Math.random() * 900000)
          }
        };

      case 'MATCH_CANCEL_QUEUE':
        return {
          ...state,
          matchmaking: {
            ...state.matchmaking,
            status: 'idle',
            queueStartTime: null,
            activeMatchId: null
          }
        };

      // --- SETTINGS ACTIONS ---
      case 'SETTINGS_SET_THEME':
        return {
          ...state,
          settings: {
            ...state.settings,
            theme: action.payload
          }
        };

      case 'SETTINGS_SET_LOCALE':
        return {
          ...state,
          settings: {
            ...state.settings,
            locale: action.payload
          }
        };

      case 'SETTINGS_SET_VOLUME':
        return {
          ...state,
          settings: {
            ...state.settings,
            volume: Math.max(0, Math.min(1, action.payload))
          }
        };

      case 'SETTINGS_TOGGLE_MUTE':
        return {
          ...state,
          settings: {
            ...state.settings,
            sfxMuted: !state.settings.sfxMuted
          }
        };

      case 'SETTINGS_TOGGLE_CURSOR':
        return {
          ...state,
          settings: {
            ...state.settings,
            customCursor: action.payload !== undefined ? action.payload : !state.settings.customCursor
          }
        };

      default:
        return state;
    }
  }

  class RiotStore {
    constructor() {
      this.state = this._loadInitialState();
      this.listeners = new Set();
      this.events = new Map();
    }

    _loadInitialState() {
      if (typeof localStorage !== 'undefined') {
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            const parsed = JSON.parse(saved);
            return {
              ...INITIAL_STATE,
              ...parsed,
              auth: { ...INITIAL_STATE.auth, ...parsed.auth },
              settings: { ...INITIAL_STATE.settings, ...parsed.settings }
            };
          }
        } catch (e) {}
      }
      return { ...INITIAL_STATE };
    }

    _saveState() {
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({
            auth: this.state.auth,
            settings: this.state.settings,
            social: {
              presence: this.state.social.presence,
              friends: this.state.social.friends
            }
          }));
        } catch (e) {}
      }
    }

    getState() {
      return this.state;
    }

    dispatch(action) {
      if (!action || typeof action.type !== 'string') {
        throw new Error('Action must be an object with a string type property');
      }

      const prevState = this.state;
      this.state = rootReducer(this.state, action);
      this._saveState();

      // Notify all subscribers
      this.listeners.forEach(listener => {
        try {
          listener(this.state, prevState, action);
        } catch (err) {
          console.error('Error in RiotStore listener:', err);
        }
      });

      // Also emit action type on event bus
      this.emit(action.type, action.payload);
      return action;
    }

    subscribe(listener) {
      if (typeof listener !== 'function') return () => {};
      this.listeners.add(listener);
      return () => this.listeners.delete(listener);
    }

    /**
     * Subscribes to a specific sub-state slice with value-equality check
     */
    select(selector, callback) {
      if (typeof selector !== 'function' || typeof callback !== 'function') return () => {};
      let currentVal = selector(this.state);
      callback(currentVal);

      return this.subscribe((newState) => {
        const nextVal = selector(newState);
        if (nextVal !== currentVal) {
          const prev = currentVal;
          currentVal = nextVal;
          callback(currentVal, prev);
        }
      });
    }

    // --- Pub/Sub Event Bus ---
    on(event, handler) {
      if (!this.events.has(event)) this.events.set(event, new Set());
      this.events.get(event).add(handler);
      return () => this.off(event, handler);
    }

    off(event, handler) {
      if (this.events.has(event)) {
        this.events.get(event).delete(handler);
      }
    }

    emit(event, data) {
      if (this.events.has(event)) {
        this.events.get(event).forEach(handler => {
          try {
            handler(data);
          } catch (err) {
            console.error(`Error in event handler for ${event}:`, err);
          }
        });
      }
    }
  }

  const storeInstance = new RiotStore();

  if (typeof window !== 'undefined') {
    window.RiotStore = storeInstance;
    window.RiotStoreClass = RiotStore;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RiotStore: storeInstance, RiotStoreClass: RiotStore };
  }
})(typeof window !== 'undefined' ? window : global);
