import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

console.log('=== ELECTRON STARTING ===');
console.log('Electron version:', process.versions.electron);
console.log('Node version:', process.versions.node);

let mainWindow;
let backendProcess;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); //

// Backend đã chạy riêng, chỉ cần kết nối
function startBackend() {
  console.log('Backend is running separately on port 8080');
  // Không cần khởi động backend nữa vì đã chạy riêng
}

function createWindow() {
  console.log('=== CREATING ELECTRON WINDOW ===');
  
  // Tạo cửa sổ trình duyệt với cấu hình cho embedded app
  try {
    mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1200,
      minHeight: 700,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: false, // Disable for embedded mode
        preload: path.resolve(__dirname, 'preload.js'),
        allowRunningInsecureContent: true
      },
      show: false, // Don't show until ready
      titleBarStyle: 'default'
    });
    
    console.log('BrowserWindow created successfully');
  } catch (error) {
    console.error('Error creating BrowserWindow:', error);
    return;
  }

  console.log('Starting content loading process...');

  // Event listeners để debug
  mainWindow.webContents.on('did-start-loading', () => {
    console.log('Content started loading...');
  });

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Application loaded successfully');
    mainWindow.show(); // Show window when content is loaded
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Failed to load content:', errorCode, errorDescription, validatedURL);
    // Don't try to load from HTTP if file loading fails - show error instead
    if (errorCode === -3 || errorCode === -102) { // ERR_ABORTED or CONNECTION_REFUSED
      console.error('❌ Failed to load from file, not trying HTTP fallback');
      mainWindow.loadURL('data:text/html,<h1>Error loading application</h1><p>Failed to load: ' + errorDescription + '</p>');
    }
  });

  // Console message debugging
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`Frontend Console [${level}]:`, message);
  });

  // Load the frontend
  try {
    // Always try to load from built files first
    const frontendPath = path.join(__dirname, 'frontend', 'dist', 'index.html');
    
    console.log('Current __dirname:', __dirname);
    console.log('Looking for frontend at:', frontendPath);
    console.log('File exists:', fs.existsSync(frontendPath));
    
    if (fs.existsSync(frontendPath)) {
      console.log('✅ Loading frontend from built files:', frontendPath);
      // Use absolute path for loadFile
      mainWindow.loadFile(frontendPath).then(() => {
        console.log('✅ Frontend loaded successfully');
      }).catch((err) => {
        console.error('❌ Failed to load file:', err);
        // Fallback to dev server
        console.log('🔄 Falling back to dev server...');
        mainWindow.loadURL('http://localhost:3001').catch((err2) => {
          console.error('❌ Failed to load from dev server:', err2);
        });
      });
    } else {
      // Fallback to dev server if build doesn't exist
      console.log('⚠️ Build not found, trying dev server on port 3001...');
      const isDev = process.env.NODE_ENV === 'development';
      
      if (isDev) {
        mainWindow.loadURL('http://localhost:3001').catch((err) => {
          console.error('❌ Failed to load from port 3001:', err);
          console.log('🔄 Trying port 3000...');
          mainWindow.loadURL('http://localhost:3000').catch((err2) => {
            console.error('❌ Failed to load from dev server:', err2);
          });
        });
        // Open DevTools in development mode
        mainWindow.webContents.openDevTools();
      } else {
        console.error('❌ Production build not found and not in development mode!');
        mainWindow.loadURL('data:text/html,<h1>Error: Frontend build not found</h1><p>Please build the frontend first or run in development mode.</p>');
      }
    }
  } catch (error) {
    console.error('❌ Error loading frontend:', error);
  }

  mainWindow.on('closed', () => {
    console.log('Window closed');
    mainWindow = null;
  });
}

// Import backend controllers
let AuthController, ProfileController, GroupProfileController, LaunchController, 
    ProxyController, WorkflowController, WorkflowExecutionController,
    StoreController, BalanceController, DepositController, UpgradeController;

// Helper function to check if auth endpoint is public
function isPublicAuthEndpoint(url) {
  const publicEndpoints = [
    '/api/auth/login',
    '/api/auth/register', 
    '/api/auth/forgot-password',
    '/api/auth/reset-password'
  ];
  return publicEndpoints.some(endpoint => url.startsWith(endpoint));
}

// Create necessary directories for backend data
function ensureDataDirectories() {
  const dataDirs = [
    './dist/data',
    './dist/data/images', 
    './dist/data/profiles',
    './dist/data/proxies',
    './dist/data/workflows'
  ];
  
  dataDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });
}

// Initialize backend modules
async function initializeBackend() {
  try {
    console.log('🔧 Ensuring data directories exist...');
    ensureDataDirectories();
    
    console.log('📦 Loading backend controllers...');
    // Import controllers based on routes structure
    ({ AuthController } = await import('./dist/controllers/auth.controller.js'));
    ({ ProfileController } = await import('./dist/controllers/profile.controller.js'));
    ({ GroupProfileController } = await import('./dist/controllers/group.profile.controller.js'));
    ({ LaunchController } = await import('./dist/controllers/launch.controller.js'));
    ({ ProxyController } = await import('./dist/controllers/proxy.controller.js'));
    ({ WorkflowController } = await import('./dist/controllers/workflow.controller.js'));
    ({ WorkflowExecutionController } = await import('./dist/controllers/workflow.execution.controller.js'));
    ({ StoreController } = await import('./dist/controllers/store.controller.js'));
    ({ BalanceController } = await import('./dist/controllers/balance.controller.js'));
    ({ DepositController } = await import('./dist/controllers/deposit.controller.js'));
    ({ UpgradeController } = await import('./dist/controllers/upgrade.controller.js'));

    console.log('🗄️ Initializing database...');
    // Initialize database
    const { initializeDatabase } = await import('./dist/db.js');
    await initializeDatabase();

    console.log('✅ Backend controllers and database initialized');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize backend:', error);
    return false;
  }
}

// Simple routing by scope to controller
async function routeToController(method, url, data, headers = {}) {
  try {
    // Parse URL to get scope: /api/auth/login → scope: 'auth'
    const urlParts = url.split('/').filter(part => part !== '');
    
    if (urlParts.length < 2 || urlParts[0] !== 'api') {
      throw new Error(`Invalid API path: ${url}`);
    }

    const scope = urlParts[1];
    
    // Authentication check - skip for auth endpoints
    let authenticatedUser = null;
    if (scope !== 'auth' || (scope === 'auth' && !isPublicAuthEndpoint(url))) {
      try {
        // Import AuthMiddleware dynamically
        const { AuthMiddleware } = await import('./dist/middleware/auth.middleware.js');
        authenticatedUser = await AuthMiddleware.authenticate(headers);
      } catch (authError) {
        // Trả về lỗi authentication với status code đúng
        const error = new Error(authError.message);
        error.status = 401; // Unauthorized
        throw error;
      }
    }
    
    // Parse sub-scope for workflows to handle execution separately
    const subScope = urlParts[2]; // For /api/workflows/execution/...
    
    // Route to appropriate controller based on scope (from routes analysis)
    switch (scope) {
      case 'auth':
        console.error('scope auth call :');
        // auth.routes.ts uses: AuthController
        return await AuthController.handleRequest(method, url, data, headers, authenticatedUser);
        
      case 'profiles':
        // Check sub-scope for profiles to route to correct controller
        if (subScope === 'groups') {
          // profile.routes.ts group endpoints: GroupProfileController
          return await GroupProfileController.handleRequest(method, url, data, headers, authenticatedUser);
        } else if (subScope === 'launch') {
          // profile.routes.ts launch endpoints: LaunchController
          return await LaunchController.handleRequest(method, url, data, headers, authenticatedUser);
        } else {
          // profile.routes.ts main endpoints: ProfileController
          return await ProfileController.handleRequest(method, url, data, headers, authenticatedUser);
        }
        
      case 'proxies':
        // proxy.routes.ts uses: ProxyController
        return await ProxyController.handleRequest(method, url, data, headers, authenticatedUser);
        
      case 'workflows':
        // Check if this is execution-related
        if (subScope === 'execution') {
          // workflow.routes.ts execution endpoints: WorkflowExecutionController
          return await WorkflowExecutionController.handleRequest(method, url, data, headers, authenticatedUser);
        } else {
          // workflow.routes.ts management endpoints: WorkflowController
          return await WorkflowController.handleRequest(method, url, data, headers, authenticatedUser);
        }
        
      case 'store':
        // store.routes.ts uses: StoreController
        return await StoreController.handleRequest(method, url, data, headers, authenticatedUser);
        
      case 'balance':
        // balance.routes.ts uses: BalanceController
        return await BalanceController.handleRequest(method, url, data, headers, authenticatedUser);
        
      case 'deposit':
        // deposit.routes.ts uses: DepositController
        return await DepositController.handleRequest(method, url, data, headers, authenticatedUser);
        
      case 'upgrade':
        // upgrade.routes.ts uses: UpgradeController
        return await UpgradeController.handleRequest(method, url, data, headers, authenticatedUser);
        
      default:
        throw new Error(`Unknown API scope: ${scope}`);
    }
  } catch (error) {
    console.error('Routing error:', error);
    throw error;
  }
}

// Hàm tạo phản hồi lỗi đã được sửa đổi
function createErrorResponse(status, message) {
  return {
    ok: false,
    status: status,
    statusText: message,
    // Chỉ trả về dữ liệu thuần túy. Frontend sẽ truy cập response.message trực tiếp.
    message: message // Thêm thuộc tính 'message' để frontend dễ dàng đọc
  };
}

// Hàm tạo phản hồi thành công đã được sửa đổi
function createSuccessResponse(data, status = 200) {
  return {
    ok: true,
    status: status,
    statusText: 'OK',
    // Chỉ trả về dữ liệu thuần túy. Frontend sẽ truy cập response.data trực tiếp.
    data: data
  };
}

// Helper function để thực hiện backend request (embedded only)
async function makeBackendRequest(method, url, data, headers = {}) {
  try {
    // Chỉ sử dụng embedded backend
    if (AuthController) {
      console.log('✅ AuthController initialized, proceeding with backend request');
      const result = await routeToController(method, url, data, headers);
      return createSuccessResponse(result);
    } else {
      console.log('✅ Backend not initialized, cannot process request');
      throw new Error('Backend not initialized');
    }
  } catch (error) {
    console.log('✅ createErrorResponse called with error:', error);
    // Sử dụng status code từ error nếu có, ngược lại mặc định là 500
    const status = error.status || 500;
    return createErrorResponse(status, error.message);
  }
}

// Generic IPC handler cho tất cả backend requests với headers support
ipcMain.handle('backend-request', async (event, method, url, data, headers) => {
  console.log('📨 IPC request received:', method, url);
  if (data) {
    console.log('📦 Request data:', JSON.stringify(data).substring(0, 200));
  }
  try {
    const result = await makeBackendRequest(method, url, data, headers);
    console.log('✅ Request successful');
    return result;
  } catch (error) {
    console.error('❌ Request failed:', error);
    throw error;
  }
});



// Cleanup function for embedded backend
async function cleanupBackend() {
  try {
    console.log('🧹 Cleaning up backend resources...');
    
    // Close database if initialized
    if (typeof closeDatabase === 'function') {
      const { closeDatabase } = await import('./dist/db.js');
      await closeDatabase();
      console.log('✅ Database connection closed');
    }
  } catch (error) {
    console.error('Error during backend cleanup:', error);
  }
}

// Xử lý lifecycle events
app.whenReady().then(async () => {
  console.log('=== APP READY EVENT ===');
  
  // Set app user model ID for Windows
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.antidetect.browser');
  }
  
  // Khởi tạo embedded backend
  console.log('🚀 Initializing embedded backend...');
  const backendInitialized = await initializeBackend();
  
  if (!backendInitialized) {
    console.warn('⚠️ Backend initialization failed, falling back to HTTP mode');
    // Fallback to separate backend process if needed
    startBackend();
  } else {
    console.log('✅ Embedded backend ready');
  }
  
  // Tạo window
  createWindow();

  app.on('activate', () => {
    console.log('=== APP ACTIVATE EVENT ===');
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', async () => {
  console.log('=== ALL WINDOWS CLOSED ===');
  
  // Cleanup backend resources
  await cleanupBackend();
  
  // Kill external backend process if running
  if (backendProcess) {
    console.log('Terminating backend process...');
    backendProcess.kill();
    backendProcess = null;
  }
  
  // Quit app on all platforms except macOS
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', async (event) => {
  console.log('=== APP BEFORE QUIT ===');
  
  // Prevent quit to allow cleanup
  event.preventDefault();
  
  // Cleanup backend resources
  await cleanupBackend();
  
  // Kill external backend process if running
  if (backendProcess) {
    console.log('Terminating backend process...');
    backendProcess.kill();
    backendProcess = null;
  }
  
  // Now actually quit
  app.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});