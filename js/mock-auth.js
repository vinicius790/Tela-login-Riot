/**
 * mock-auth.js - Advanced Authentication Service for Riot Games Login
 * Features:
 * - Web Cryptography API (SHA-256 hashing) with secure salt
 * - 2FA verification flow with OTP code 123456
 * - Session management in localStorage with "Remember Me"
 * - Event dispatching & integrations with Audio, Confetti, and Toast notifications
 * - Service Worker registration for PWA
 */
(function() {
    'use strict';

    class MockAuthService {
        constructor() {
            this.storageKey = 'riot_auth_session';
            this.usersKey = 'riot_mock_users';
            this.pendingUser = null;
            this.initDefaultUsers();
            this.initEventListeners();
            this.registerServiceWorker();
        }

        async hashPassword(password) {
            try {
                if (window.crypto && crypto.subtle) {
                    const msgBuffer = new TextEncoder().encode(password + '_riot_salt_2026');
                    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
                    const hashArray = Array.from(new Uint8Array(hashBuffer));
                    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                }
            } catch (e) {
                // fallback below
            }
            // Fallback lightweight hash
            let hash = 0;
            for (let i = 0; i < password.length; i++) {
                hash = ((hash << 5) - hash) + password.charCodeAt(i);
                hash |= 0;
            }
            return 'h_' + Math.abs(hash).toString(16);
        }

        async initDefaultUsers() {
            if (!localStorage.getItem(this.usersKey)) {
                const defaultHash = await this.hashPassword('password123');
                const defaultUsers = [
                    { 
                        username: 'player1', 
                        passwordHash: defaultHash, 
                        email: 'player1@riotgames.com', 
                        twoFactorCode: '123456' 
                    }
                ];
                localStorage.setItem(this.usersKey, JSON.stringify(defaultUsers));
            }
        }

        dispatch(eventName, detail = {}) {
            window.dispatchEvent(new CustomEvent(eventName, { detail }));
        }

        async login(username, password, rememberMe = false) {
            const inputHash = await this.hashPassword(password);
            
            setTimeout(() => {
                const users = JSON.parse(localStorage.getItem(this.usersKey)) || [];
                // Support both legacy plain passwords and modern hash
                const user = users.find(u => 
                    u.username.toLowerCase() === username.toLowerCase() && 
                    (u.passwordHash === inputHash || u.password === password)
                );

                if (!user) {
                    const msg = window.i18n ? window.i18n.t('toast_invalid_credentials') : 'Nome de usuário ou senha incorretos.';
                    this.dispatch('auth:error', { message: msg });
                    if (window.showRiotToast) window.showRiotToast(msg, 'error');
                    if (window.riotAudio) window.riotAudio.play('error');
                    return;
                }

                this.pendingUser = { ...user, rememberMe };
                this.dispatch('auth:2fa_required', { username: user.username, email: user.email });
                const toast2fa = window.i18n ? window.i18n.t('toast_2fa_sent', { email: user.email }) : ('Código 2FA enviado para ' + user.email + ' (Dica: 123456)');
                if (window.showRiotToast) window.showRiotToast(toast2fa, 'info');
                if (window.riotAudio) window.riotAudio.play('click');
            }, 450);
        }

        verify2FA(username, code) {
            setTimeout(() => {
                const users = JSON.parse(localStorage.getItem(this.usersKey)) || [];
                const user = users.find(u => u.username.toLowerCase() === username.toLowerCase()) || this.pendingUser;

                if (!user || (user.twoFactorCode !== code && code !== '123456')) {
                    const msg = window.i18n ? window.i18n.t('toast_2fa_incorrect') : 'Código de segurança incorreto.';
                    this.dispatch('auth:error', { message: msg });
                    if (window.showRiotToast) window.showRiotToast(msg, 'error');
                    if (window.riotAudio) window.riotAudio.play('error');
                    return;
                }

                const sessionData = {
                    username: user.username,
                    email: user.email,
                    token: 'riot_jwt_' + btoa(user.username + ':' + Date.now()),
                    loggedInAt: new Date().toISOString()
                };

                if (this.pendingUser?.rememberMe) {
                    localStorage.setItem(this.storageKey, JSON.stringify(sessionData));
                } else {
                    sessionStorage.setItem(this.storageKey, JSON.stringify(sessionData));
                }

                this.pendingUser = null;
                this.dispatch('auth:success', { user: sessionData });
                
                if (window.triggerConfetti) window.triggerConfetti();
                const welcomeMsg = window.i18n ? window.i18n.t('toast_login_success', { username: user.username }) : `Bem-vindo, ${user.username}! Login realizado.`;
                if (window.showRiotToast) window.showRiotToast(welcomeMsg, 'success');
                if (window.riotAudio) window.riotAudio.play('success');
            }, 500);
        }

        forgotPassword(identifier) {
            setTimeout(() => {
                const users = JSON.parse(localStorage.getItem(this.usersKey)) || [];
                const user = users.find(u => u.email.toLowerCase() === identifier.toLowerCase() || u.username.toLowerCase() === identifier.toLowerCase());

                if (!user) {
                    const notFound = window.i18n ? window.i18n.t('toast_recovery_not_found') : 'Conta ou e-mail não encontrado.';
                    this.dispatch('auth:error', { message: notFound });
                    if (window.showRiotToast) window.showRiotToast(notFound, 'error');
                    return;
                }

                this.dispatch('auth:password_recovery_sent', { email: user.email });
                const recSent = window.i18n ? window.i18n.t('toast_recovery_sent', { email: user.email }) : ('Instruções de redefinição enviadas para ' + user.email);
                if (window.showRiotToast) window.showRiotToast(recSent, 'success');
            }, 500);
        }

        async createAccount(username, email, password) {
            const passwordHash = await this.hashPassword(password);

            setTimeout(() => {
                const users = JSON.parse(localStorage.getItem(this.usersKey)) || [];
                if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
                    const existsMsg = window.i18n ? window.i18n.t('toast_user_exists') : 'Este nome de usuário já está em uso.';
                    this.dispatch('auth:error', { message: existsMsg });
                    if (window.showRiotToast) window.showRiotToast(existsMsg, 'error');
                    return;
                }

                const newUser = {
                    username,
                    email,
                    passwordHash,
                    twoFactorCode: '123456'
                };

                users.push(newUser);
                localStorage.setItem(this.usersKey, JSON.stringify(users));

                this.dispatch('auth:account_created', { username });
                if (window.triggerConfetti) window.triggerConfetti();
                const createdMsg = window.i18n ? window.i18n.t('toast_account_created') : 'Conta Riot ID criada com sucesso! Faça login.';
                if (window.showRiotToast) window.showRiotToast(createdMsg, 'success');
                if (window.riotAudio) window.riotAudio.play('success');
            }, 500);
        }

        logout() {
            localStorage.removeItem(this.storageKey);
            sessionStorage.removeItem(this.storageKey);
            this.dispatch('auth:logout');
            if (window.showRiotToast) window.showRiotToast('Sessão encerrada com sucesso.', 'info');
        }

        getCurrentSession() {
            const session = localStorage.getItem(this.storageKey) || sessionStorage.getItem(this.storageKey);
            return session ? JSON.parse(session) : null;
        }

        initEventListeners() {
            // Hook up default UI modals and interactions
            window.addEventListener('DOMContentLoaded', () => {
                const submitBtn = document.getElementById('loginSubmitBtn');
                const userInput = document.getElementById('usernameInput');
                const passInput = document.getElementById('passwordInput');
                const rememberCb = document.getElementById('rememberCheckbox');

                if (submitBtn && userInput && passInput) {
                    submitBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        if (!userInput.value.trim() || passInput.value.length < 8) return;
                        this.login(userInput.value.trim(), passInput.value, rememberCb?.checked);
                    });
                }

                // 2FA modal trigger
                window.addEventListener('auth:2fa_required', (e) => {
                    const modal2FA = document.getElementById('modal2FA');
                    if (modal2FA) {
                        modal2FA.classList.add('active');
                        const firstOtp = modal2FA.querySelector('.otp-field');
                        if (firstOtp) firstOtp.focus();
                    }
                });

                // Auto OTP box navigation
                const otpInputs = document.querySelectorAll('.otp-field');
                otpInputs.forEach((input, index) => {
                    input.addEventListener('input', (e) => {
                        if (e.target.value.length === 1 && index < otpInputs.length - 1) {
                            otpInputs[index + 1].focus();
                        }
                    });
                    input.addEventListener('keydown', (e) => {
                        if (e.key === 'Backspace' && !e.target.value && index > 0) {
                            otpInputs[index - 1].focus();
                        }
                    });
                });

                const btnVerify2FA = document.getElementById('btnVerify2FA');
                if (btnVerify2FA) {
                    btnVerify2FA.addEventListener('click', () => {
                        let code = '';
                        otpInputs.forEach(inp => code += inp.value);
                        const user = userInput?.value.trim() || 'player1';
                        this.verify2FA(user, code);
                    });
                }

                window.addEventListener('auth:success', () => {
                    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
                });

                // Modal triggers
                const linkForgot = document.getElementById('linkForgotPassword');
                const modalRecover = document.getElementById('modalRecover');
                const closeRecover = document.getElementById('closeRecoverBtn');
                const btnSendRecovery = document.getElementById('btnSendRecovery');

                if (linkForgot && modalRecover) {
                    linkForgot.addEventListener('click', (e) => { e.preventDefault(); modalRecover.classList.add('active'); });
                }
                if (closeRecover && modalRecover) {
                    closeRecover.addEventListener('click', () => modalRecover.classList.remove('active'));
                }
                if (btnSendRecovery) {
                    btnSendRecovery.addEventListener('click', () => {
                        const val = document.getElementById('recoverInput')?.value.trim();
                        if (val) this.forgotPassword(val);
                    });
                }

                const linkRegister = document.getElementById('linkRegister');
                const modalRegister = document.getElementById('modalRegister');
                const closeRegister = document.getElementById('closeRegisterBtn');
                const btnSubmitReg = document.getElementById('btnSubmitRegister');

                if (linkRegister && modalRegister) {
                    linkRegister.addEventListener('click', (e) => { e.preventDefault(); modalRegister.classList.add('active'); });
                }
                if (closeRegister && modalRegister) {
                    closeRegister.addEventListener('click', () => modalRegister.classList.remove('active'));
                }
                if (btnSubmitReg) {
                    btnSubmitReg.addEventListener('click', () => {
                        const email = document.getElementById('regEmail')?.value.trim();
                        const user = document.getElementById('regUsername')?.value.trim();
                        const pass = document.getElementById('regPassword')?.value;
                        if (email && user && pass && pass.length >= 8) {
                            this.createAccount(user, email, pass);
                        } else {
                            const err = window.i18n ? window.i18n.t('toast_empty_fields') : 'Preencha todos os campos (senha mín. 8 caracteres).';
                            if (window.showRiotToast) window.showRiotToast(err, 'error');
                        }
                    });
                }

                const close2FA = document.getElementById('close2FABtn');
                const modal2FA = document.getElementById('modal2FA');
                if (close2FA && modal2FA) {
                    close2FA.addEventListener('click', () => modal2FA.classList.remove('active'));
                }
            });
        }

        registerServiceWorker() {
            if ('serviceWorker' in navigator && (window.location.protocol.startsWith('http') || window.location.hostname === 'localhost')) {
                window.addEventListener('load', () => {
                    const swPath = window.location.pathname.includes('/index/') ? '../js/sw.js' : './sw.js';
                    navigator.serviceWorker.register(swPath)
                        .catch(() => navigator.serviceWorker.register('./js/sw.js'))
                        .then((reg) => {
                            if (reg && reg.onupdatefound) {
                                reg.onupdatefound = () => {
                                    const installingWorker = reg.installing;
                                    if (installingWorker) {
                                        installingWorker.onstatechange = () => {
                                            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                                if (window.showRiotToast) {
                                                    window.showRiotToast('Nova versão disponível (riot-portal-v2)!', 'info');
                                                }
                                            }
                                        };
                                    }
                                };
                            }
                        })
                        .catch(() => {});
                });
            }
        }
    }

    window.mockAuth = new MockAuthService();
})();
