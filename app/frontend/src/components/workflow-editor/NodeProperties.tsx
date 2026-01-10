import React from 'react';
import { useWorkflowContext } from '@/context/WorkflowContext';
import { Settings, X, ChevronDown, Copy, Info } from 'lucide-react';

// Danh sách các mô tả parameter để hiển thị gợi ý
interface ParameterDescription {
  [key: string]: string;
}

// Định nghĩa kiểu dữ liệu Range cho min-max
interface RangeValue {
  min: number;
  max: number;
}

const commonParameterDescriptions: ParameterDescription = {
  url: "Dirección URL a abrir o enviar solicitud",
  selector: "Selector CSS para encontrar elemento en la página",
  timeout: "Tiempo de espera máximo (ms) antes de que expire",
  postActionDelay: "Tiempo de espera después de que se complete la acción (ms)",
  text: "Texto a ingresar o usar",
  outputVariable: "Nombre de variable para guardar el resultado",
  visible: "Verificar si el elemento está visible",
};

// Etiquetas cortas y claras para cada tipo de parámetro
const parameterLabels: ParameterDescription = {
  url: "URL",
  selector: "Selector",
  text: "Texto",
  timeout: "Tiempo de espera (ms)",
  postActionDelay: "Retraso",
  outputVariable: "Variable de salida",
  ignoreCache: "Ignorar caché",
  activate: "Activar",
  identifier: "Identificador",
  identifierType: "Tipo de identificador",
  urlPattern: "Patrón URL",
  clickType: "Tipo de clic",
  button: "Botón del mouse",
  x: "Coordenada X",
  y: "Coordenada Y",
  moveType: "Tipo de movimiento",
  sourceSelector: "Selector origen",
  targetSelector: "Selector destino",
  behavior: "Comportamiento",
  block: "Posición",
  deltaX: "Delta X",
  deltaY: "Delta Y",
  delay: "Retraso al escribir",
  replace: "Reemplazar contenido",
  name: "Nombre",
  value: "Valor",
  type: "Tipo",
  amount: "Cantidad",
  attribute: "Atributo",
  length: "Longitud",
  customFormat: "Formato personalizado",
  code: "Código",
  input: "Entrada",
  inputType: "Tipo de entrada",
  operation: "Operación",
  condition: "Condición",
  description: "Descripción",
  times: "Número de veces",
  varName: "Nombre de variable",
  maxIterations: "Número máximo de iteraciones",
  duration: "Duración",
  minScrolls: "Número mínimo de desplazamientos",
  maxScrolls: "Número máximo de desplazamientos",
  minDistance: "Distancia mínima",
  maxDistance: "Distancia máxima",
  interval: "Intervalo de tiempo",
  filename: "Nombre de archivo",
  saveDirectory: "Directorio de guardado",
  method: "Método",
  headers: "Headers",
  body: "Body",
  message: "Mensaje",
  level: "Nivel",
  scriptId: "ID de script",
  inputParameters: "Parámetros de entrada",
  waitForCompletion: "Esperar completación",
  filepath: "Ruta de archivo",
  multiple: "Múltiples archivos",
  idleTime: "Tiempo de inactividad",
  idleConnections: "Conexiones en espera",
  maxTries: "Número de intentos",
  intervalBetweenTries: "Intervalo entre intentos",
  smoothness: "Suavidad",
};

const NodeProperties = () => {
  const { selectedNode, updateNodeData, deleteNode, duplicateNode } = useWorkflowContext();

  if (!selectedNode) {
    return (
      <div className="p-4 text-center text-gray-500 bg-white h-full">
        <Settings className="h-12 w-12 mx-auto mb-3 opacity-40" />
        <h3 className="text-lg font-medium mb-1">Nodo no seleccionado</h3>
        <p className="text-sm">Selecciona un nodo para ver y editar sus propiedades</p>
      </div>
    );
  }

  const handleParamChange = (key: string, value: string | boolean | number | string[] | any) => {
    if (!selectedNode || !selectedNode.data) return;
    
    const updatedParams = {
      ...selectedNode.data.parameters,
      [key]: value
    };
    
    updateNodeData(selectedNode.id, { parameters: updatedParams });
  };

  // Manejar cambios en el slider de rango para valores min/max
  const handleRangeChange = (key: string, minOrMax: 'min' | 'max', value: number) => {
    if (!selectedNode || !selectedNode.data || !selectedNode.data.parameters) return;
    
    // Obtener el valor actual o crear un valor por defecto si no existe
    const paramValue = selectedNode.data.parameters[key];
    
    // Crear un nuevo RangeValue
    let rangeValue: RangeValue = { min: 0, max: 5000 };
    
    // Si el valor actual es un objeto con estructura min-max, usarlos
    if (typeof paramValue === 'object' && paramValue !== null && 
        typeof (paramValue as any).min !== 'undefined' && 
        typeof (paramValue as any).max !== 'undefined') {
      rangeValue = {
        min: typeof (paramValue as any).min === 'number' ? (paramValue as any).min : 0,
        max: typeof (paramValue as any).max === 'number' ? (paramValue as any).max : 5000
      };
    }
    
    // Actualizar el valor min o max
    rangeValue[minOrMax] = value;
    
    // Enviar el valor actualizado
    handleParamChange(key, rangeValue);
  };

  // Check if this parameter should be rendered as a dropdown
  const shouldRenderAsDropdown = (key: string): string[] | null => {
    // HTTP methods for API calls
    if (key === 'method') {
      return ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    }
    
    // Log levels
    if (key === 'level') {
      return ['info', 'warn', 'error', 'debug'];
    }
    
    // Click types
    if (key === 'clickType' || key === 'button') {
      return ['left', 'right', 'middle'];
    }
    
    // Behavior
    if (key === 'behavior') {
      return ['smooth', 'auto'];
    }
    
    // Block position
    if (key === 'block') {
      return ['start', 'center', 'end', 'nearest'];
    }
    
    // Move type
    if (key === 'moveType') {
      return ['element', 'coordinates'];
    }
    
    // Identifier type
    if (key === 'identifierType') {
      return ['index', 'id', 'title', 'url'];
    }
    
    // Data type for data variables
    if (key === 'type') {
      return ['string', 'number', 'boolean', 'array', 'object'];
    }
    
    // Add more dropdown mappings as needed
    return null;
  };

  const renderParameterInput = (key: string, value: string | boolean | number | any) => {
    // Mostrar nombre corto y claro para el parámetro
    const displayName = parameterLabels[key] || key;
    const tooltip = commonParameterDescriptions[key] || "";
    
    // Para parámetros con estructura min-max (como postActionDelay, duration, interval...)
    if (typeof value === 'object' && value !== null && 'min' in value && 'max' in value) {
      return (
        <div key={key} className="mb-6 pb-2 border-b border-gray-100">
          <div className="flex items-center mb-2">
            <label className="text-sm font-medium">{displayName}</label>
            {tooltip && (
              <div className="ml-1 text-gray-500 cursor-help group relative">
                <Info className="h-3.5 w-3.5" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity w-48 z-10">
                  {tooltip}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Min (ms)</label>
              <input
                type="number"
                min="0"
                value={value.min}
                onChange={(e) => handleRangeChange(key, 'min', Number(e.target.value))}
                className="w-full p-1.5 rounded bg-white border border-gray-300 text-gray-700 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Max (ms)</label>
              <input
                type="number"
                min="0"
                value={value.max}
                onChange={(e) => handleRangeChange(key, 'max', Number(e.target.value))}
                className="w-full p-1.5 rounded bg-white border border-gray-300 text-gray-700 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="text-xs text-gray-500 mt-1">
            Intervalo de tiempo aleatorio desde {value.min}ms hasta {value.max}ms
          </div>
        </div>
      );
    }
    
    // Check for dropdown options 
    const dropdownOptions = shouldRenderAsDropdown(key);
    if (dropdownOptions) {
      return (
        <div key={key} className="mb-4">
          <div className="flex items-center mb-1">
            <label className="text-sm font-medium">{displayName}</label>
            {tooltip && (
              <div className="ml-1 text-gray-500 cursor-help group relative">
                <Info className="h-3.5 w-3.5" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity w-48 z-10">
                  {tooltip}
                </div>
              </div>
            )}
          </div>
          <div className="relative">
            <select
              value={value as string}
              onChange={(e) => handleParamChange(key, e.target.value)}
              className="w-full p-2 pr-8 rounded bg-white border border-gray-300 text-gray-700 text-sm appearance-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              {dropdownOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
          </div>
        </div>
      );
    }
    
    if (typeof value === 'boolean') {
      return (
        <div key={key} className="mb-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={`param-${key}`}
              checked={value}
              onChange={(e) => handleParamChange(key, e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor={`param-${key}`} className="text-sm">{displayName}</label>
            
            {tooltip && (
              <div className="text-gray-500 cursor-help group relative">
                <Info className="h-3.5 w-3.5" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity w-48">
                  {tooltip}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    if (typeof value === 'number') {
      return (
        <div key={key} className="mb-4">
          <div className="flex items-center mb-1">
            <label className="text-sm font-medium">{displayName}</label>
            {tooltip && (
              <div className="ml-1 text-gray-500 cursor-help group relative">
                <Info className="h-3.5 w-3.5" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity w-48">
                  {tooltip}
                </div>
              </div>
            )}
          </div>
          <input
            type="number"
            value={value}
            onChange={(e) => handleParamChange(key, Number(e.target.value))}
            className="w-full p-2 rounded bg-white border border-gray-300 text-gray-700 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      );
    }
    
    // Handle array parameters
    if (Array.isArray(value)) {
      return (
        <div key={key} className="mb-4">
          <div className="flex items-center mb-1">
            <label className="text-sm font-medium">{displayName}</label>
            {tooltip && (
              <div className="ml-1 text-gray-500 cursor-help group relative">
                <Info className="h-3.5 w-3.5" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity w-48">
                  {tooltip}
                </div>
              </div>
            )}
          </div>
          <div className="border border-gray-300 rounded p-1 bg-white shadow-sm">
            {value.map((item, index) => (
              <div key={index} className="flex mb-1">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const newArray = [...value];
                    newArray[index] = e.target.value;
                    handleParamChange(key, newArray);
                  }}
                  className="flex-1 p-1 rounded bg-white border border-gray-300 text-gray-700 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={() => {
                    const newArray = value.filter((_, i) => i !== index);
                    handleParamChange(key, newArray);
                  }}
                  className="ml-1 p-1 rounded bg-red-100 text-red-500 hover:bg-red-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <button
              onClick={() => handleParamChange(key, [...value, ''])}
              className="w-full mt-1 p-1 rounded bg-blue-100 text-blue-600 hover:bg-blue-200 text-xs"
            >
              Agregar
            </button>
          </div>
        </div>
      );
    }
    
    // For objects that aren't delay ranges, render a JSON textarea
    if (typeof value === 'object' && value !== null) {
      return (
        <div key={key} className="mb-4">
          <div className="flex items-center mb-1">
            <label className="text-sm font-medium">{displayName}</label>
            {tooltip && (
              <div className="ml-1 text-gray-500 cursor-help group relative">
                <Info className="h-3.5 w-3.5" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity w-48">
                  {tooltip}
                </div>
              </div>
            )}
          </div>
          <textarea
            value={JSON.stringify(value, null, 2)}
            onChange={(e) => {
              try {
                const parsedValue = JSON.parse(e.target.value);
                handleParamChange(key, parsedValue);
              } catch (err) {
                // Handle invalid JSON input
                console.error('Invalid JSON input:', err);
              }
            }}
            className="w-full p-2 rounded bg-white border border-gray-300 text-gray-700 text-sm font-mono focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
          />
        </div>
      );
    }
    
    // Default to string input
    return (
      <div key={key} className="mb-4">
        <div className="flex items-center mb-1">
          <label className="text-sm font-medium">{displayName}</label>
          {tooltip && (
            <div className="ml-1 text-gray-500 cursor-help group relative">
              <Info className="h-3.5 w-3.5" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity w-48">
                {tooltip}
              </div>
            </div>
          )}
        </div>
        <input
          type="text"
          value={value as string}
          onChange={(e) => handleParamChange(key, e.target.value)}
          className="w-full p-2 rounded bg-white border border-gray-300 text-gray-700 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    );
  };

  return (
    <div className="p-4 bg-white h-full text-gray-700 overflow-y-auto">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
        <h3 className="text-lg font-medium text-blue-600">{selectedNode.data.label}</h3>
      </div>
      
      {/* Mostrar descripción del nodo */}
      {selectedNode.data.description && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md text-sm text-gray-600">
          {selectedNode.data.description}
        </div>
      )}
      
      {selectedNode.data.parameters && Object.entries(selectedNode.data.parameters).length > 0 && (
        <div>
          <h4 className="mb-3 font-medium text-sm border-b border-gray-200 pb-2 text-gray-600">Parámetros</h4>
          {Object.entries(selectedNode.data.parameters).map(([key, value]) => 
            renderParameterInput(key, value)
          )}
        </div>
      )}
      
      <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between">
        <button 
          onClick={() => duplicateNode(selectedNode.id)}
          className="px-3 py-1.5 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-md text-sm flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <Copy className="h-3.5 w-3.5" />
          Duplicar
        </button>
        
        <button 
          onClick={() => deleteNode(selectedNode.id)}
          className="px-3 py-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-md text-sm flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <X className="h-3.5 w-3.5" />
          Eliminar
        </button>
      </div>
    </div>
  );
};

export default NodeProperties;