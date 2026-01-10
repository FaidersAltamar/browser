"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UtilService = void 0;
const Proxy_1 = require("../models/Proxy");
const playwright = __importStar(require("playwright"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const env_1 = require("../config/env");
const child_process_1 = require("child_process");
const getProfileDataPath = (profileId) => {
    // Ensure profileId is always a string
    const profileIdString = String(profileId);
    const profileDataDir = env_1.config.PROFILE_DATA_DIR.startsWith('./') ?
        path_1.default.join(process.cwd(), env_1.config.PROFILE_DATA_DIR.slice(2)) :
        env_1.config.PROFILE_DATA_DIR;
    return path_1.default.join(profileDataDir, profileIdString);
};
class UtilService {
    /**
     * Verifica si Chromium está disponible para ser usado
     * Intenta verificar la ruta personalizada primero, luego el Chromium de Playwright
     */
    static async checkChromiumAvailable() {
        try {
            // Primero verificar si hay una ruta personalizada de Chromium
            if (env_1.config.CUSTOM_CHROMIUM_PATH && fs_extra_1.default.existsSync(env_1.config.CUSTOM_CHROMIUM_PATH)) {
                console.log(`✅ Custom Chromium found at: ${env_1.config.CUSTOM_CHROMIUM_PATH}`);
                return {
                    available: true,
                    executablePath: env_1.config.CUSTOM_CHROMIUM_PATH
                };
            }
            // Si no hay ruta personalizada, verificar si Playwright tiene Chromium instalado
            console.log('🔍 Checking for Playwright Chromium...');
            try {
                // Intentar obtener la ruta del ejecutable de Chromium
                let chromiumExecutable;
                try {
                    // Método 1: Usar executablePath() si está disponible
                    if (typeof playwright.chromium.executablePath === 'function') {
                        chromiumExecutable = playwright.chromium.executablePath();
                    }
                }
                catch (e) {
                    // Si executablePath() no está disponible, intentar lanzar para verificar
                    console.log('⚠️ executablePath() no disponible, intentando verificar lanzando...');
                }
                // Si tenemos una ruta, verificar que exista
                if (chromiumExecutable && fs_extra_1.default.existsSync(chromiumExecutable)) {
                    console.log(`✅ Playwright Chromium found at: ${chromiumExecutable}`);
                    return {
                        available: true,
                        executablePath: chromiumExecutable
                    };
                }
                // Si no tenemos ruta pero playwright.chromium existe, asumimos que está disponible
                // Playwright manejará la instalación automáticamente al intentar lanzar
                if (playwright.chromium) {
                    console.log('✅ Playwright Chromium disponible (se instalará automáticamente si es necesario)');
                    return {
                        available: true
                    };
                }
            }
            catch (playwrightError) {
                console.warn('⚠️ Error verificando Playwright Chromium:', playwrightError.message);
                // Intentar instalar Chromium automáticamente
                console.log('📦 Intentando instalar Playwright Chromium...');
                try {
                    // Usar el comando de instalación de Playwright
                    (0, child_process_1.execSync)('npx playwright install chromium', {
                        stdio: 'inherit',
                        timeout: 300000, // 5 minutos timeout
                        cwd: process.cwd()
                    });
                    console.log('✅ Chromium instalado exitosamente');
                    // Verificar nuevamente después de la instalación
                    try {
                        if (typeof playwright.chromium.executablePath === 'function') {
                            const chromiumExecutable = playwright.chromium.executablePath();
                            if (chromiumExecutable && fs_extra_1.default.existsSync(chromiumExecutable)) {
                                return {
                                    available: true,
                                    executablePath: chromiumExecutable
                                };
                            }
                        }
                        // Si no podemos obtener la ruta, asumimos que está disponible
                        return { available: true };
                    }
                    catch (verifyError) {
                        // Si aún así no podemos verificar, asumimos que está disponible
                        console.log('⚠️ No se pudo verificar la ruta, pero Chromium debería estar instalado');
                        return { available: true };
                    }
                }
                catch (installError) {
                    console.error('❌ Error al instalar Chromium:', installError.message);
                    return {
                        available: false,
                        error: `Chromium no está disponible y no se pudo instalar automáticamente. Por favor, ejecuta manualmente: npx playwright install chromium. Error: ${installError.message}`
                    };
                }
            }
            return {
                available: false,
                error: 'Chromium no está disponible. Por favor, ejecuta: npx playwright install chromium'
            };
        }
        catch (error) {
            console.error('❌ Error checking Chromium availability:', error);
            return {
                available: false,
                error: `Error al verificar Chromium: ${error.message}`
            };
        }
    }
    static async getProxyAddress(proxyId) {
        try {
            const proxy = await Proxy_1.ProxyModel.findById(proxyId);
            return proxy ? `${proxy.ip}:${proxy.port}` : undefined;
        }
        catch (error) {
            console.error("Error getting proxy address:", error);
            return undefined;
        }
    }
    static async launch(profile, options = {}) {
        // Verificar que Chromium esté disponible antes de intentar lanzar
        const profileId = profile?.id ?? profile?.profileId ?? null;
        if (!profileId) {
            throw new Error('Profile ID is required but was not provided');
        }
        const profileIdString = String(profileId);
        console.log(`🔍 Verificando disponibilidad de Chromium para el perfil ${profileIdString}...`);
        const chromiumCheck = await this.checkChromiumAvailable();
        if (!chromiumCheck.available) {
            const errorMessage = chromiumCheck.error || 'Chromium no está disponible';
            console.error(`❌ ${errorMessage}`);
            throw new Error(errorMessage);
        }
        const profileDataDir = getProfileDataPath(profileIdString);
        fs_extra_1.default.ensureDirSync(profileDataDir);
        const browserType = playwright.chromium;
        // const browserType = profile.browserType?.toLowerCase() || config.DEFAULT_BROWSER_TYPE;
        // const pwBrowserType: { [key: string]: keyof typeof playwright } = {
        //   chrome: "chromium",
        //   chromium: "chromium",
        //   firefox: "firefox",
        //   edge: "chromium",
        //   safari: "webkit",
        //   webkit: "webkit",
        // };
        // const selectedBrowser = pwBrowserType[browserType] || "chromium";
        // const browserTypeInstance = (playwright as any)[selectedBrowser] as playwright.BrowserType<{}>;
        // if (!browserTypeInstance) {
        //   throw new Error(`Unsupported browser type: ${profile.browserType}`);
        // }
        const browserTypeInstance = playwright.chromium; // Chỉ sử dụng Chromium để tránh lỗi
        // const baseLaunchArgs  = [
        //   "--disable-blink-features=AutomationControlled",
        //   "--disable-infobars",
        //   "--no-sandbox",
        //   "--disable-setuid-sandbox",
        //   "--disable-gpu",
        //   "--disable-dev-shm-usage",
        //   "--aggressive-cache-discard",
        //   "--disable-cache",
        //   "--disk-cache-size=0",
        //   "--v8-cache-options=off",
        // ];
        // const launchArgs = this.buildLaunchArgsFromFingerprint(profile, baseLaunchArgs);
        let proxyConfig;
        if (profile.proxy?.host && profile.proxy?.port) {
            proxyConfig = {
                server: `${profile.proxy.type}://${profile.proxy.host}:${profile.proxy.port}`,
                username: profile.proxy.username,
                password: profile.proxy.password,
            };
        }
        // Build launch options
        const launchOptions = {
            headless: options.headless ?? false,
            // args: launchArgs,
            // proxy: proxyConfig,
        };
        // Usar la ruta de Chromium encontrada (personalizada o de Playwright)
        if (chromiumCheck.executablePath) {
            console.log(`✅ Usando Chromium en: ${chromiumCheck.executablePath}`);
            launchOptions.executablePath = chromiumCheck.executablePath;
        }
        else if (env_1.config.CUSTOM_CHROMIUM_PATH && fs_extra_1.default.existsSync(env_1.config.CUSTOM_CHROMIUM_PATH)) {
            console.log(`✅ Usando ruta personalizada de Chromium: ${env_1.config.CUSTOM_CHROMIUM_PATH}`);
            launchOptions.executablePath = env_1.config.CUSTOM_CHROMIUM_PATH;
        }
        else {
            console.log(`ℹ️ Usando Chromium por defecto de Playwright`);
            // Playwright usará su Chromium integrado
        }
        try {
            const context = await browserTypeInstance.launchPersistentContext(profileDataDir, launchOptions);
            const page = await context.newPage();
            await page.goto("about:blank");
            console.log(`✅ Perfil ${profileIdString} lanzado exitosamente con Chromium`);
            return { context, page, browser: context.browser() };
        }
        catch (error) {
            console.error(`❌ Error al lanzar Chromium para el perfil ${profileIdString}:`, error.message);
            throw new Error(`No se pudo lanzar Chromium: ${error.message}. Asegúrate de que Chromium esté instalado correctamente.`);
        }
    }
    /**
   * Xây dựng mảng launch arguments từ một đối tượng FingerprintData.
   * @param fingerprint - Đối tượng chứa thông tin fingerprint.
   * @param initialArgs - Một mảng các arguments ban đầu (tùy chọn).
   * @returns Mảng các arguments hoàn chỉnh.
   */
    static buildLaunchArgsFromFingerprint(fingerprint, initialArgs = []) {
        // Tạo một bản sao để không làm thay đổi mảng ban đầu
        const finalArgs = [...initialArgs];
        // Nếu không có fingerprint, trả về mảng args ban đầu
        if (!fingerprint) {
            return finalArgs;
        }
        // Duyệt qua tất cả các thuộc tính của đối tượng fingerprint
        for (const key in fingerprint) {
            // Ép kiểu để TypeScript hiểu key là một thuộc tính hợp lệ của FingerprintData
            const typedKey = key;
            const value = fingerprint[typedKey];
            // Lọc bỏ những thuộc tính là null, undefined, 0, hoặc chuỗi rỗng
            if (value === null || value === undefined || value === 0 || value === '') {
                continue; // Bỏ qua và đi đến thuộc tính tiếp theo
            }
            // Gọi hàm helper để thêm cờ tương ứng
            this.applyFingerprintArg(typedKey, value, finalArgs);
        }
        return finalArgs;
    }
    /**
   * Hàm này nhận vào một key và value từ đối tượng fingerprint,
   * sau đó thêm cờ (flag) tương ứng vào mảng launchArgs.
   * @param key - Tên thuộc tính của fingerprint (ví dụ: 'userAgent', 'timezone').
   * @param value - Giá trị của thuộc tính đó.
   * @param args - Mảng launchArgs hiện tại để thêm cờ mới vào.
   */
    static applyFingerprintArg(key, value, args) {
        switch (key) {
            // case 'userAgent':
            //   args.push(`--user-agent="${value}"`);
            //   break;
            // case 'timezone':
            //   args.push(`--spoof-timezone=${value}`);
            //   break;
            // case 'language':
            //   args.push(`--lang=${value}`);
            //   break;
            // case 'resolution':
            //   args.push(`--window-size=${value}`);
            //   break;
            // case 'platform':
            //   args.push(`--spoof-platform-name=${value}`);
            //   break;
            // case 'doNotTrack':
            //   if (value) {
            //     args.push('--enable-do-not-track');
            //   }
            //   break;
            case 'hardwareConcurrency':
                args.push(`--spoof-hardware-concurrency=${value}`);
                break;
            case 'deviceMemory':
                args.push(`--spoof-device-memory=${value}`);
                break;
            case 'canvas':
                args.push(`--spoof-canvas-noise-level=${value}`);
                break;
            case 'webGL':
                if (value) {
                    args.push(`--enable-webgl-spoofing`);
                }
                break;
            default:
                break;
        }
    }
    /**
     * Khởi chạy một phiên trình duyệt Playwright với cấu hình tối thiểu để test.
     * Không sử dụng profile data, proxy, hay fingerprint phức tạp.
     * @param {object} options - Tùy chọn, ví dụ: { headless: true }
     * @returns {Promise<{context: playwright.BrowserContext, page: playwright.Page, browser: playwright.Browser}>}
     */
    static async launchTest(options = {}) {
        try {
            console.log("🔍 Verificando disponibilidad de Chromium para pruebas...");
            // Verificar que Chromium esté disponible
            const chromiumCheck = await this.checkChromiumAvailable();
            if (!chromiumCheck.available) {
                const errorMessage = chromiumCheck.error || 'Chromium no está disponible para pruebas';
                console.error(`❌ ${errorMessage}`);
                throw new Error(errorMessage);
            }
            console.log("✅ Lanzando navegador mínimo para pruebas...");
            // 1. Chọn trình duyệt mặc định (chromium là lựa chọn an toàn nhất)
            const browserType = playwright.chromium;
            // 2. Các đối số khởi chạy cơ bản
            const launchArgs = [
                '--disable-blink-features=AutomationControlled',
                '--no-sandbox',
                '--disable-dev-shm-usage',
            ];
            // 3. Configurar la ruta de Chromium
            const launchOptions = {
                headless: options.headless ?? false, // Mặc định là có giao diện
                args: launchArgs,
            };
            if (chromiumCheck.executablePath) {
                launchOptions.executablePath = chromiumCheck.executablePath;
            }
            else if (env_1.config.CUSTOM_CHROMIUM_PATH && fs_extra_1.default.existsSync(env_1.config.CUSTOM_CHROMIUM_PATH)) {
                launchOptions.executablePath = env_1.config.CUSTOM_CHROMIUM_PATH;
            }
            // 4. Khởi chạy trình duyệt
            // Dùng `browserType.launch` thay vì `launchPersistentContext` để không lưu lại dữ liệu
            const browser = await browserType.launch(launchOptions);
            // 5. Tạo một context và một trang mới
            const context = await browser.newContext();
            const page = await context.newPage();
            console.log("✅ Navegador de prueba lanzado exitosamente.");
            // 6. Trả về các đối tượng cần thiết
            return { context, page, browser };
        }
        catch (error) {
            console.error("❌ Error al lanzar navegador de prueba:", error);
            throw new Error(`No se pudo lanzar el navegador de prueba: ${error.message}`);
        }
    }
}
exports.UtilService = UtilService;
