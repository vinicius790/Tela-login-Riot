/**
 * Riot Games i18n & Localization System
 * Supports: pt-BR, en-US, es-ES, ja-JP, ko-KR
 */

const translations = {
    'pt-BR': {
        'title': 'Fazer login',
        'username': 'NOME DE USUÁRIO',
        'username_placeholder': 'Nome de usuário',
        'password': 'SENHA',
        'password_placeholder': 'Senha',
        'stay_signed_in': 'Manter conectado',
        'cant_sign_in': 'Não consegue iniciar sessão?',
        'create_account': 'Criar conta',
        'signin_aria': 'Fazer login',
        'error_invalid_credentials': 'Nome de usuário ou senha inválidos.',
        'error_empty_fields': 'Preencha todos os campos.',
        'error_network': 'Erro de conexão. Tente novamente.',
        '2fa_title': 'VERIFICAÇÃO EM DUAS ETAPAS',
        '2fa_subtitle': 'Digite o código de verificação enviado para o seu e-mail.',
        '2fa_placeholder': '000000',
        '2fa_verify': 'Verificar',
        '2fa_resend': 'Reenviar código',
        'recovery_title': 'RECUPERAÇÃO DE CONTA',
        'recovery_subtitle': 'Insira seu nome de usuário ou e-mail para redefinir a senha.',
        'recovery_submit': 'Enviar link de recuperação',
        'back_to_login': 'Voltar ao login',
        'support_links': 'Suporte e Ajuda'
    },
    'en-US': {
        'title': 'Sign In',
        'username': 'USERNAME',
        'username_placeholder': 'Username',
        'password': 'PASSWORD',
        'password_placeholder': 'Password',
        'stay_signed_in': 'Stay signed in',
        'cant_sign_in': "Can't sign in?",
        'create_account': 'Create account',
        'signin_aria': 'Sign In',
        'error_invalid_credentials': 'Invalid username or password.',
        'error_empty_fields': 'Please fill in all fields.',
        'error_network': 'Connection error. Please try again.',
        '2fa_title': 'TWO-FACTOR VERIFICATION',
        '2fa_subtitle': 'Enter the verification code sent to your email.',
        '2fa_placeholder': '000000',
        '2fa_verify': 'Verify',
        '2fa_resend': 'Resend code',
        'recovery_title': 'ACCOUNT RECOVERY',
        'recovery_subtitle': 'Enter your username or email to reset your password.',
        'recovery_submit': 'Send recovery link',
        'back_to_login': 'Return to sign in',
        'support_links': 'Support & Help'
    },
    'es-ES': {
        'title': 'Iniciar sesión',
        'username': 'NOMBRE DE USUARIO',
        'username_placeholder': 'Nombre de usuario',
        'password': 'CONTRASEÑA',
        'password_placeholder': 'Contraseña',
        'stay_signed_in': 'No cerrar sesión',
        'cant_sign_in': '¿No puedes iniciar sesión?',
        'create_account': 'Crear cuenta',
        'signin_aria': 'Iniciar sesión',
        'error_invalid_credentials': 'Nombre de usuario o contraseña inválidos.',
        'error_empty_fields': 'Por favor, rellene todos los campos.',
        'error_network': 'Error de conexión. Inténtelo de nuevo.',
        '2fa_title': 'VERIFICACIÓN EN DOS PASOS',
        '2fa_subtitle': 'Introduce el código de verificación enviado a tu correo.',
        '2fa_placeholder': '000000',
        '2fa_verify': 'Verificar',
        '2fa_resend': 'Reenviar código',
        'recovery_title': 'RECUPERACIÓN DE CUENTA',
        'recovery_subtitle': 'Introduce tu nombre de usuario o correo para restablecer la contraseña.',
        'recovery_submit': 'Enviar enlace de recuperación',
        'back_to_login': 'Volver a iniciar sesión',
        'support_links': 'Soporte y Ayuda'
    },
    'ja-JP': {
        'title': 'サインイン',
        'username': 'ユーザー名',
        'username_placeholder': 'ユーザー名',
        'password': 'パスワード',
        'password_placeholder': 'パスワード',
        'stay_signed_in': 'サインインしたままにする',
        'cant_sign_in': 'サインインできませんか？',
        'create_account': 'アカウント作成',
        'signin_aria': 'サインイン',
        'error_invalid_credentials': 'ユーザー名またはパスワードが正しくありません。',
        'error_empty_fields': 'すべての項目を入力してください。',
        'error_network': '接続エラーが発生しました。もう一度お試しください。',
        '2fa_title': '二段階認証',
        '2fa_subtitle': 'メールに送信された認証コードを入力してください。',
        '2fa_placeholder': '000000',
        '2fa_verify': '確認',
        '2fa_resend': 'コードを再送信',
        'recovery_title': 'アカウント復元',
        'recovery_subtitle': 'ユーザー名またはメールアドレスを入力してパスワードをリセットしてください。',
        'recovery_submit': '復元リンクを送信',
        'back_to_login': 'サインインに戻る',
        'support_links': 'サポート & ヘルプ'
    },
    'ko-KR': {
        'title': '로그인',
        'username': '사용자 이름',
        'username_placeholder': '사용자 이름',
        'password': '비밀번호',
        'password_placeholder': '비밀번호',
        'stay_signed_in': '로그인 상태 유지',
        'cant_sign_in': '로그인할 수  없나요?',
        'create_account': '계정 만들기',
        'signin_aria': '로그인',
        'error_invalid_credentials': '사용자 이름 또는 비밀번호가 잘못되었습니다.',
        'error_empty_fields': '모든 필드를 입력해주세요.',
        'error_network': '연결 오류가 발생했습니다. 다시 시도해주세요.',
        '2fa_title': '2단계 인증',
        '2fa_subtitle': '이메일로 전송된 인증 코드를 입력하세요.',
        '2fa_placeholder': '000000',
        '2fa_verify': '확인',
        '2fa_resend': '코드 재전송',
        'recovery_title': '계정 복구',
        'recovery_subtitle': '비밀번호를 재설정하려면 사용자 이름이나 이메일을 입력하세요.',
        'recovery_submit': '복구 링크 전송',
        'back_to_login': '로그인으로 돌아가기',
        'support_links': '지원 및 도움말'
    }
};

class RiotI18n {
    constructor(defaultLang = 'pt-BR') {
        this.currentLang = localStorage.getItem('riot_lang') || defaultLang;
        if (!translations[this.currentLang]) {
            this.currentLang = 'pt-BR';
        }
    }

    setLanguage(lang) {
        if (translations[lang]) {
            this.currentLang = lang;
            localStorage.setItem('riot_lang', lang);
            this.updateDOM();
            window.dispatchEvent(new CustomEvent('riot-lang-changed', { detail: { language: lang } }));
        }
    }

    t(key) {
        const dict = translations[this.currentLang] || translations['pt-BR'];
        return dict[key] || translations['pt-BR'][key] || key;
    }

    updateDOM() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = this.t(key);
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                if (el.hasAttribute('placeholder')) {
                    el.placeholder = translation;
                }
            } else {
                el.textContent = translation;
            }
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = this.t(key);
        });

        document.querySelectorAll('[data-i18n-aria]').forEach(el => {
            const key = el.getAttribute('data-i18n-aria');
            el.setAttribute('aria-label', this.t(key));
        });

        if (document.documentElement) {
            document.documentElement.lang = this.currentLang;
        }
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.updateDOM());
        } else {
            this.updateDOM();
        }
    }
}

window.i18n = new RiotI18n();
window.i18n.init();
