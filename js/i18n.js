/**
 * Riot Games i18n & Internationalization Specialist Engine
 * Official Multilingual Architecture for Riot Client
 * Supported Languages:
 *   - pt-BR (Português do Brasil)
 *   - en-US (English - US)
 *   - es-ES (Español)
 *   - ja-JP (日本語)
 *   - ko-KR (한국어)
 *   - de-DE (Deutsch)
 * 
 * Features:
 *   - Native, authentic Riot Games terminology across all 6 locales
 *   - Complete coverage: Login, 2FA Modal, Captcha, Server Status, Shortcuts HUD, Error Toasts, Account Settings
 *   - Dynamic string interpolation: t('toast_theme_changed', { theme: 'VALORANT' })
 *   - Dual key alias support (camelCase and snake_case)
 *   - Instant DOM update for text, html, placeholders, titles, aria-labels and values
 *   - LocalStorage persistence & automatic browser language detection
 *   - Custom event dispatching ('riot-lang-changed', 'riotLangChanged')
 */

(function() {
    'use strict';

    const translations = {
        'pt-BR': {
            // 1. Language Info
            'lang_name': 'Português (BR)',
            'lang_flag': '🇧🇷',
            'lang_selector_label': 'Seletor de idioma do cliente',
            'theme_selector_label': 'Seletor de tema visual',

            // 2. Login & Main Interface
            'login': 'Fazer login',
            'title': 'Fazer login',
            'title_signin': 'Fazer login',
            'username': 'nome de usuário',
            'username_label': 'NOME DE USUÁRIO',
            'username_placeholder': 'Nome de usuário',
            'password': 'senha',
            'password_label': 'SENHA',
            'password_placeholder': 'Senha',
            'rememberMe': 'Manter login',
            'stay_signed_in': 'Manter login',
            'remember_login': 'Manter login',
            'cantSignIn': 'não consegue iniciar sessão?',
            'cant_sign_in': 'não consegue iniciar sessão?',
            'forgot_password': 'não consegue iniciar sessão?',
            'createAccount': 'criar conta',
            'create_account': 'criar conta',
            'register_link': 'criar conta',
            'capsWarning': 'Caps Lock ativado',
            'caps_warning': 'Caps Lock ativado',
            'caps_lock': 'Caps Lock ativado',
            'signin_aria': 'Confirmar login',
            'submit_button_aria': 'Confirmar login',
            'demo_fill': '⚡ Demo Fill',
            'demo_fill_btn': '⚡ Demo Fill',
            'demo_fill_tooltip': 'Auto-preencher credenciais de teste (player1 / password123)',
            'fullscreen_tooltip': 'Tela cheia (F11)',
            'audio_tooltip': 'Alternar som (Ctrl+M)',
            'show_password': 'Mostrar ou ocultar senha',
            'social_login': 'Opções de autenticação social',
            'social_login_heading': 'Ou entre com suas contas',
            'client_version': 'v2.5.0-production • Riot Client Engine',
            'view_bodyfit': 'Ver Projeto Bodyfit →',

            // 3. Social Providers
            'auth_facebook': 'Entrar com Facebook',
            'auth_google': 'Entrar com Google',
            'auth_apple': 'Entrar com Apple',
            'auth_xbox': 'Entrar com Xbox',
            'auth_playstation': 'Entrar com PlayStation Network',

            // 4. Two-Factor Authentication (2FA)
            'twoFactorTitle': 'Código de Segurança',
            '2fa_title': 'VERIFICAÇÃO EM DUAS ETAPAS',
            'twoFactorDesc': 'Um código de 6 dígitos foi enviado para o seu e-mail ou autenticador Riot.',
            '2fa_subtitle': 'Digite o código de verificação enviado para o seu e-mail.',
            'verifyCode': 'Verificar e Entrar',
            '2fa_verify': 'Verificar',
            '2fa_placeholder': '000000',
            '2fa_resend': 'Reenviar código',
            '2fa_resend_countdown': 'Reenviar código em {time}s',
            '2fa_code_sent': 'Novo código enviado com sucesso!',
            '2fa_invalid_code': 'Código de segurança incorreto ou expirado.',

            // 5. Account Recovery
            'recoverTitle': 'Recuperar Conta',
            'recovery_title': 'RECUPERAÇÃO DE CONTA',
            'recoverDesc': 'Insira seu e-mail cadastrado ou nome de usuário para enviarmos as instruções de redefinição.',
            'recovery_subtitle': 'Insira seu nome de usuário ou e-mail para redefinir a senha.',
            'recover_placeholder': 'nome@exemplo.com ou Usuário',
            'sendInstructions': 'Enviar Instruções',
            'recovery_submit': 'Enviar link de recuperação',
            'back_to_login': 'Voltar ao login',
            'support_links': 'Suporte e Ajuda',

            // 6. Create Account (Registration)
            'registerTitle': 'Criar Riot ID',
            'registerDesc': 'Crie sua conta para jogar League of Legends, Valorant, TFT e muito mais.',
            'regEmailPlaceholder': 'E-mail',
            'regUsernamePlaceholder': 'Nome de Usuário',
            'regPasswordPlaceholder': 'Senha (mínimo 8 caracteres)',
            'createMyAccount': 'Criar Minha Conta',

            // 7. Captcha & Security Challenge
            'captcha_title': 'Verificação de Segurança',
            'captcha_instruction': 'Por favor, complete a verificação para continuar o acesso à sua conta Riot.',
            'captcha_checkbox': 'Eu sou humano',
            'captcha_verifying': 'Verificando autenticidade...',
            'captcha_success': 'Verificação concluída com sucesso!',
            'captcha_failed': 'Falha na verificação. Tente novamente.',
            'captcha_reload': 'Atualizar desafio',
            'captcha_submit': 'Confirmar Verificação',
            'captcha_help': 'Esta proteção impede acessos automatizados indesejados à sua conta.',

            // 8. Server Status
            'server_status_title': 'Status dos Servidores Riot',
            'server_status_btn': 'Status',
            'server_status_all_operational': 'Todos os serviços operacionais',
            'server_status_operational': 'Operacional',
            'server_status_degraded': 'Instabilidade',
            'server_status_maintenance': 'Manutenção programada',
            'server_status_offline': 'Offline',
            'server_region_br': 'Brasil (BR - São Paulo)',
            'server_region_na': 'América do Norte (NA - Chicago)',
            'server_region_euw': 'Europa Ocidental (EUW - Frankfurt)',
            'server_region_kr': 'Coreia do Sul (KR - Seul)',
            'server_region_jp': 'Japão (JP - Tóquio)',
            'server_latency': 'Latência: {ping}ms',
            'server_refresh': 'Atualizar status',
            'server_last_checked': 'Última verificação: agora mesmo',

            // 9. Shortcuts HUD
            'shortcuts_title': 'Atalhos de Teclado',
            'shortcuts_btn': 'Atalhos',
            'shortcuts_subtitle': 'Navegue pelo Riot Client rapidamente usando atalhos do teclado',
            'shortcuts_theme': 'Alternar temas visuais (Riot, Valorant, LoL, TFT)',
            'shortcuts_lang': 'Alternar idioma da interface ciclicamente',
            'shortcuts_audio': 'Ativar ou silenciar efeitos sonoros (SFX)',
            'shortcuts_fullscreen': 'Entrar ou sair do modo de tela cheia',
            'shortcuts_escape': 'Fechar janelas modais ativas',
            'shortcuts_demo': 'Auto-preencher credenciais de teste demo',
            'shortcuts_shortcuts_hud': 'Abrir/Fechar este painel de atalhos',

            // 10. Account Settings
            'settings_title': 'Configurações da Conta',
            'settings_btn': 'Configurações',
            'settings_subtitle': 'Personalize preferências de idioma, temas visuais e experiência de áudio.',
            'settings_language': 'Idioma do Cliente',
            'settings_theme': 'Tema Visual',
            'settings_audio': 'Efeitos Sonoros (SFX)',
            'settings_sound_enabled': 'Habilitar Efeitos Sonoros',
            'settings_sound_volume': 'Volume Geral',
            'settings_save': 'Salvar Preferências',
            'settings_saved': 'Preferências salvas com sucesso!',
            'settings_reset': 'Restaurar Padrões',
            'settings_close': 'Fechar',

            // 11. Error Toasts & Notifications
            'toast_login_success': 'Bem-vindo, {username}! Login realizado com sucesso.',
            'toast_invalid_credentials': 'Nome de usuário ou senha incorretos.',
            'error_invalid_credentials': 'Nome de usuário ou senha inválidos.',
            'toast_empty_fields': 'Preencha todos os campos (senha mín. 8 caracteres).',
            'error_empty_fields': 'Preencha todos os campos.',
            'toast_network_error': 'Erro de conexão. Verifique sua rede e tente novamente.',
            'error_network': 'Erro de conexão. Tente novamente.',
            'toast_2fa_sent': 'Código 2FA enviado para {email} (Dica: 123456)',
            'toast_2fa_incorrect': 'Código de segurança incorreto. Tente novamente.',
            'toast_account_created': 'Conta Riot ID criada com sucesso! Faça login.',
            'toast_user_exists': 'Este nome de usuário já está em uso.',
            'toast_recovery_sent': 'Instruções de redefinição enviadas para {email}',
            'toast_recovery_not_found': 'Conta ou e-mail não encontrado.',
            'toast_fullscreen_on': 'Modo Tela Cheia Ativado',
            'toast_fullscreen_off': 'Modo Tela Cheia Desativado',
            'toast_audio_muted': 'Efeitos sonoros desativados (Mudo)',
            'toast_audio_unmuted': 'Efeitos sonoros ativados',
            'toast_theme_changed': 'Tema alterado: {theme}',
            'toast_lang_changed': 'Idioma alterado: {lang}',
            'toast_demo_filled': 'Credenciais Demo preenchidas! Código 2FA: 123456',
            'toast_social_linked': 'Autenticação ({provider}) vinculada com sucesso!',
            'close': 'Fechar',
            'close_aria': 'Fechar janela modal'
        },

        'en-US': {
            // 1. Language Info
            'lang_name': 'English (US)',
            'lang_flag': '🇺🇸',
            'lang_selector_label': 'Client language selector',
            'theme_selector_label': 'Interface theme selector',

            // 2. Login & Main Interface
            'login': 'Sign In',
            'title': 'Sign In',
            'title_signin': 'Sign In',
            'username': 'username',
            'username_label': 'USERNAME',
            'username_placeholder': 'Username',
            'password': 'password',
            'password_label': 'PASSWORD',
            'password_placeholder': 'Password',
            'rememberMe': 'Stay signed in',
            'stay_signed_in': 'Stay signed in',
            'remember_login': 'Stay signed in',
            'cantSignIn': "can't sign in?",
            'cant_sign_in': "Can't sign in?",
            'forgot_password': "Can't sign in?",
            'createAccount': 'create account',
            'create_account': 'Create account',
            'register_link': 'create account',
            'capsWarning': 'Caps Lock is on',
            'caps_warning': 'Caps Lock is on',
            'caps_lock': 'Caps Lock is on',
            'signin_aria': 'Confirm Sign In',
            'submit_button_aria': 'Confirm Sign In',
            'demo_fill': '⚡ Demo Fill',
            'demo_fill_btn': '⚡ Demo Fill',
            'demo_fill_tooltip': 'Auto-fill test credentials (player1 / password123)',
            'fullscreen_tooltip': 'Fullscreen (F11)',
            'audio_tooltip': 'Toggle sound (Ctrl+M)',
            'show_password': 'Show or hide password',
            'social_login': 'Social authentication options',
            'social_login_heading': 'Or sign in with',
            'client_version': 'v2.5.0-production • Riot Client Engine',
            'view_bodyfit': 'View Bodyfit Project →',

            // 3. Social Providers
            'auth_facebook': 'Sign in with Facebook',
            'auth_google': 'Sign in with Google',
            'auth_apple': 'Sign in with Apple',
            'auth_xbox': 'Sign in with Xbox',
            'auth_playstation': 'Sign in with PlayStation Network',

            // 4. Two-Factor Authentication (2FA)
            'twoFactorTitle': 'Security Code',
            '2fa_title': 'TWO-FACTOR VERIFICATION',
            'twoFactorDesc': 'A 6-digit code has been sent to your email or Riot Authenticator.',
            '2fa_subtitle': 'Enter the verification code sent to your email.',
            'verifyCode': 'Verify & Sign In',
            '2fa_verify': 'Verify',
            '2fa_placeholder': '000000',
            '2fa_resend': 'Resend code',
            '2fa_resend_countdown': 'Resend code in {time}s',
            '2fa_code_sent': 'New verification code sent successfully!',
            '2fa_invalid_code': 'Incorrect or expired security code.',

            // 5. Account Recovery
            'recoverTitle': 'Account Recovery',
            'recovery_title': 'ACCOUNT RECOVERY',
            'recoverDesc': "Enter your registered email or username and we'll send reset instructions.",
            'recovery_subtitle': 'Enter your username or email to reset your password.',
            'recover_placeholder': 'name@example.com or Username',
            'sendInstructions': 'Send Instructions',
            'recovery_submit': 'Send recovery link',
            'back_to_login': 'Return to sign in',
            'support_links': 'Support & Help',

            // 6. Create Account (Registration)
            'registerTitle': 'Create Riot ID',
            'registerDesc': 'Create your account to play League of Legends, Valorant, TFT, and more.',
            'regEmailPlaceholder': 'Email',
            'regUsernamePlaceholder': 'Username',
            'regPasswordPlaceholder': 'Password (min. 8 characters)',
            'createMyAccount': 'Create My Account',

            // 7. Captcha & Security Challenge
            'captcha_title': 'Security Verification',
            'captcha_instruction': 'Please complete the verification to continue accessing your Riot account.',
            'captcha_checkbox': 'I am human',
            'captcha_verifying': 'Verifying authenticity...',
            'captcha_success': 'Verification completed successfully!',
            'captcha_failed': 'Verification failed. Please try again.',
            'captcha_reload': 'Reload challenge',
            'captcha_submit': 'Confirm Verification',
            'captcha_help': 'This challenge protects your Riot account against automated unauthorized access.',

            // 8. Server Status
            'server_status_title': 'Riot Server Status',
            'server_status_btn': 'Server Status',
            'server_status_all_operational': 'All Systems Operational',
            'server_status_operational': 'Operational',
            'server_status_degraded': 'Degraded Performance',
            'server_status_maintenance': 'Scheduled Maintenance',
            'server_status_offline': 'Offline',
            'server_region_br': 'Brazil (BR - São Paulo)',
            'server_region_na': 'North America (NA - Chicago)',
            'server_region_euw': 'Europe West (EUW - Frankfurt)',
            'server_region_kr': 'South Korea (KR - Seoul)',
            'server_region_jp': 'Japan (JP - Tokyo)',
            'server_latency': 'Latency: {ping}ms',
            'server_refresh': 'Refresh status',
            'server_last_checked': 'Last checked: just now',

            // 9. Shortcuts HUD
            'shortcuts_title': 'Keyboard Shortcuts',
            'shortcuts_btn': 'Shortcuts',
            'shortcuts_subtitle': 'Quickly navigate the Riot Client using keyboard shortcuts',
            'shortcuts_theme': 'Cycle visual themes (Riot, Valorant, LoL, TFT)',
            'shortcuts_lang': 'Cycle client interface language',
            'shortcuts_audio': 'Toggle sound effects (SFX) mute',
            'shortcuts_fullscreen': 'Enter or exit fullscreen mode',
            'shortcuts_escape': 'Close any open modal window',
            'shortcuts_demo': 'Auto-fill demo test credentials',
            'shortcuts_shortcuts_hud': 'Open/Close this shortcuts guide',

            // 10. Account Settings
            'settings_title': 'Account Settings',
            'settings_btn': 'Settings',
            'settings_subtitle': 'Configure language, theme, and audio preferences.',
            'settings_language': 'Client Language',
            'settings_theme': 'Interface Theme',
            'settings_audio': 'Sound Effects (SFX)',
            'settings_sound_enabled': 'Enable Sound Effects',
            'settings_sound_volume': 'Master Volume',
            'settings_save': 'Save Preferences',
            'settings_saved': 'Preferences saved successfully!',
            'settings_reset': 'Restore Defaults',
            'settings_close': 'Close',

            // 11. Error Toasts & Notifications
            'toast_login_success': 'Welcome, {username}! Signed in successfully.',
            'toast_invalid_credentials': 'Invalid username or password.',
            'error_invalid_credentials': 'Invalid username or password.',
            'toast_empty_fields': 'Please fill in all fields (password min. 8 characters).',
            'error_empty_fields': 'Please fill in all fields.',
            'toast_network_error': 'Connection error. Please check your network and try again.',
            'error_network': 'Connection error. Please try again.',
            'toast_2fa_sent': '2FA code sent to {email} (Hint: 123456)',
            'toast_2fa_incorrect': 'Incorrect security code. Please try again.',
            'toast_account_created': 'Riot ID account created successfully! Sign in now.',
            'toast_user_exists': 'This username is already taken.',
            'toast_recovery_sent': 'Reset instructions sent to {email}',
            'toast_recovery_not_found': 'Account or email not found in our system.',
            'toast_fullscreen_on': 'Fullscreen Mode Activated',
            'toast_fullscreen_off': 'Fullscreen Mode Deactivated',
            'toast_audio_muted': 'Sound effects muted',
            'toast_audio_unmuted': 'Sound effects enabled',
            'toast_theme_changed': 'Theme changed to: {theme}',
            'toast_lang_changed': 'Language changed to: {lang}',
            'toast_demo_filled': 'Demo credentials filled! 2FA Code: 123456',
            'toast_social_linked': 'Authentication ({provider}) connected successfully!',
            'close': 'Close',
            'close_aria': 'Close modal window'
        },

        'es-ES': {
            // 1. Language Info
            'lang_name': 'Español (ES)',
            'lang_flag': '🇪🇸',
            'lang_selector_label': 'Selector de idioma del cliente',
            'theme_selector_label': 'Selector de tema de interfaz',

            // 2. Login & Main Interface
            'login': 'Iniciar sesión',
            'title': 'Iniciar sesión',
            'title_signin': 'Iniciar sesión',
            'username': 'nombre de usuario',
            'username_label': 'NOMBRE DE USUARIO',
            'username_placeholder': 'Nombre de usuario',
            'password': 'contraseña',
            'password_label': 'CONTRASEÑA',
            'password_placeholder': 'Contraseña',
            'rememberMe': 'No cerrar sesión',
            'stay_signed_in': 'No cerrar sesión',
            'remember_login': 'No cerrar sesión',
            'cantSignIn': '¿no puedes iniciar sesión?',
            'cant_sign_in': '¿No puedes iniciar sesión?',
            'forgot_password': '¿No puedes iniciar sesión?',
            'createAccount': 'crear cuenta',
            'create_account': 'Crear cuenta',
            'register_link': 'crear cuenta',
            'capsWarning': 'Bloq Mayús activado',
            'caps_warning': 'Bloq Mayús activado',
            'caps_lock': 'Bloq Mayús activado',
            'signin_aria': 'Confirmar inicio de sesión',
            'submit_button_aria': 'Confirmar inicio de sesión',
            'demo_fill': '⚡ Demo Fill',
            'demo_fill_btn': '⚡ Demo Fill',
            'demo_fill_tooltip': 'Rellenar automáticamente credenciales de prueba (player1 / password123)',
            'fullscreen_tooltip': 'Pantalla completa (F11)',
            'audio_tooltip': 'Alternar sonido (Ctrl+M)',
            'show_password': 'Mostrar u ocultar contraseña',
            'social_login': 'Opciones de autenticación social',
            'social_login_heading': 'O inicia sesión con',
            'client_version': 'v2.5.0-production • Riot Client Engine',
            'view_bodyfit': 'Ver Proyecto Bodyfit →',

            // 3. Social Providers
            'auth_facebook': 'Iniciar sesión con Facebook',
            'auth_google': 'Iniciar sesión con Google',
            'auth_apple': 'Iniciar sesión con Apple',
            'auth_xbox': 'Iniciar sesión con Xbox',
            'auth_playstation': 'Iniciar sesión con PlayStation Network',

            // 4. Two-Factor Authentication (2FA)
            'twoFactorTitle': 'Código de Seguridad',
            '2fa_title': 'VERIFICACIÓN EN DOS PASOS',
            'twoFactorDesc': 'Se ha enviado un código de 6 dígitos a tu correo o autenticador Riot.',
            '2fa_subtitle': 'Introduce el código de verificación enviado a tu correo.',
            'verifyCode': 'Verificar e Iniciar',
            '2fa_verify': 'Verificar',
            '2fa_placeholder': '000000',
            '2fa_resend': 'Reenviar código',
            '2fa_resend_countdown': 'Reenviar código en {time}s',
            '2fa_code_sent': '¡Nuevo código de verificación enviado!',
            '2fa_invalid_code': 'Código de seguridad incorrecto o caducado.',

            // 5. Account Recovery
            'recoverTitle': 'Recuperar Cuenta',
            'recovery_title': 'RECUPERACIÓN DE CUENTA',
            'recoverDesc': 'Introduce tu correo registrado o nombre de usuario para enviar las instrucciones de restablecimiento.',
            'recovery_subtitle': 'Introduce tu nombre de usuario o correo para restablecer la contraseña.',
            'recover_placeholder': 'nombre@ejemplo.com o Usuario',
            'sendInstructions': 'Enviar Instrucciones',
            'recovery_submit': 'Enviar enlace de recuperación',
            'back_to_login': 'Volver a iniciar sesión',
            'support_links': 'Soporte y Ayuda',

            // 6. Create Account (Registration)
            'registerTitle': 'Crear Riot ID',
            'registerDesc': 'Crea tu cuenta para jugar a League of Legends, Valorant, TFT y más.',
            'regEmailPlaceholder': 'Correo electrónico',
            'regUsernamePlaceholder': 'Nombre de usuario',
            'regPasswordPlaceholder': 'Contraseña (mínimo 8 caracteres)',
            'createMyAccount': 'Crear Mi Cuenta',

            // 7. Captcha & Security Challenge
            'captcha_title': 'Verificación de Seguridad',
            'captcha_instruction': 'Por favor, completa la verificación para continuar accediendo a tu cuenta.',
            'captcha_checkbox': 'Soy humano',
            'captcha_verifying': 'Verificando autenticidad...',
            'captcha_success': '¡Verificación completada con éxito!',
            'captcha_failed': 'Error de verificación. Inténtalo de nuevo.',
            'captcha_reload': 'Recargar desafío',
            'captcha_submit': 'Confirmar Verificación',
            'captcha_help': 'Esta medida protege tu cuenta Riot frente a accesos automatizados no autorizados.',

            // 8. Server Status
            'server_status_title': 'Estado de los Servidores Riot',
            'server_status_btn': 'Estado',
            'server_status_all_operational': 'Todos los sistemas operativos',
            'server_status_operational': 'Operativo',
            'server_status_degraded': 'Rendimiento degradado',
            'server_status_maintenance': 'Mantenimiento programado',
            'server_status_offline': 'Desconectado',
            'server_region_br': 'Brasil (BR - São Paulo)',
            'server_region_na': 'Norteamérica (NA - Chicago)',
            'server_region_euw': 'Europa Oeste (EUW - Fráncfort)',
            'server_region_kr': 'Corea del Sur (KR - Seúl)',
            'server_region_jp': 'Japón (JP - Tokio)',
            'server_latency': 'Latencia: {ping}ms',
            'server_refresh': 'Actualizar estado',
            'server_last_checked': 'Última comprobación: hace un momento',

            // 9. Shortcuts HUD
            'shortcuts_title': 'Atajos de Teclado',
            'shortcuts_btn': 'Atajos',
            'shortcuts_subtitle': 'Navega rápidamente por el Riot Client usando tu teclado',
            'shortcuts_theme': 'Cambiar temas visuales (Riot, Valorant, LoL, TFT)',
            'shortcuts_lang': 'Cambiar cíclicamente el idioma de la interfaz',
            'shortcuts_audio': 'Activar o silenciar efectos de sonido (SFX)',
            'shortcuts_fullscreen': 'Activar o salir del modo pantalla completa',
            'shortcuts_escape': 'Cerrar ventanas modales activas',
            'shortcuts_demo': 'Rellenar automáticamente credenciales de prueba demo',
            'shortcuts_shortcuts_hud': 'Abrir/Cerrar esta guía de atajos',

            // 10. Account Settings
            'settings_title': 'Configuración de la Cuenta',
            'settings_btn': 'Configuración',
            'settings_subtitle': 'Personaliza tus preferencias de idioma, temas visuales y sonido.',
            'settings_language': 'Idioma del Cliente',
            'settings_theme': 'Tema Visual',
            'settings_audio': 'Efectos de Sonido (SFX)',
            'settings_sound_enabled': 'Habilitar Efectos de Sonido',
            'settings_sound_volume': 'Volumen General',
            'settings_save': 'Guardar Preferencias',
            'settings_saved': '¡Preferencias guardadas con éxito!',
            'settings_reset': 'Restablecer Valores',
            'settings_close': 'Cerrar',

            // 11. Error Toasts & Notifications
            'toast_login_success': '¡Bienvenido, {username}! Sesión iniciada con éxito.',
            'toast_invalid_credentials': 'Nombre de usuario o contraseña incorrectos.',
            'error_invalid_credentials': 'Nombre de usuario o contraseña inválidos.',
            'toast_empty_fields': 'Por favor, rellene todos los campos (contraseña mín. 8 caracteres).',
            'error_empty_fields': 'Por favor, rellene todos los campos.',
            'toast_network_error': 'Error de conexión. Comprueba tu red e inténtalo de nuevo.',
            'error_network': 'Error de conexión. Inténtelo de nuevo.',
            'toast_2fa_sent': 'Código 2FA enviado a {email} (Pista: 123456)',
            'toast_2fa_incorrect': 'Código de seguridad incorrecto. Inténtelo de nuevo.',
            'toast_account_created': '¡Cuenta Riot ID creada con éxito! Inicia sesión.',
            'toast_user_exists': 'Este nombre de usuario ya está en uso.',
            'toast_recovery_sent': 'Instrucciones de recuperación enviadas a {email}',
            'toast_recovery_not_found': 'Cuenta o correo no encontrado en el sistema.',
            'toast_fullscreen_on': 'Modo Pantalla Completa Activado',
            'toast_fullscreen_off': 'Modo Pantalla Completa Desactivado',
            'toast_audio_muted': 'Efectos de sonido silenciados',
            'toast_audio_unmuted': 'Efectos de sonido activados',
            'toast_theme_changed': 'Tema cambiado a: {theme}',
            'toast_lang_changed': 'Idioma cambiado a: {lang}',
            'toast_demo_filled': '¡Credenciales demo rellenadas! Código 2FA: 123456',
            'toast_social_linked': '¡Autenticación ({provider}) vinculada con éxito!',
            'close': 'Cerrar',
            'close_aria': 'Cerrar ventana modal'
        },

        'ja-JP': {
            // 1. Language Info
            'lang_name': '日本語 (JA)',
            'lang_flag': '🇯🇵',
            'lang_selector_label': 'クライアント言語の選択',
            'theme_selector_label': 'UIテーマの選択',

            // 2. Login & Main Interface
            'login': 'サインイン',
            'title': 'サインイン',
            'title_signin': 'サインイン',
            'username': 'ユーザー名',
            'username_label': 'ユーザー名',
            'username_placeholder': 'ユーザー名',
            'password': 'パスワード',
            'password_label': 'パスワード',
            'password_placeholder': 'パスワード',
            'rememberMe': 'サインイン状態を保持',
            'stay_signed_in': 'サインインしたままにする',
            'remember_login': 'サインイン状態を保持',
            'cantSignIn': 'サインインできませんか？',
            'cant_sign_in': 'サインインできませんか？',
            'forgot_password': 'サインインできませんか？',
            'createAccount': 'アカウント作成',
            'create_account': 'アカウント作成',
            'register_link': 'アカウント作成',
            'capsWarning': 'Caps Lockがオンです',
            'caps_warning': 'Caps Lockがオンです',
            'caps_lock': 'Caps Lockがオンです',
            'signin_aria': 'サインインを実行',
            'submit_button_aria': 'サインインを実行',
            'demo_fill': '⚡ デモ入力',
            'demo_fill_btn': '⚡ デモ入力',
            'demo_fill_tooltip': 'テスト用認証情報を自動入力 (player1 / password123)',
            'fullscreen_tooltip': '全画面表示 (F11)',
            'audio_tooltip': '音声ミュート切替 (Ctrl+M)',
            'show_password': 'パスワードの表示/非表示',
            'social_login': 'ソーシャルサインインの選択肢',
            'social_login_heading': 'または以下でサインイン',
            'client_version': 'v2.5.0-production • Riot Client Engine',
            'view_bodyfit': 'Bodyfit プロジェクトを見る →',

            // 3. Social Providers
            'auth_facebook': 'Facebookでサインイン',
            'auth_google': 'Googleでサインイン',
            'auth_apple': 'Appleでサインイン',
            'auth_xbox': 'Xboxでサインイン',
            'auth_playstation': 'PlayStation Networkでサインイン',

            // 4. Two-Factor Authentication (2FA)
            'twoFactorTitle': 'セキュリティコード',
            '2fa_title': '二段階認証',
            'twoFactorDesc': 'メールまたはRiot認証アプリに6桁の確認コードを送信しました。',
            '2fa_subtitle': 'メールに送信された確認コードを入力してください。',
            'verifyCode': '認証してサインイン',
            '2fa_verify': '確認',
            '2fa_placeholder': '000000',
            '2fa_resend': 'コードを再送信',
            '2fa_resend_countdown': '{time}秒後に再送信可能',
            '2fa_code_sent': '新しい確認コードを送信しました！',
            '2fa_invalid_code': 'セキュリティコードが正しくないか、有効期限が切れています。',

            // 5. Account Recovery
            'recoverTitle': 'アカウント復元',
            'recovery_title': 'アカウントの復元',
            'recoverDesc': '登録済みのメールアドレスまたはユーザー名を入力して、パスワード再設定手順を受け取ってください。',
            'recovery_subtitle': 'パスワードをリセットするには、ユーザー名またはメールアドレスを入力してください。',
            'recover_placeholder': 'name@example.com またはユーザー名',
            'sendInstructions': '再設定手順を送信',
            'recovery_submit': '復旧リンクを送信',
            'back_to_login': 'サインインに戻る',
            'support_links': 'サポート & ヘルプ',

            // 6. Create Account (Registration)
            'registerTitle': 'Riot IDの作成',
            'registerDesc': 'アカウントを作成して、リーグ・オブ・レジェンド、VALORANT、TFTなどをプレイしましょう。',
            'regEmailPlaceholder': 'メールアドレス',
            'regUsernamePlaceholder': 'ユーザー名',
            'regPasswordPlaceholder': 'パスワード（8文字以上）',
            'createMyAccount': 'アカウントを作成する',

            // 7. Captcha & Security Challenge
            'captcha_title': 'セキュリティ認証',
            'captcha_instruction': 'アカウントにアクセスするには、セキュリティ認証を完了してください。',
            'captcha_checkbox': '私はロボットではありません',
            'captcha_verifying': '認証中...',
            'captcha_success': '認証が正常に完了しました！',
            'captcha_failed': '認証に失敗しました。もう一度お試しください。',
            'captcha_reload': '認証を再読み込み',
            'captcha_submit': '認証を確認',
            'captcha_help': 'この認証は不正な自動アクセスからRiotアカウントを保護します。',

            // 8. Server Status
            'server_status_title': 'Riotサーバー稼働状況',
            'server_status_btn': '稼働状況',
            'server_status_all_operational': 'すべてのシステムが正常稼働中',
            'server_status_operational': '正常稼働中',
            'server_status_degraded': 'パフォーマンス低下',
            'server_status_maintenance': '定期メンテナンス中',
            'server_status_offline': 'オフライン',
            'server_region_br': 'ブラジル (BR - サンパウロ)',
            'server_region_na': '北アメリカ (NA - シカゴ)',
            'server_region_euw': '西ヨーロッパ (EUW - フランクフルト)',
            'server_region_kr': '韓国 (KR - ソウル)',
            'server_region_jp': '日本 (JP - 東京)',
            'server_latency': 'レイテンシ: {ping}ms',
            'server_refresh': '状態を更新',
            'server_last_checked': '最終確認: たった今',

            // 9. Shortcuts HUD
            'shortcuts_title': 'キーボードショートカット',
            'shortcuts_btn': 'ショートカット',
            'shortcuts_subtitle': 'キーボードを使ってRiot Clientを快適に操作できます',
            'shortcuts_theme': 'テーマの切り替え (Riot, Valorant, LoL, TFT)',
            'shortcuts_lang': 'インターフェース言語を順次切り替え',
            'shortcuts_audio': '効果音（SFX）のミュート切り替え',
            'shortcuts_fullscreen': '全画面表示の切り替え',
            'shortcuts_escape': '開いているモーダルウィンドウを閉じる',
            'shortcuts_demo': 'デモ用認証情報の自動入力',
            'shortcuts_shortcuts_hud': 'ショートカットガイドの表示/非表示',

            // 10. Account Settings
            'settings_title': 'アカウント設定',
            'settings_btn': '設定',
            'settings_subtitle': '言語、デザインテーマ、効果音の設定をカスタマイズします。',
            'settings_language': 'クライアント言語',
            'settings_theme': 'UIテーマ',
            'settings_audio': '効果音 (SFX)',
            'settings_sound_enabled': '効果音を有効にする',
            'settings_sound_volume': 'マスター音量',
            'settings_save': '設定を保存',
            'settings_saved': '設定が正常に保存されました！',
            'settings_reset': 'デフォルトに戻す',
            'settings_close': '閉じる',

            // 11. Error Toasts & Notifications
            'toast_login_success': 'お帰りなさい、{username}！サインインしました。',
            'toast_invalid_credentials': 'ユーザー名またはパスワードが無効です。',
            'error_invalid_credentials': 'ユーザー名またはパスワードが無効です。',
            'toast_empty_fields': 'すべての項目を入力してください（パスワードは8文字以上）。',
            'error_empty_fields': 'すべての項目を入力してください。',
            'toast_network_error': 'ネットワークエラーです。接続を確認して再試行してください。',
            'error_network': '接続エラーが発生しました。もう一度お試しください。',
            'toast_2fa_sent': '2FAコードを {email} に送信しました（ヒント: 123456）',
            'toast_2fa_incorrect': 'セキュリティコードが正しくありません。再試行してください。',
            'toast_account_created': 'Riot IDアカウントが作成されました！サインインしてください。',
            'toast_user_exists': 'このユーザー名は既に使用されています。',
            'toast_recovery_sent': '{email} に復元手順を送信しました',
            'toast_recovery_not_found': 'アカウントまたはメールが見つかりませんでした。',
            'toast_fullscreen_on': '全画面表示を有効にしました',
            'toast_fullscreen_off': '全画面表示を解除しました',
            'toast_audio_muted': '効果音をミュートしました',
            'toast_audio_unmuted': '効果音を有効にしました',
            'toast_theme_changed': 'テーマを変更: {theme}',
            'toast_lang_changed': '言語を変更: {lang}',
            'toast_demo_filled': 'デモ情報を入力しました！2FAコード: 123456',
            'toast_social_linked': '（{provider}）認証が正常に連携されました！',
            'close': '閉じる',
            'close_aria': 'モーダルウィンドウを閉じる'
        },

        'ko-KR': {
            // 1. Language Info
            'lang_name': '한국어 (KO)',
            'lang_flag': '🇰🇷',
            'lang_selector_label': '클라이언트 언어 선택',
            'theme_selector_label': '인터페이스 테마 선택',

            // 2. Login & Main Interface
            'login': '로그인',
            'title': '로그인',
            'title_signin': '로그인',
            'username': '사용자 이름',
            'username_label': '사용자 이름',
            'username_placeholder': '사용자 이름',
            'password': '비밀번호',
            'password_label': '비밀번호',
            'password_placeholder': '비밀번호',
            'rememberMe': '로그인 상태 유지',
            'stay_signed_in': '로그인 상태 유지',
            'remember_login': '로그인 상태 유지',
            'cantSignIn': '로그인할 수 없나요?',
            'cant_sign_in': '로그인할 수 없나요?',
            'forgot_password': '로그인할 수 없나요?',
            'createAccount': '계정 만들기',
            'create_account': '계정 만들기',
            'register_link': '계정 만들기',
            'capsWarning': 'Caps Lock이 켜져 있습니다',
            'caps_warning': 'Caps Lock이 켜져 있습니다',
            'caps_lock': 'Caps Lock이 켜져 있습니다',
            'signin_aria': '로그인 확인',
            'submit_button_aria': '로그인 확인',
            'demo_fill': '⚡ 데모 입력',
            'demo_fill_btn': '⚡ 데모 입력',
            'demo_fill_tooltip': '테스트 계정 정보 자동 입력 (player1 / password123)',
            'fullscreen_tooltip': '전체 화면 (F11)',
            'audio_tooltip': '오디오 음소거 토글 (Ctrl+M)',
            'show_password': '비밀번호 표시/숨기기',
            'social_login': '소셜 계정으로 로그인',
            'social_login_heading': '또는 다음으로 로그인',
            'client_version': 'v2.5.0-production • Riot Client Engine',
            'view_bodyfit': 'Bodyfit 프로젝트 보기 →',

            // 3. Social Providers
            'auth_facebook': 'Facebook으로 로그인',
            'auth_google': 'Google로 로그인',
            'auth_apple': 'Apple로 로그인',
            'auth_xbox': 'Xbox로 로그인',
            'auth_playstation': 'PlayStation Network로 로그인',

            // 4. Two-Factor Authentication (2FA)
            'twoFactorTitle': '보안 인증 코드',
            '2fa_title': '2단계 보안 인증',
            'twoFactorDesc': '등록된 이메일 또는 Riot 모바일 인증 앱으로 6자리 인증 코드가 전송되었습니다.',
            '2fa_subtitle': '이메일로 전송된 인증 코드를 입력하세요.',
            'verifyCode': '인증 및 로그인',
            '2fa_verify': '확인',
            '2fa_placeholder': '000000',
            '2fa_resend': '코드 재전송',
            '2fa_resend_countdown': '{time}초 후 재전송 가능',
            '2fa_code_sent': '새로운 인증 코드가 전송되었습니다!',
            '2fa_invalid_code': '보안 코드가 올바르지 않거나 만료되었습니다.',

            // 5. Account Recovery
            'recoverTitle': '계정 복구',
            'recovery_title': '계정 복구',
            'recoverDesc': '등록된 이메일 또는 사용자 이름을 입력하시면 비밀번호 재설정 링크를 보내드립니다.',
            'recovery_subtitle': '비밀번호를 재설정하려면 사용자 이름이나 이메일을 입력하세요.',
            'recover_placeholder': 'name@example.com 또는 사용자 이름',
            'sendInstructions': '재설정 안내 전송',
            'recovery_submit': '복구 링크 전송',
            'back_to_login': '로그인으로 돌아가기',
            'support_links': '고객지원 및 도움말',

            // 6. Create Account (Registration)
            'registerTitle': 'Riot ID 생성',
            'registerDesc': '계정을 생성하여 리그 오브 레전드, 발로란트, TFT 등을 플레이하세요.',
            'regEmailPlaceholder': '이메일',
            'regUsernamePlaceholder': '사용자 이름',
            'regPasswordPlaceholder': '비밀번호 (8자 이상)',
            'createMyAccount': '내 계정 만들기',

            // 7. Captcha & Security Challenge
            'captcha_title': '보안 인증',
            'captcha_instruction': '계정에 접근하려면 보안 인증을 완료해 주세요.',
            'captcha_checkbox': '로봇이 아닙니다',
            'captcha_verifying': '인증 확인 중...',
            'captcha_success': '보안 인증이 완료되었습니다!',
            'captcha_failed': '인증 실패. 다시 시도해 주세요.',
            'captcha_reload': '새로고침',
            'captcha_submit': '인증 확인',
            'captcha_help': '자동화된 공격으로부터 귀하의 Riot 계정을 안전하게 보호합니다.',

            // 8. Server Status
            'server_status_title': 'Riot 서버 상태',
            'server_status_btn': '서버 상태',
            'server_status_all_operational': '모든 시스템 정상 작동 중',
            'server_status_operational': '정상 작동',
            'server_status_degraded': '성능 저하',
            'server_status_maintenance': '정기 점검 중',
            'server_status_offline': '오프라인',
            'server_region_br': '브라질 (BR - 상파울루)',
            'server_region_na': '북미 (NA - 시카고)',
            'server_region_euw': '서유럽 (EUW - 프랑크푸르트)',
            'server_region_kr': '대한민국 (KR - 서울)',
            'server_region_jp': '일본 (JP - 도쿄)',
            'server_latency': '지연 시간: {ping}ms',
            'server_refresh': '상태 새로고침',
            'server_last_checked': '마지막 확인: 방금 전',

            // 9. Shortcuts HUD
            'shortcuts_title': '키보드 단축키',
            'shortcuts_btn': '단축키',
            'shortcuts_subtitle': '키보드 단축키로 신속하게 Riot Client를 탐색하세요',
            'shortcuts_theme': '비주얼 테마 순환 (Riot, Valorant, LoL, TFT)',
            'shortcuts_lang': '클라이언트 표시 언어 순환',
            'shortcuts_audio': '음향 효과 (SFX) 음소거 토글',
            'shortcuts_fullscreen': '전체 화면 모드 켜기/끄기',
            'shortcuts_escape': '열려 있는 모달 창 닫기',
            'shortcuts_demo': '테스트용 데모 계정 자동 입력',
            'shortcuts_shortcuts_hud': '단축키 도움말 창 열기/닫기',

            // 10. Account Settings
            'settings_title': '계정 환경설정',
            'settings_btn': '설정',
            'settings_subtitle': '언어, 인터페이스 테마, 음향 효과를 설정합니다.',
            'settings_language': '클라이언트 언어',
            'settings_theme': '인터페이스 테마',
            'settings_audio': '음향 효과 (SFX)',
            'settings_sound_enabled': '음향 효과 활성화',
            'settings_sound_volume': '전체 볼륨',
            'settings_save': '설정 저장',
            'settings_saved': '환경설정이 성공적으로 저장되었습니다!',
            'settings_reset': '기본값 복원',
            'settings_close': '닫기',

            // 11. Error Toasts & Notifications
            'toast_login_success': '환영합니다, {username}님! 로그인이 완료되었습니다.',
            'toast_invalid_credentials': '잘못된 사용자 이름 또는 비밀번호입니다.',
            'error_invalid_credentials': '사용자 이름 또는 비밀번호가 잘못되었습니다.',
            'toast_empty_fields': '모든 필드를 입력해 주세요 (비밀번호 8자 이상).',
            'error_empty_fields': '모든 필드를 입력해주세요.',
            'toast_network_error': '네트워크 오류입니다. 연결을 확인하고 다시 시도해 주세요.',
            'error_network': '연결 오류가 발생했습니다. 다시 시도해주세요.',
            'toast_2fa_sent': '2단계 인증 코드가 {email}로 전송되었습니다 (힌트: 123456)',
            'toast_2fa_incorrect': '보안 코드가 올바르지 않습니다. 다시 시도해 주세요.',
            'toast_account_created': 'Riot ID 계정이 생성되었습니다! 로그인해 주세요.',
            'toast_user_exists': '이미 사용 중인 사용자 이름입니다.',
            'toast_recovery_sent': '{email}로 비밀번호 복구 안내가 전송되었습니다',
            'toast_recovery_not_found': '계정 또는 이메일을 찾을 수 없습니다.',
            'toast_fullscreen_on': '전체 화면 모드 켜짐',
            'toast_fullscreen_off': '전체 화면 모드 꺼짐',
            'toast_audio_muted': '음향 효과 음소거됨',
            'toast_audio_unmuted': '음향 효과 켜짐',
            'toast_theme_changed': '테마 변경: {theme}',
            'toast_lang_changed': '언어 변경: {lang}',
            'toast_demo_filled': '데모 정보 입력 완료! 2FA 코드: 123456',
            'toast_social_linked': '({provider}) 계정이 성공적으로 연동되었습니다!',
            'close': '닫기',
            'close_aria': '모달 창 닫기'
        },

        'de-DE': {
            // 1. Language Info
            'lang_name': 'Deutsch (DE)',
            'lang_flag': '🇩🇪',
            'lang_selector_label': 'Client-Sprachauswahl',
            'theme_selector_label': 'Benutzeroberflächen-Designauswahl',

            // 2. Login & Main Interface
            'login': 'Anmelden',
            'title': 'Anmelden',
            'title_signin': 'Anmelden',
            'username': 'benutzername',
            'username_label': 'BENUTZERNAME',
            'username_placeholder': 'Benutzername',
            'password': 'passwort',
            'password_label': 'PASSWORT',
            'password_placeholder': 'Passwort',
            'rememberMe': 'Angemeldet bleiben',
            'stay_signed_in': 'Angemeldet bleiben',
            'remember_login': 'Angemeldet bleiben',
            'cantSignIn': 'probleme bei der anmeldung?',
            'cant_sign_in': 'Probleme bei der Anmeldung?',
            'forgot_password': 'Probleme bei der Anmeldung?',
            'createAccount': 'konto erstellen',
            'create_account': 'Konto erstellen',
            'register_link': 'konto erstellen',
            'capsWarning': 'Feststelltaste aktiviert',
            'caps_warning': 'Feststelltaste aktiviert',
            'caps_lock': 'Feststelltaste aktiviert',
            'signin_aria': 'Anmeldung bestätigen',
            'submit_button_aria': 'Anmeldung bestätigen',
            'demo_fill': '⚡ Demo Fill',
            'demo_fill_btn': '⚡ Demo Fill',
            'demo_fill_tooltip': 'Test-Zugangsdaten automatisch ausfüllen (player1 / password123)',
            'fullscreen_tooltip': 'Vollbildmodus (F11)',
            'audio_tooltip': 'Ton umschalten (Strg+M)',
            'show_password': 'Passwort einblenden oder ausblenden',
            'social_login': 'Optionen für Social-Login',
            'social_login_heading': 'Oder anmelden mit',
            'client_version': 'v2.5.0-production • Riot Client Engine',
            'view_bodyfit': 'Bodyfit-Projekt ansehen →',

            // 3. Social Providers
            'auth_facebook': 'Mit Facebook anmelden',
            'auth_google': 'Mit Google anmelden',
            'auth_apple': 'Mit Apple anmelden',
            'auth_xbox': 'Mit Xbox anmelden',
            'auth_playstation': 'Mit PlayStation Network anmelden',

            // 4. Two-Factor Authentication (2FA)
            'twoFactorTitle': 'Sicherheitscode',
            '2fa_title': 'ZWEI-FAKTOR-AUTHENTIFIZIERUNG',
            'twoFactorDesc': 'Ein 6-stelliger Bestätigungscode wurde an Ihre E-Mail oder den Riot Authenticator gesendet.',
            '2fa_subtitle': 'Geben Sie den an Ihre E-Mail gesendeten Bestätigungscode ein.',
            'verifyCode': 'Bestätigen & Anmelden',
            '2fa_verify': 'Bestätigen',
            '2fa_placeholder': '000000',
            '2fa_resend': 'Code erneut senden',
            '2fa_resend_countdown': 'Code erneut senden in {time}s',
            '2fa_code_sent': 'Neuer Bestätigungscode erfolgreich gesendet!',
            '2fa_invalid_code': 'Ungültiger oder abgelaufener Sicherheitscode.',

            // 5. Account Recovery
            'recoverTitle': 'Konto wiederherstellen',
            'recovery_title': 'KONTOWIEDERHERSTELLUNG',
            'recoverDesc': 'Geben Sie Ihren Benutzernamen oder Ihre registrierte E-Mail-Adresse ein, um Anweisungen zum Zurücksetzen zu erhalten.',
            'recovery_subtitle': 'Geben Sie Ihren Benutzernamen oder Ihre E-Mail-Adresse ein, um das Passwort zurückzusetzen.',
            'recover_placeholder': 'name@beispiel.de oder Benutzername',
            'sendInstructions': 'Anweisungen senden',
            'recovery_submit': 'Wiederherstellungslink senden',
            'back_to_login': 'Zurück zur Anmeldung',
            'support_links': 'Hilfe & Kundendienst',

            // 6. Create Account (Registration)
            'registerTitle': 'Riot ID erstellen',
            'registerDesc': 'Erstelle ein Konto, um League of Legends, Valorant, TFT und mehr zu spielen.',
            'regEmailPlaceholder': 'E-Mail-Adresse',
            'regUsernamePlaceholder': 'Benutzername',
            'regPasswordPlaceholder': 'Passwort (mind. 8 Zeichen)',
            'createMyAccount': 'Mein Konto erstellen',

            // 7. Captcha & Security Challenge
            'captcha_title': 'Sicherheitsüberprüfung',
            'captcha_instruction': 'Bitte schließen Sie die Überprüfung ab, um auf Ihr Riot-Konto zuzugreifen.',
            'captcha_checkbox': 'Ich bin ein Mensch',
            'captcha_verifying': 'Authentizität wird überprüft...',
            'captcha_success': 'Überprüfung erfolgreich abgeschlossen!',
            'captcha_failed': 'Überprüfung fehlgeschlagen. Bitte erneut versuchen.',
            'captcha_reload': 'Herausforderung neu laden',
            'captcha_submit': 'Überprüfung bestätigen',
            'captcha_help': 'Dieser Schutz schützt Ihr Riot-Konto vor automatisierten Zugriffen.',

            // 8. Server Status
            'server_status_title': 'Riot-Serverstatus',
            'server_status_btn': 'Serverstatus',
            'server_status_all_operational': 'Alle Systeme betriebsbereit',
            'server_status_operational': 'Betriebsbereit',
            'server_status_degraded': 'Leistung beeinträchtigt',
            'server_status_maintenance': 'Geplante Wartung',
            'server_status_offline': 'Offline',
            'server_region_br': 'Brasilien (BR - São Paulo)',
            'server_region_na': 'Nordamerika (NA - Chicago)',
            'server_region_euw': 'Westeuropa (EUW - Frankfurt)',
            'server_region_kr': 'Südkorea (KR - Seoul)',
            'server_region_jp': 'Japan (JP - Tokio)',
            'server_latency': 'Latenz: {ping}ms',
            'server_refresh': 'Status aktualisieren',
            'server_last_checked': 'Zuletzt überprüft: gerade eben',

            // 9. Shortcuts HUD
            'shortcuts_title': 'Tastaturkürzel',
            'shortcuts_btn': 'Tastenkürzel',
            'shortcuts_subtitle': 'Navigieren Sie im Riot Client mit schnellen Tastaturkürzeln',
            'shortcuts_theme': 'Visuelle Designs wechseln (Riot, Valorant, LoL, TFT)',
            'shortcuts_lang': 'Sprache der Benutzeroberfläche wechseln',
            'shortcuts_audio': 'Soundeffekte (SFX) ein- oder ausschalten',
            'shortcuts_fullscreen': 'Vollbildmodus aktivieren oder beenden',
            'shortcuts_escape': 'Alle geöffneten Modalfenster schließen',
            'shortcuts_demo': 'Demo-Zugangsdaten automatisch einfügen',
            'shortcuts_shortcuts_hud': 'Diesen Tastaturkürzel-Leitfaden öffnen/schließen',

            // 10. Account Settings
            'settings_title': 'Kontoeinstellungen',
            'settings_btn': 'Einstellungen',
            'settings_subtitle': 'Passen Sie Sprache, visuelles Design und Audioeffekte an.',
            'settings_language': 'Client-Sprache',
            'settings_theme': 'Visuelles Design',
            'settings_audio': 'Soundeffekte (SFX)',
            'settings_sound_enabled': 'Soundeffekte aktivieren',
            'settings_sound_volume': 'Gesamtlautstärke',
            'settings_save': 'Einstellungen speichern',
            'settings_saved': 'Einstellungen erfolgreich gespeichert!',
            'settings_reset': 'Standard wiederherstellen',
            'settings_close': 'Schließen',

            // 11. Error Toasts & Notifications
            'toast_login_success': 'Willkommen, {username}! Anmeldung erfolgreich.',
            'toast_invalid_credentials': 'Ungültiger Benutzername oder Passwort.',
            'error_invalid_credentials': 'Ungültiger Benutzername oder Passwort.',
            'toast_empty_fields': 'Bitte alle Felder ausfüllen (Passwort mind. 8 Zeichen).',
            'error_empty_fields': 'Bitte alle Felder ausfüllen.',
            'toast_network_error': 'Verbindungsfehler. Bitte überprüfen Sie Ihre Internetverbindung.',
            'error_network': 'Verbindungsfehler. Bitte erneut versuchen.',
            'toast_2fa_sent': '2FA-Code an {email} gesendet (Tipp: 123456)',
            'toast_2fa_incorrect': 'Ungültiger Sicherheitscode. Bitte versuchen Sie es erneut.',
            'toast_account_created': 'Riot ID-Konto erfolgreich erstellt! Jetzt anmelden.',
            'toast_user_exists': 'Dieser Benutzername ist bereits vergeben.',
            'toast_recovery_sent': 'Anweisungen zum Zurücksetzen an {email} gesendet',
            'toast_recovery_not_found': 'Konto oder E-Mail-Adresse nicht gefunden.',
            'toast_fullscreen_on': 'Vollbildmodus aktiviert',
            'toast_fullscreen_off': 'Vollbildmodus deaktiviert',
            'toast_audio_muted': 'Soundeffekte stummgeschaltet',
            'toast_audio_unmuted': 'Soundeffekte aktiviert',
            'toast_theme_changed': 'Design geändert: {theme}',
            'toast_lang_changed': 'Sprache geändert: {lang}',
            'toast_demo_filled': 'Demo-Zugangsdaten ausgefüllt! 2FA-Code: 123456',
            'toast_social_linked': 'Authentifizierung ({provider}) erfolgreich verknüpft!',
            'close': 'Schließen',
            'close_aria': 'Modalfenster schließen'
        }
    };

    class RiotI18n {
        constructor() {
            this.storageKey = 'riot_lang';
            this.supportedLanguages = ['pt-BR', 'en-US', 'es-ES', 'ja-JP', 'ko-KR', 'de-DE'];
            this.currentLang = this.detectInitialLanguage();
            this.translations = translations;
        }

        detectInitialLanguage() {
            const saved = localStorage.getItem(this.storageKey);
            if (saved && translations[saved]) {
                return saved;
            }

            // Browser language detection
            const navLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
            if (navLang.startsWith('pt')) return 'pt-BR';
            if (navLang.startsWith('es')) return 'es-ES';
            if (navLang.startsWith('ja')) return 'ja-JP';
            if (navLang.startsWith('ko')) return 'ko-KR';
            if (navLang.startsWith('de')) return 'de-DE';
            if (navLang.startsWith('en')) return 'en-US';

            return 'pt-BR';
        }

        getLanguage() {
            return this.currentLang;
        }

        getLanguages() {
            return this.supportedLanguages.map(code => ({
                code,
                name: translations[code].lang_name,
                flag: translations[code].lang_flag
            }));
        }

        setLanguage(lang, playAudio = false, notifyToast = false) {
            if (!translations[lang]) {
                console.warn(`[RiotI18n] Language "${lang}" is not supported.`);
                return false;
            }

            this.currentLang = lang;
            localStorage.setItem(this.storageKey, lang);

            if (document.documentElement) {
                document.documentElement.lang = lang;
            }

            this.updateDOM();
            this.syncSelectors();

            if (playAudio && window.riotAudio && typeof window.riotAudio.play === 'function') {
                window.riotAudio.play('click');
            }

            if (notifyToast && window.showRiotToast) {
                const langName = translations[lang].lang_name;
                window.showRiotToast(this.t('toast_lang_changed', { lang: langName }), 'info');
            }

            // Dispatch standard custom events
            if (typeof window.dispatchEvent === 'function' && typeof CustomEvent === 'function') {
                const eventDetail = { language: lang, dictionary: translations[lang] };
                window.dispatchEvent(new CustomEvent('riot-lang-changed', { detail: eventDetail }));
                window.dispatchEvent(new CustomEvent('riotLangChanged', { detail: eventDetail }));
            }

            return true;
        }

        cycleLanguage(playAudio = true, notifyToast = true) {
            const currentIndex = this.supportedLanguages.indexOf(this.currentLang);
            const nextIndex = (currentIndex + 1) % this.supportedLanguages.length;
            const nextLang = this.supportedLanguages[nextIndex];
            this.setLanguage(nextLang, playAudio, notifyToast);
            return nextLang;
        }

        t(key, params = {}) {
            const dict = translations[this.currentLang] || translations['pt-BR'];
            const fallbackDict = translations['en-US'] || translations['pt-BR'];

            let text = dict[key] !== undefined ? dict[key] : (fallbackDict[key] !== undefined ? fallbackDict[key] : key);

            // Interpolate {paramName}
            if (params && typeof params === 'object') {
                for (const paramKey of Object.keys(params)) {
                    text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), params[paramKey]);
                }
            }

            return text;
        }

        updateDOM() {
            // 1. Text elements: [data-i18n]
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                const translation = this.t(key);
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    if (el.hasAttribute('placeholder')) {
                        el.placeholder = translation;
                    }
                } else if (el.hasAttribute('data-i18n-html')) {
                    el.innerHTML = translation;
                } else {
                    el.textContent = translation;
                }
            });

            // 2. Safe HTML elements: [data-i18n-html]
            document.querySelectorAll('[data-i18n-html]').forEach(el => {
                const key = el.getAttribute('data-i18n-html');
                if (key) {
                    el.innerHTML = this.t(key);
                }
            });

            // 3. Placeholders: [data-i18n-placeholder]
            document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
                const key = el.getAttribute('data-i18n-placeholder');
                el.placeholder = this.t(key);
            });

            // 4. Title Tooltips: [data-i18n-title]
            document.querySelectorAll('[data-i18n-title]').forEach(el => {
                const key = el.getAttribute('data-i18n-title');
                el.title = this.t(key);
            });

            // 5. Accessible Labels: [data-i18n-aria]
            document.querySelectorAll('[data-i18n-aria]').forEach(el => {
                const key = el.getAttribute('data-i18n-aria');
                el.setAttribute('aria-label', this.t(key));
            });

            // 6. Values: [data-i18n-value]
            document.querySelectorAll('[data-i18n-value]').forEach(el => {
                const key = el.getAttribute('data-i18n-value');
                el.value = this.t(key);
            });

            if (document.documentElement) {
                document.documentElement.lang = this.currentLang;
            }
        }

        syncSelectors() {
            const selectors = document.querySelectorAll('#langSelector, select[name="language"], [data-lang-selector]');
            selectors.forEach(sel => {
                if (sel.tagName === 'SELECT' && sel.value !== this.currentLang) {
                    sel.value = this.currentLang;
                }
            });
        }

        bindUI() {
            const selectors = document.querySelectorAll('#langSelector, select[name="language"], [data-lang-selector]');
            selectors.forEach(sel => {
                if (sel.tagName === 'SELECT') {
                    sel.value = this.currentLang;
                    sel.addEventListener('change', (e) => {
                        this.setLanguage(e.target.value, true, true);
                    });
                }
            });
        }

        init() {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this.updateDOM();
                    this.bindUI();
                    this.syncSelectors();
                });
            } else {
                this.updateDOM();
                this.bindUI();
                this.syncSelectors();
            }
        }
    }

    // Expose global instance and shorthand translate function
    window.RiotI18n = RiotI18n;
    window.i18n = new RiotI18n();
    window.t = function(key, params) {
        return window.i18n.t(key, params);
    };

    window.i18n.init();
})();
