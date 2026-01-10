import { ProfileModel } from "../models/Profile";
import { ProfileGroupModel } from "../models/ProfileGroup";
import { ProfileSessionModel } from "../models/ProfileSession";
import { ProxyModel } from "../models/Proxy";
import * as playwright from "playwright";
import { UtilService } from "../utils/utils.service";
// Dynamic import for p-limit to avoid ES Module issues
let pLimit: any;
import { WorkflowExecutionModel } from "../models/WorkflowExecution";
import { randomInt } from "crypto";
import { executeWorkflow } from "../workflow/executor";

// Sistema de gestión de sesiones activas para mantener navegadores abiertos
interface ActiveSession {
  context: playwright.BrowserContext;
  page: playwright.Page;
  browser: playwright.Browser | null;
  profileId: string;
  userId: string;
  startTime: Date;
}

// Map para almacenar sesiones activas: profileId -> ActiveSession
const activeSessions = new Map<string, ActiveSession>();

export class LaunchService {
  /**
   * Obtiene una sesión activa por profileId
   */
  static getActiveSession(profileId: string): ActiveSession | undefined {
    return activeSessions.get(profileId);
  }

  /**
   * Verifica si un perfil tiene una sesión activa
   */
  static hasActiveSession(profileId: string): boolean {
    return activeSessions.has(profileId);
  }

  /**
   * Cierra una sesión activa y el navegador asociado
   */
  static async closeSession(profileId: string): Promise<void> {
    const session = activeSessions.get(profileId);
    if (session) {
      try {
        console.log(`Cerrando sesión activa para el perfil ${profileId}...`);
        await session.context.close();
        activeSessions.delete(profileId);
        await ProfileModel.update(parseInt(profileId), { status: "idle" });
        console.log(`✅ Sesión cerrada para el perfil ${profileId}`);
      } catch (error: any) {
        console.error(`Error al cerrar sesión para el perfil ${profileId}:`, error);
        activeSessions.delete(profileId);
      }
    }
  }

  /**
   * Cierra todas las sesiones activas
   */
  static async closeAllSessions(): Promise<void> {
    const closePromises = Array.from(activeSessions.keys()).map(profileId =>
      this.closeSession(profileId).catch(err =>
        console.error(`Error al cerrar sesión ${profileId}:`, err)
      )
    );
    await Promise.all(closePromises);
  }
  static async launchProfile(
    userId: string,
    profileId: string,
    options: any = {},
  ) {
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

      const profile = await ProfileModel.findById(parseInt(profileId, 10));

      if (!profile) {
        throw new Error(
          "El perfil no existe o no pertenece al usuario.",
        );
      }

      console.log(`🚀 Iniciando navegador para el perfil ${profileId}...`);
      
      // Lanzar el navegador con Playwright
      const {
        context: browserContext,
        page,
        browser,
      } = await UtilService.launch(profile, options);

      console.log(`✅ Navegador iniciado exitosamente para el perfil ${profileId}`);

      // Crear sesión activa y almacenarla en el Map
      const session: ActiveSession = {
        context: browserContext,
        page: page,
        browser: browser,
        profileId: profileId,
        userId: userId,
        startTime: new Date(),
      };

      activeSessions.set(profileId, session);

      // Actualizar estado del perfil a "active"
      await ProfileModel.update(profile.id, { status: "active" });

      // Configurar listener para cuando el navegador se cierre automáticamente
      browserContext.on('close', () => {
        console.log(`⚠️ Navegador cerrado automáticamente para el perfil ${profileId}`);
        activeSessions.delete(profileId);
        ProfileModel.update(parseInt(profileId), { status: "idle" }).catch(err =>
          console.error(`Error al actualizar estado del perfil ${profileId}:`, err)
        );
      });

      console.log(`✅ Sesión activa creada y almacenada para el perfil ${profileId}`);
      console.log(`📊 Sesiones activas totales: ${activeSessions.size}`);

      return { 
        success: true, 
        profileId: profile.id,
        sessionId: profileId,
        message: "Navegador iniciado exitosamente"
      };
    } catch (error: any) {
      console.error(
        `❌ Error al iniciar navegador para el perfil ${profileId}:`,
        error.message,
      );
      
      // Limpiar sesión si existe
      activeSessions.delete(profileId);
      
      throw new Error(`Failed to launch browser: ${error.message}`);
    }
  }

  static async launchConcurrentProfiles(
    userId: string,
    profileIds: string[],
    concurrent: number,
    options: any = {},
  ) {
    const queue = [...profileIds]; // Crear cola desde la lista de profileIds
    const sessions: any[] = []; // Guardar información de las sesiones ejecutadas

    const launchProfile = async (profileId: string) => {
      try {
        // Tìm profile trong database
        const profile = await ProfileModel.findById(parseInt(profileId));

        if (!profile) {
          throw new Error(
            `El perfil ${profileId} no existe o no pertenece al usuario.`,
          );
        }

        console.log(`Iniciando navegador para el perfil ${profileId}...`);
        const { context, page, browser } = await UtilService.launch(
          profile,
          options,
        );

        // const { context, page, browser } = await UtilService.launchTest(
        //   options,
        // );
        console.log(`El navegador se ha iniciado para el perfil ${profileId}.`);

        // Actualizar estado del perfil
        await ProfileModel.update(profile.id, { status: "active" });

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
        await new Promise((resolve) => setTimeout(resolve, randomInt(5000, 10000))); // Esperar 10 segundos
        await context.close(); // Cerrar navegador después de completar
      } catch (error: any) {
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

  static async launchConcurrentGroupProfiles(
    userId: string,
    groupId: string,
    concurrent: number,
    options: any = {},
  ) {
    try {
      const groupMembers = await ProfileGroupModel.getProfiles(
        parseInt(groupId),
      );

      if (groupMembers.length === 0) {
        throw new Error(
          `No hay perfiles en el grupo ${groupId} que pertenezcan al usuario.`,
        );
      }

      const profileIds = groupMembers.map((profile) => profile.id.toString());

      return await this.launchConcurrentProfiles(
        userId,
        profileIds,
        concurrent,
        options,
      );
    } catch (error: any) {
      console.error(`Error al obtener perfiles del grupo ${groupId}:`, error);
      throw new Error(`No se pudo ejecutar el grupo de perfiles: ${error.message}`);
    }
  }

  /**
     * Ejecutar workflow con un perfil individual y gestionar la ejecución
     */
  static async executeWorkflowWithProfile(userId: string, profileId: string, workflowId: string, options: any = {}) {
    try {
      const profile = await ProfileModel.findById(parseInt(profileId));

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

      const { context, page, browser } = await UtilService.launch(options);
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
        let execution = executeWorkflow(workflowId,context, page, userId);
        console.error(`Finalizada ejecución de perfil con workflow ${workflowId}:`);

        return execution;
      } catch (workflowError) {
        // Actualizar ejecución a "failed"
        // if (execution) {
        //   await WorkflowExecutionModel.update(execution.id, {
        //     status: "failed",
        //     endTime: new Date(),
        //     errorMessage: workflowError instanceof Error ? workflowError.message : "Workflow execution failed",
        //   });
        // }
        throw workflowError;
      } finally {
        await context.close(); // Cerrar contexto después de completar
      }
    } catch (error) {
      console.error(`Error executing workflow for profile ${profileId}:`, error);
      throw error;
    }
  }

  /**
   * Ejecutar workflow con una lista de perfiles junto con el número de hilos concurrentes
   */
  static async executeWorkflowWithProfiles(userId: string, profileIds: string[], workflowId: string, concurrent: number, options: any = {}) {
    if (!pLimit) {
      const pLimitModule = await import('p-limit');
      pLimit = pLimitModule.default || pLimitModule;
    }
    const limit = pLimit(concurrent); // Limitar el número de hilos concurrentes
    const executionPromises = profileIds.map(profileId =>
      limit(() => this.executeWorkflowWithProfile(userId, profileId, workflowId, options).catch(error => {
        console.error(`Error ejecutando workflow para el perfil ${profileId}:`, error);
        return null; // Devolver null si hay error para no interrumpir otros hilos
      }))
    );
    const results = await Promise.all(executionPromises);
    return results.filter(result => result !== null); // Filtrar resultados con error
  }

  /**
   * Ejecutar workflow con un grupo de perfiles junto con el número de hilos concurrentes
   */
  static async executeWorkflowWithProfileGroup(userId: string, groupId: string, workflowId: string, concurrent: number, options: any = {}) {
    const group = await ProfileGroupModel.findById(parseInt(groupId));
    if (!group) throw new Error("Profile group not found");

    const profiles = await ProfileGroupModel.getProfiles(parseInt(groupId));

    const profileIds = profiles.map(profile => profile.id.toString());
    return this.executeWorkflowWithProfiles(userId, profileIds, workflowId, concurrent, options);
  }
}