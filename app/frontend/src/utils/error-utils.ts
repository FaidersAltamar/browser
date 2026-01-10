/**
 * Funciones auxiliares para manejo de errores en servicios API
 * Proporciona una forma consistente de manejar errores en toda la aplicación
 */

/**
 * Registrar error con formato consistente
 * @param serviceName Nombre del servicio que encontró el error
 * @param methodName Nombre del método que encontró el error
 * @param error Objeto de error capturado
 */
export function logServiceError(serviceName: string, methodName: string, error: unknown): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(`[${serviceName}] Error en ${methodName}: ${errorMessage}`);
  
  // Registrar stack trace adicional en entorno de desarrollo
  if (process.env.NODE_ENV !== 'production' && error instanceof Error && error.stack) {
    console.debug(`Stack trace: ${error.stack}`);
  }
}
/**
 * Wrapper avanzado para manejar respuestas API que se espera que sean un array.
 * 1. Verifica si la solicitud API tuvo éxito a nivel HTTP (status 2xx).
 * 2. Si falla, lanza un error claro con el mensaje del servidor.
 * 3. Si tiene éxito, busca y devuelve los datos del array, incluso si está anidado en un objeto.
 * 4. Si la respuesta es exitosa pero no se encuentra el array, registrará una advertencia y devolverá un array vacío.
 *
 * @param promise Promise de la llamada API, debería ser un Promise<Response> de fetch.
 * @param serviceName Nombre del servicio para registrar.
 * @param methodName Nombre del método para registrar.
 * @returns Promise que contiene el array de resultados.
 * @throws {Error} Lanza error si la respuesta de la API es un error (ej: status 401, 500).
 */
export async function handleArrayResponse<T>(
  promise: Promise<Response>, // Nên dùng kiểu Response rõ ràng hơn là any
  serviceName: string,
  methodName: string
): Promise<T[]> {
  const response = await promise;

  // PASO 1: VERIFICAR RESPUESTA HTTP
  // Este es el paso más importante que faltaba en el código original.
  if (!response.ok) {
    let errorData;
    try {
      // Intentar analizar el contenido del error como JSON (caso común)
      errorData = await response.json();
    } catch (e) {
      // Si no es JSON, obtener como texto
      errorData = await response.text();
    }

    // Crear y LANZAR un error claro. Esto será capturado por el bloque `catch`
    // en las funciones que lo llaman (como getWorkflows).
    const errorMessage =
      errorData?.message || JSON.stringify(errorData) || response.statusText;
    throw new Error(
      `[${serviceName}] ${methodName}: Solicitud API falló con status ${response.status}. Error: ${errorMessage}`
    );
  }

  // PASO 2: MANEJAR CUANDO LA RESPUESTA ES EXITOSA
  try {
    const data = await response.json();

    // Lógica para encontrar el array - muy buena y debería mantenerse
    if (Array.isArray(data)) {
      return data;
    }

    if (data && typeof data === 'object') {
      const possibleArrayProps = ['data', 'items', 'results', 'content', 'list','products', 'categories', 'tags'];
      for (const prop of possibleArrayProps) {
        if (Array.isArray(data[prop])) {
          return data[prop];
        }
      }
    }

    // Si la respuesta es exitosa pero el formato no es el esperado
    console.warn(
      `[${serviceName}] ${methodName}: Respuesta exitosa pero los datos no contienen el formato de array esperado:`,
      data
    );
    return []; // Devolver array vacío según la intención original
  } catch (error) {
    // Capturar error si response.json() falla (ej: body vacío o no es JSON)
    throw new Error(
      `[${serviceName}] ${methodName}: No se pudo analizar la respuesta JSON de una solicitud exitosa.`
    );
  }
}

/**
 * Wrapper para manejar errores al llamar API que devuelve un objeto único
 * @param promise Promise de la llamada API que devuelve un objeto
 * @param serviceName Nombre del servicio
 * @param methodName Nombre del método
 * @param defaultValue Valor por defecto si hay error (opcional)
 * @returns Objeto resultado o defaultValue si hay error
 */
export async function handleObjectResponse<T>(
  promise: Promise<any>,
  serviceName: string,
  methodName: string,
  defaultValue: T
): Promise<T> {
  const response = await promise;

  // PASO 1: VERIFICAR RESPUESTA HTTP (similar a handleArrayResponse)
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = await response.text();
    }

    const errorMessage =
      errorData?.message || JSON.stringify(errorData) || response.statusText;
    
    // Manejo especial para errores de autenticación
    if (response.status === 401) {
      throw new Error(
        `[${serviceName}] ${methodName}: La sesión ha expirado o no es válida. ${errorMessage}`
      );
    }
    
    if (response.status === 403) {
      throw new Error(
        `[${serviceName}] ${methodName}: No tienes permiso para acceder. ${errorMessage}`
      );
    }

    throw new Error(
      `[${serviceName}] ${methodName}: Solicitud API falló con status ${response.status}. Error: ${errorMessage}`
    );
  }

  // PASO 2: MANEJAR CUANDO LA RESPUESTA ES EXITOSA
  try {
    const data = await response.json();
    
    // Muchas APIs pueden devolver datos en estructuras diferentes
    // Ejemplo: { data: {...} } o { profile: {...} } o directamente el objeto
    
    if (data && typeof data === 'object') {
      if (!Array.isArray(data)) {
        // Caso donde hay propiedades envolventes
        const possibleObjProps = ['data', 'profile', 'result', 'content', 'item'];
        for (const prop of possibleObjProps) {
          if (data[prop] && typeof data[prop] === 'object' && !Array.isArray(data[prop])) {
            return data[prop] as T;
          }
        }
        
        // Si tiene id es un dato válido (para entidades)
        if ('id' in data) {
          return data as T;
        }
        return data as T; 
      }
      
      console.warn(`[${serviceName}] ${methodName}: Los datos no tienen el formato de objeto correcto:`, data);
    }
    
    return defaultValue;
  } catch (error) {
    throw new Error(
      `[${serviceName}] ${methodName}: No se pudo analizar la respuesta JSON de una solicitud exitosa.`
    );
  }
}

/**
 * Manejar errores para métodos de mutación (agregar, editar, eliminar)
 * @param promise Promise de la llamada API
 * @param serviceName Nombre del servicio
 * @param methodName Nombre del método
 * @param throwError Si debe lanzar error o no, por defecto es true
 * @returns Resultado de la llamada API o null si hay error
 */
export async function handleMutationResponse<T>(
  promise: Promise<any>,
  serviceName: string,
  methodName: string,
  throwError: boolean = true
): Promise<T> {
  const response = await promise;

  // PASO 1: VERIFICAR RESPUESTA HTTP (similar a handleArrayResponse)
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = await response.text();
    }

    const errorMessage =
      errorData?.message || JSON.stringify(errorData) || response.statusText;
    
    // Manejo especial para errores de autenticación
    if (response.status === 401) {
      const authError = new Error(
        `[${serviceName}] ${methodName}: La sesión ha expirado o no es válida. ${errorMessage}`
      );
      if (throwError) throw authError;
      logServiceError(serviceName, methodName, authError);
      return {} as T;
    }
    
    if (response.status === 403) {
      const permError = new Error(
        `[${serviceName}] ${methodName}: No tienes permiso para realizar esta acción. ${errorMessage}`
      );
      if (throwError) throw permError;
      logServiceError(serviceName, methodName, permError);
      return {} as T;
    }

    const apiError = new Error(
      `[${serviceName}] ${methodName}: Solicitud API falló con status ${response.status}. Error: ${errorMessage}`
    );
    if (throwError) throw apiError;
    logServiceError(serviceName, methodName, apiError);
    return {} as T;
  }

  // PASO 2: MANEJAR CUANDO LA RESPUESTA ES EXITOSA
  try {
    const data = await response.json();
    
    // Las mutaciones generalmente devuelven objeto directamente o envuelto en data
    if (data && typeof data === 'object') {
      // Verificar propiedades envolventes comunes
      const possibleProps = ['data', 'result', 'response', 'item'];
      for (const prop of possibleProps) {
        if (data[prop] !== undefined) {
          return data[prop] as T;
        }
      }
      
      // Devolver directamente si no hay wrapper
      return data as T;
    }
    
    return data as T;
  } catch (error) {
    const parseError = new Error(
      `[${serviceName}] ${methodName}: No se pudo analizar la respuesta JSON de una solicitud exitosa.`
    );
    if (throwError) throw parseError;
    logServiceError(serviceName, methodName, parseError);
    return {} as T;
  }
}

/**
 * Formatear error para mostrarlo de forma amigable al usuario
 * @param error Objeto de error
 * @returns Cadena de mensaje de error amigable
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message;
    
    // Manejar errores desde auth.middleware.ts
    if (message.includes('Authorization header is required')) {
      return 'Por favor, inicia sesión para continuar.';
    }
    
    if (message.includes('Invalid authorization format')) {
      return 'Formato de autenticación no válido. Por favor, inicia sesión nuevamente.';
    }
    
    if (message.includes('Invalid token payload') || message.includes('Invalid or expired token')) {
      return 'La sesión ha expirado. Por favor, inicia sesión nuevamente.';
    }
    
    // Manejar tipos específicos de errores HTTP
    if (message.includes('Network Error') || message.includes('Failed to fetch')) {
      return 'No se pudo conectar al servidor. Por favor, verifica tu conexión de red.';
    }
    
    if (message.includes('401') || message.includes('Unauthorized') || message.includes('La sesión ha expirado')) {
      return 'La sesión ha expirado. Por favor, inicia sesión nuevamente.';
    }
    
    if (message.includes('403') || message.includes('Forbidden') || message.includes('no tienes permiso')) {
      return 'No tienes permiso para realizar esta acción.';
    }
    
    if (message.includes('404') || message.includes('Not Found')) {
      return 'No se encontró el recurso solicitado.';
    }
    
    if (message.includes('500') || message.includes('Internal Server Error')) {
      return 'Ocurrió un error en el servidor. Por favor, intenta nuevamente más tarde.';
    }
    
    if (message.includes('400') || message.includes('Bad Request')) {
      return 'Los datos enviados no son válidos. Por favor, verifica la información.';
    }
    
    // Devolver mensaje original si ya fue formateado por otras funciones handle
    if (message.includes('[') && message.includes(']')) {
      return message;
    }
    
    return error.message;
  }
  
  return 'Ocurrió un error desconocido.';
}