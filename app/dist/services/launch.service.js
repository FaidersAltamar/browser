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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LaunchService = void 0;
const Profile_1 = require("../models/Profile");
const ProfileGroup_1 = require("../models/ProfileGroup");
const utils_service_1 = require("../utils/utils.service");
// Dynamic import for p-limit to avoid ES Module issues
let pLimit;
const crypto_1 = require("crypto");
const executor_1 = require("../workflow/executor");
// Map para almacenar sesiones activas: profileId -> ActiveSession
const activeSessions = new Map();
class LaunchService {
    /**
     * Obtiene una sesión activa por profileId
     */
    static getActiveSession(profileId) {
        return activeSessions.get(profileId);
    }
    /**
     * Verifica si un perfil tiene una sesión activa
     */
    static hasActiveSession(profileId) {
        return activeSessions.has(profileId);
    }
    /**
     * Cierra una sesión activa y el navegador asociado
     */
    static async closeSession(profileId) {
        const session = activeSessions.get(profileId);
        if (session) {
            try {
                console.log(`Cerrando sesión activa para el perfil ${profileId}...`);
                await session.context.close();
                activeSessions.delete(profileId);
                await Profile_1.ProfileModel.update(parseInt(profileId), { status: "idle" });
                console.log(`✅ Sesión cerrada para el perfil ${profileId}`);
            }
            catch (error) {
                console.error(`Error al cerrar sesión para el perfil ${profileId}:`, error);
                activeSessions.delete(profileId);
            }
        }
    }
    /**
     * Cierra todas las sesiones activas
     */
    static async closeAllSessions() {
        const closePromises = Array.from(activeSessions.keys()).map(profileId => this.closeSession(profileId).catch(err => console.error(`Error al cerrar sesión ${profileId}:`, err)));
        await Promise.all(closePromises);
    }
    static async launchProfile(userId, profileId, options = {}) {
        try {
            // Verificar si ya existe una sesión activa para este perfil
            if (activeSessions.has(profileId)) {
                console.log(`⚠️ Ya existe una sesión activa para el perfil ${profileId}`);
                return {
                    success: true,
                    profileId: profileId,
                    message: "El perfil ya está en ejecución"
                };
            }
            const profile = await Profile_1.ProfileModel.findById(parseInt(profileId, 10));
            if (!profile) {
                throw new Error("El perfil no existe o no pertenece al usuario.");
            }
            console.log(`🚀 Iniciando navegador para el perfil ${profileId}...`);
            // Lanzar el navegador con Playwright
            const { context: browserContext, page, browser, } = await utils_service_1.UtilService.launch(profile, options);
            console.log(`✅ Navegador iniciado exitosamente para el perfil ${profileId}`);
            // Crear sesión activa y almacenarla en el Map
            const session = {
                context: browserContext,
                page: page,
                browser: browser,
                profileId: profileId,
                userId: userId,
                startTime: new Date(),
            };
            activeSessions.set(profileId, session);
            // Actualizar estado del perfil a "active"
            await Profile_1.ProfileModel.update(profile.id, { status: "active" });
            // Configurar listener para cuando el navegador se cierre automáticamente
            browserContext.on('close', () => {
                console.log(`⚠️ Navegador cerrado automáticamente para el perfil ${profileId}`);
                activeSessions.delete(profileId);
                Profile_1.ProfileModel.update(parseInt(profileId), { status: "idle" }).catch(err => console.error(`Error al actualizar estado del perfil ${profileId}:`, err));
            });
            console.log(`✅ Sesión activa creada y almacenada para el perfil ${profileId}`);
            console.log(`📊 Sesiones activas totales: ${activeSessions.size}`);
            return {
                success: true,
                profileId: profile.id,
                sessionId: profileId,
                message: "Navegador iniciado exitosamente"
            };
        }
        catch (error) {
            console.error(`❌ Error al iniciar navegador para el perfil ${profileId}:`, error.message);
            // Limpiar sesión si existe
            activeSessions.delete(profileId);
            throw new Error(`Failed to launch browser: ${error.message}`);
        }
    }
    static async launchConcurrentProfiles(userId, profileIds, concurrent, options = {}) {
        const queue = [...profileIds]; // Crear cola desde la lista de profileIds
        const sessions = []; // Guardar información de las sesiones ejecutadas
        const launchProfile = async (profileId) => {
            try {
                // Tìm profile trong database
                const profile = await Profile_1.ProfileModel.findById(parseInt(profileId));
                if (!profile) {
                    throw new Error(`El perfil ${profileId} no existe o no pertenece al usuario.`);
                }
                console.log(`Iniciando navegador para el perfil ${profileId}...`);
                const { context, page, browser } = await utils_service_1.UtilService.launch(profile, options);
                // const { context, page, browser } = await UtilService.launchTest(
                //   options,
                // );
                console.log(`El navegador se ha iniciado para el perfil ${profileId}.`);
                // Actualizar estado del perfil
                await Profile_1.ProfileModel.update(profile.id, { status: "active" });
                // Tạo session mới cho profile
                // const fingerprintData = profile.fingerprint ? JSON.parse(profile.fingerprint) : {};
                // const userAgent = fingerprintData.userAgent || (await page.evaluate("navigator.userAgent"));
                // const newSession = await ProfileSessionModel.create({
                //   profileId: profile.id.toString(),
                //   status: "running",
                //   startTime: new Date(),
                //   userAgent,
                //   ip: "DYNAMIC_IP_FROM_PROXY_CHECK",
                // });
                // sessions.push(newSession);
                // Simular automatización completada o perfil cerrado (puede ser reemplazado por lógica real)
                await new Promise((resolve) => setTimeout(resolve, (0, crypto_1.randomInt)(5000, 10000))); // Esperar 10 segundos
                await context.close(); // Cerrar navegador después de completar
            }
            catch (error) {
                console.error(`Error al iniciar el perfil ${profileId}:`, error);
            }
        };
        // Crear workers para procesar la cola
        const workers = Array.from({ length: concurrent }, async () => {
            while (queue.length > 0) {
                const profileId = queue.shift(); // Obtener el siguiente perfil de la cola
                if (profileId) {
                    // await limit(() => launchProfile(profileId)); // Ejecutar perfil dentro del límite de hilos
                    await launchProfile(profileId);
                }
            }
        });
        await Promise.all(workers); // Esperar a que todos los workers terminen
        return "sessions";
    }
    static async launchConcurrentGroupProfiles(userId, groupId, concurrent, options = {}) {
        try {
            const groupMembers = await ProfileGroup_1.ProfileGroupModel.getProfiles(parseInt(groupId));
            if (groupMembers.length === 0) {
                throw new Error(`No hay perfiles en el grupo ${groupId} que pertenezcan al usuario.`);
            }
            const profileIds = groupMembers.map((profile) => profile.id.toString());
            return await this.launchConcurrentProfiles(userId, profileIds, concurrent, options);
        }
        catch (error) {
            console.error(`Error al obtener perfiles del grupo ${groupId}:`, error);
            throw new Error(`No se pudo ejecutar el grupo de perfiles: ${error.message}`);
        }
    }
    /**
       * Ejecutar workflow con un perfil individual y gestionar la ejecución
       */
    static async executeWorkflowWithProfile(userId, profileId, workflowId, options = {}) {
        try {
            const profile = await Profile_1.ProfileModel.findById(parseInt(profileId));
            // Crear registro de ejecución con estado "running"
            // const execution = await WorkflowExecutionModel.create({
            //   workflowId: parseInt(workflowId),
            //   status: "running",
            //   startTime: new Date(),
            //   progress: JSON.stringify({ completed: 0, total: 100, percentComplete: 0 }),
            // });
            if (!profile) {
                throw new Error(`El perfil ${profileId} no se encontró`);
            }
            const { context, page, browser } = await utils_service_1.UtilService.launch(options);
            try {
                // TODO: Implementar lógica de ejecución de workflow
                // const result = { variables: {} };
                // // Actualizar ejecución a "completed"
                // if (execution) {
                //   await WorkflowExecutionModel.update(execution.id, {
                //     status: "completed",
                //     endTime: new Date(),
                //     results: JSON.stringify({
                //       successCount: 1,
                //       failureCount: 0,
                //       details: [{ profileId, success: true, variables: result.variables || {} }],
                //     }),
                //     progress: JSON.stringify({ completed: 100, total: 100, percentComplete: 100 }),
                //   });
                // }
                console.error(`Intentando ejecutar perfil con workflow ${workflowId}:`);
                let execution = (0, executor_1.executeWorkflow)(workflowId, context, page, userId);
                console.error(`Finalizada ejecución de perfil con workflow ${workflowId}:`);
                return execution;
            }
            catch (workflowError) {
                // Actualizar ejecución a "failed"
                // if (execution) {
                //   await WorkflowExecutionModel.update(execution.id, {
                //     status: "failed",
                //     endTime: new Date(),
                //     errorMessage: workflowError instanceof Error ? workflowError.message : "Workflow execution failed",
                //   });
                // }
                throw workflowError;
            }
            finally {
                await context.close(); // Cerrar contexto después de completar
            }
        }
        catch (error) {
            console.error(`Error executing workflow for profile ${profileId}:`, error);
            throw error;
        }
    }
    /**
     * Ejecutar workflow con una lista de perfiles junto con el número de hilos concurrentes
     */
    static async executeWorkflowWithProfiles(userId, profileIds, workflowId, concurrent, options = {}) {
        if (!pLimit) {
            const pLimitModule = await Promise.resolve().then(() => __importStar(require('p-limit')));
            pLimit = pLimitModule.default || pLimitModule;
        }
        const limit = pLimit(concurrent); // Limitar el número de hilos concurrentes
        const executionPromises = profileIds.map(profileId => limit(() => this.executeWorkflowWithProfile(userId, profileId, workflowId, options).catch(error => {
            console.error(`Error ejecutando workflow para el perfil ${profileId}:`, error);
            return null; // Devolver null si hay error para no interrumpir otros hilos
        })));
        const results = await Promise.all(executionPromises);
        return results.filter(result => result !== null); // Filtrar resultados con error
    }
    /**
     * Ejecutar workflow con un grupo de perfiles junto con el número de hilos concurrentes
     */
    static async executeWorkflowWithProfileGroup(userId, groupId, workflowId, concurrent, options = {}) {
        const group = await ProfileGroup_1.ProfileGroupModel.findById(parseInt(groupId));
        if (!group)
            throw new Error("Profile group not found");
        const profiles = await ProfileGroup_1.ProfileGroupModel.getProfiles(parseInt(groupId));
        const profileIds = profiles.map(profile => profile.id.toString());
        return this.executeWorkflowWithProfiles(userId, profileIds, workflowId, concurrent, options);
    }
}
exports.LaunchService = LaunchService;
