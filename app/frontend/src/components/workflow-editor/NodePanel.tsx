import React, { useState } from 'react';
import { 
  Zap, 
  MousePointerClick, 
  Database, 
  Network, 
  ArrowRightLeft,
  Clock,
  Play,
  Square,
  Folder,
  Repeat,
  Plus,
  Minus,
  X,
  Link,
  Loader,
  MousePointer,
  MoveHorizontal,
  MoveVertical,
  ArrowUp,
  ArrowDown,
  ClipboardList,
  FileText,
  Mail,
  Clipboard,
  Type,
  TextCursorInput,
  ListFilter,
  CheckSquare,
  ExternalLink,
  Search,
  GitFork,
  GitMerge,
  ShieldAlert,
  LayoutPanelTop,
  MessageCircle,
  BellRing,
  CalendarDays,
  Save,
  Globe,
  Tag
} from 'lucide-react';

interface NodeItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  type: string;
  description: string;
  parameters: Record<string, any>;
}

interface NodeCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  nodes: NodeItem[];
}

const nodeCategories: NodeCategory[] = [
  {
    id: 'general',
    name: 'General',
    icon: <Zap className="h-4 w-4" />,
    color: '#f59e0b',
    bgColor: '#78350f',
    nodes: [
      {
        id: 'start',
        label: 'Iniciar',
        icon: <Play className="h-4 w-4" />,
        type: 'triggerNode',
        description: 'Punto de inicio del workflow. No tiene parámetros.',
        parameters: {}
      },
      {
        id: 'executeWorkflow',
        label: 'Llamar workflow',
        icon: <Folder className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Llamar y ejecutar otro workflow. Parámetros: workflowId (string, ejemplo: "login_process").',
        parameters: {
          workflowId: ''
        }
      },
      {
        id: 'end',
        label: 'Finalizar',
        icon: <Square className="h-4 w-4" />,
        type: 'outputNode',
        description: 'Punto de finalización del workflow. No tiene parámetros.',
        parameters: {}
      },
      {
        id: 'blocksGroup',
        label: 'Agrupar bloques',
        icon: <LayoutPanelTop className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Agrupar nodos para organizar el workflow. Parámetros: groupName (string, ejemplo: "Pasos de Autenticación").',
        parameters: {
          groupName: 'Grupo 1'
        }
      },
      {
        id: 'note',
        label: 'Nota',
        icon: <FileText className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Agregar una nota al workflow. Parámetros: text (string, ejemplo: "Esta es una nota").',
        parameters: {
          text: ''
        }
      },
      {
        id: 'workflowState',
        label: 'Estado del workflow',
        icon: <Play className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Establecer el estado del workflow. Parámetros: state (string, ejemplo: "start", "pause", "stop").',
        parameters: {
          state: 'start'
        }
      }
    ]
  },
  {
    id: 'browser',
    name: 'Navegador',
    icon: <Network className="h-4 w-4" />,
    color: '#3b82f6',
    bgColor: '#1e3a8a',
    nodes: [
      {
        id: 'openURL',
        label: 'Abrir URL',
        icon: <ExternalLink className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Abrir una página web. Parámetros: url (string, ejemplo: "https://www.example.com"), urlVariableRef (string, ejemplo: "$targetUrl"), minWait (ms), maxWait (ms).',
        parameters: {
          url: '',
          urlVariableRef: '',
          minWait: 1000,
          maxWait: 3000
        }
      },
      {
        id: 'imageSearch',
        label: 'Buscar imagen',
        icon: <Search className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Buscar imágenes en un motor de búsqueda. Parámetros: query (string, ejemplo: "gatos"), queryVariableRef (string, ejemplo: "$searchQuery"), minWait (ms), maxWait (ms).',
        parameters: {
          query: '',
          queryVariableRef: '',
          minWait: 1000,
          maxWait: 3000
        }
      },
      {
        id: 'activeTab',
        label: 'Pestaña actual',
        icon: <LayoutPanelTop className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Cambiar a la pestaña activa. No tiene parámetros.',
        parameters: {}
      },
      {
        id: 'newTab',
        label: 'Nueva pestaña',
        icon: <Plus className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Abrir una nueva pestaña. Parámetros: minWait (ms), maxWait (ms).',
        parameters: {
          minWait: 500,
          maxWait: 2000
        }
      },
      {
        id: 'resourceStatus',
        label: 'Estado del recurso',
        icon: <FileText className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Verificar el estado de un recurso en la página. Parámetros: resourceType (string, ejemplo: "image", "script").',
        parameters: {
          resourceType: ''
        }
      },
      {
        id: 'switchTab',
        label: 'Cambiar pestaña',
        icon: <ArrowRightLeft className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Cambiar a otra pestaña. Parámetros: tabIndex (number, ejemplo: 0), tabIndexVariableRef (string, ejemplo: "$tabIndex"), minWait (ms), maxWait (ms).',
        parameters: {
          tabIndex: 0,
          tabIndexVariableRef: '',
          minWait: 500,
          maxWait: 2000
        }
      },
      {
        id: 'newWindow',
        label: 'Nueva ventana',
        icon: <LayoutPanelTop className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Abrir una nueva ventana del navegador. Parámetros: minWait (ms), maxWait (ms).',
        parameters: {
          minWait: 500,
          maxWait: 2000
        }
      },
      {
        id: 'goBack',
        label: 'Atrás',
        icon: <ArrowRightLeft className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Volver a la página anterior. Parámetros: minWait (ms), maxWait (ms).',
        parameters: {
          minWait: 500,
          maxWait: 2000
        }
      },
      {
        id: 'goForward',
        label: 'Adelante',
        icon: <ArrowRightLeft className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Ir a la página siguiente. Parámetros: minWait (ms), maxWait (ms).',
        parameters: {
          minWait: 500,
          maxWait: 2000
        }
      },
      {
        id: 'closeTab',
        label: 'Cerrar pestaña',
        icon: <X className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Cerrar la pestaña actual. Parámetros: minWait (ms), maxWait (ms).',
        parameters: {
          minWait: 500,
          maxWait: 2000
        }
      },
      {
        id: 'reloadPage',
        label: 'Recargar página',
        icon: <Repeat className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Recargar la página actual. Parámetros: minWait (ms), maxWait (ms).',
        parameters: {
          minWait: 1000,
          maxWait: 3000
        }
      },
      {
        id: 'getURL',
        label: 'Obtener URL',
        icon: <Link className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Obtener la URL de la página actual y guardarla en una variable. Parámetros: resultVar (string, ejemplo: "currentUrl").',
        parameters: {
          resultVar: ''
        }
      }
    ]
  },
  {
    id: 'webInteraction',
    name: 'Interacción Web',
    icon: <MousePointerClick className="h-4 w-4" />,
    color: '#ec4899',
    bgColor: '#831843',
    nodes: [
      {
        id: 'click',
        label: 'Click',
        icon: <MousePointerClick className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Hacer clic en un elemento. Parámetros: selectorType (string, ejemplo: "css"), selectorValue (string, ejemplo: "#myButton"), selectorVariableRef (string, ejemplo: "$buttonSelector"), clickType (string, ejemplo: "left"), timeout (ms), minWait (ms), maxWait (ms).',
        parameters: {
          selectorType: 'css',
          selectorValue: '',
          selectorVariableRef: '',
          clickType: 'left',
          timeout: 5000,
          minWait: 500,
          maxWait: 2000
        }
      },
      {
        id: 'doubleClick',
        label: 'Doble Click',
        icon: <MousePointerClick className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Hacer doble clic en un elemento. Parámetros: selectorType (string), selectorValue (string), selectorVariableRef (string, ejemplo: "$buttonSelector"), timeout (ms), minWait (ms), maxWait (ms).',
        parameters: {
          selectorType: 'css',
          selectorValue: '',
          selectorVariableRef: '',
          timeout: 5000,
          minWait: 500,
          maxWait: 2000
        }
      },
      {
        id: 'rightClick',
        label: 'Click Derecho',
        icon: <MousePointerClick className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Hacer clic derecho en un elemento. Parámetros: selectorType (string), selectorValue (string), selectorVariableRef (string, ejemplo: "$buttonSelector"), timeout (ms), minWait (ms), maxWait (ms).',
        parameters: {
          selectorType: 'css',
          selectorValue: '',
          selectorVariableRef: '',
          timeout: 5000,
          minWait: 500,
          maxWait: 2000
        }
      },
      {
        id: 'hover',
        label: 'Hover',
        icon: <MousePointer className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Pasar el mouse sobre un elemento. Parámetros: selectorType (string), selectorValue (string), selectorVariableRef (string, ejemplo: "$elementSelector"), timeout (ms), minWait (ms), maxWait (ms).',
        parameters: {
          selectorType: 'css',
          selectorValue: '',
          selectorVariableRef: '',
          timeout: 5000,
          minWait: 500,
          maxWait: 2000
        }
      },
      {
        id: 'focus',
        label: 'Focus',
        icon: <MousePointer className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Establecer el foco en un elemento. Parámetros: selectorType (string), selectorValue (string), selectorVariableRef (string, ejemplo: "$elementSelector"), timeout (ms), minWait (ms), maxWait (ms).',
        parameters: {
          selectorType: 'css',
          selectorValue: '',
          selectorVariableRef: '',
          timeout: 5000,
          minWait: 500,
          maxWait: 2000
        }
      },
      {
        id: 'type',
        label: 'Escribir',
        icon: <Type className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Escribir texto o valor desde una variable. Parámetros: selectorType (string), selectorValue (string), selectorVariableRef (string, ejemplo: "$inputSelector"), text (string), variableRef (string, ejemplo: "$inputText"), delay (ms), minWait (ms), maxWait (ms).',
        parameters: {
          selectorType: 'css',
          selectorValue: '',
          selectorVariableRef: '',
          text: '',
          variableRef: '',
          delay: 100,
          minWait: 500,
          maxWait: 2000
        }
      },
      {
        id: 'clearInput',
        label: 'Limpiar campo',
        icon: <X className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Limpiar el contenido del campo de entrada. Parámetros: selectorType (string), selectorValue (string), selectorVariableRef (string, ejemplo: "$inputSelector"), timeout (ms), minWait (ms), maxWait (ms).',
        parameters: {
          selectorType: 'css',
          selectorValue: '',
          selectorVariableRef: '',
          timeout: 5000,
          minWait: 500,
          maxWait: 2000
        }
      },
      {
        id: 'selectOption',
        label: 'Seleccionar opción',
        icon: <ListFilter className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Seleccionar una opción de un menú desplegable. Parámetros: selectorType (string), selectorValue (string), selectorVariableRef (string, ejemplo: "$dropdownSelector"), value (string), variableRef (string, ejemplo: "$selectedValue"), timeout (ms), minWait (ms), maxWait (ms).',
        parameters: {
          selectorType: 'css',
          selectorValue: '',
          selectorVariableRef: '',
          value: '',
          variableRef: '',
          timeout: 5000,
          minWait: 500,
          maxWait: 2000
        }
      },
      {
        id: 'upload',
        label: 'Subir archivo',
        icon: <FileText className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Subir un archivo. Parámetros: selectorType (string), selectorValue (string), selectorVariableRef (string, ejemplo: "$fileInputSelector"), filePath (string), filePathVariableRef (string, ejemplo: "$filePath"), timeout (ms), minWait (ms), maxWait (ms).',
        parameters: {
          selectorType: 'css',
          selectorValue: '',
          selectorVariableRef: '',
          filePath: '',
          filePathVariableRef: '',
          timeout: 5000,
          minWait: 500,
          maxWait: 2000
        }
      },
      {
        id: 'download',
        label: 'Descargar archivo',
        icon: <FileText className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Descargar un archivo. Parámetros: url (string), urlVariableRef (string, ejemplo: "$downloadUrl"), savePath (string), savePathVariableRef (string, ejemplo: "$savePath"), minWait (ms), maxWait (ms).',
        parameters: {
          url: '',
          urlVariableRef: '',
          savePath: '',
          savePathVariableRef: '',
          minWait: 500,
          maxWait: 2000
        }
      },
      {
        id: 'scroll',
        label: 'Desplazar',
        icon: <MoveVertical className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Desplazar la página. Parámetros: direction (string, ejemplo: "down"), directionVariableRef (string, ejemplo: "$scrollDirection"), amount (number), amountVariableRef (string, ejemplo: "$scrollAmount"), minWait (ms), maxWait (ms).',
        parameters: {
          direction: 'down',
          directionVariableRef: '',
          amount: 500,
          amountVariableRef: '',
          minWait: 500,
          maxWait: 2000
        }
      },
      {
        id: 'scrollToElement',
        label: 'Desplazar al elemento',
        icon: <MoveVertical className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Desplazar hasta un elemento. Parámetros: selectorType (string), selectorValue (string), selectorVariableRef (string, ejemplo: "$elementSelector"), timeout (ms), minWait (ms), maxWait (ms).',
        parameters: {
          selectorType: 'css',
          selectorValue: '',
          selectorVariableRef: '',
          timeout: 5000,
          minWait: 500,
          maxWait: 2000
        }
      },
      {
        id: 'pressKey',
        label: 'Presionar tecla',
        icon: <Type className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Presionar una tecla. Parámetros: key (string, ejemplo: "Enter"), keyVariableRef (string, ejemplo: "$keyToPress"), modifier (string), modifierVariableRef (string, ejemplo: "$modifierKey"), minWait (ms), maxWait (ms).',
        parameters: {
          key: 'Enter',
          keyVariableRef: '',
          modifier: '',
          modifierVariableRef: '',
          minWait: 500,
          maxWait: 2000
        }
      },
      {
        id: 'dragAndDrop',
        label: 'Arrastrar y Soltar',
        icon: <MoveHorizontal className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Arrastrar y soltar un elemento. Parámetros: sourceSelectorType (string), sourceSelectorValue (string), sourceSelectorVariableRef (string, ejemplo: "$sourceSelector"), targetSelectorType (string), targetSelectorValue (string), targetSelectorVariableRef (string, ejemplo: "$targetSelector"), timeout (ms), minWait (ms), maxWait (ms).',
        parameters: {
          sourceSelectorType: 'css',
          sourceSelectorValue: '',
          sourceSelectorVariableRef: '',
          targetSelectorType: 'css',
          targetSelectorValue: '',
          targetSelectorVariableRef: '',
          timeout: 5000,
          minWait: 500,
          maxWait: 2000
        }
      },
      {
        id: 'getAttribute',
        label: 'Obtener Atributo',
        icon: <Tag className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Obtener el valor de un atributo de un elemento y guardarlo en una variable. Parámetros: selectorType (string), selectorValue (string), selectorVariableRef (string, ejemplo: "$elementSelector"), attribute (string, ejemplo: "data-id"), resultVar (string, ejemplo: "elementId").',
        parameters: {
          selectorType: 'css',
          selectorValue: '',
          selectorVariableRef: '',
          attribute: '',
          resultVar: '',
          timeout: 5000,
          minWait: 500,
          maxWait: 2000
        }
      }
    ]
  },
  {
    id: 'controlFlow',
    name: 'Control de Flujo',
    icon: <GitFork className="h-4 w-4" />,
    color: '#8b5cf6',
    bgColor: '#4c1d95',
    nodes: [
      {
        id: 'if',
        label: 'If-Else',
        icon: <GitFork className="h-4 w-4" />,
        type: 'conditionNode',
        description: 'Ramificar según una condición. Parámetros: condition (string, ejemplo: "$myVar > 10"), conditionVariableRef (string, ejemplo: "$conditionValue").',
        parameters: {
          condition: '',
          conditionVariableRef: ''
        }
      },
      {
        id: 'switch',
        label: 'Switch-Case',
        icon: <GitFork className="h-4 w-4" />,
        type: 'conditionNode',
        description: 'Cambiar el flujo según un valor. Parámetros: variable (string, ejemplo: "status"), variableRef (string, ejemplo: "$statusValue"), cases (array, ejemplo: [{case: "success", action: "proceed"}]).',
        parameters: {
          variable: '',
          variableRef: '',
          cases: []
        }
      },
      {
        id: 'loop',
        label: 'Bucle',
        icon: <Repeat className="h-4 w-4" />,
        type: 'loopNode',
        description: 'Repetir una acción, guardar variable de conteo. Parámetros: times (number, ejemplo: 5), timesVariableRef (string, ejemplo: "$loopCount"), loopVariable (string, ejemplo: "i").',
        parameters: {
          times: 5,
          timesVariableRef: '',
          loopVariable: 'i'
        }
      },
      {
        id: 'forEach',
        label: 'For Each',
        icon: <Repeat className="h-4 w-4" />,
        type: 'loopNode',
        description: 'Iterar sobre un array, guardar variable de elemento. Parámetros: array (string, ejemplo: "myArray"), arrayVariableRef (string, ejemplo: "$myArray"), itemVariable (string, ejemplo: "item").',
        parameters: {
          array: '',
          arrayVariableRef: '',
          itemVariable: 'item'
        }
      },
      {
        id: 'while',
        label: 'While',
        icon: <Repeat className="h-4 w-4" />,
        type: 'loopNode',
        description: 'Repetir mientras la condición sea verdadera. Parámetros: condition (string, ejemplo: "$myVar < 10"), conditionVariableRef (string, ejemplo: "$conditionValue").',
        parameters: {
          condition: '',
          conditionVariableRef: ''
        }
      },
      {
        id: 'break',
        label: 'Break',
        icon: <X className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Salir del bucle actual. No tiene parámetros.',
        parameters: {}
      },
      {
        id: 'continue',
        label: 'Continue',
        icon: <ArrowRightLeft className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Omitir la iteración actual. No tiene parámetros.',
        parameters: {}
      },
      {
        id: 'try',
        label: 'Try-Catch',
        icon: <ShieldAlert className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Capturar y manejar errores. Parámetros: errorVar (string, ejemplo: "errorMessage").',
        parameters: {
          errorVar: ''
        }
      },
      {
        id: 'return',
        label: 'Return',
        icon: <ArrowRightLeft className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Devolver un valor y terminar. Parámetros: value (any, ejemplo: "result"), variableRef (string, ejemplo: "$returnValue").',
        parameters: {
          value: '',
          variableRef: ''
        }
      },
      {
        id: 'retry',
        label: 'Reintentar',
        icon: <Repeat className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Reintentar una acción cuando hay error. Parámetros: times (number, ejemplo: 3), timesVariableRef (string, ejemplo: "$retryCount"), delay (ms).',
        parameters: {
          times: 3,
          timesVariableRef: '',
          delay: 1000
        }
      }
    ]
  },
  {
    id: 'data',
    name: 'Datos',
    icon: <Database className="h-4 w-4" />,
    color: '#10b981',
    bgColor: '#064e3b',
    nodes: [
      {
        id: 'variable',
        label: 'Variable',
        icon: <Database className="h-4 w-4" />,
        type: 'dataNode',
        description: 'Declarar o actualizar una variable. Parámetros: name (string, ejemplo: "myVar"), value (any, ejemplo: "value"), valueVariableRef (string, ejemplo: "$inputValue").',
        parameters: {
          name: '',
          value: '',
          valueVariableRef: ''
        }
      },
      {
        id: 'array',
        label: 'Array',
        icon: <Database className="h-4 w-4" />,
        type: 'dataNode',
        description: 'Crear o actualizar un array. Parámetros: name (string, ejemplo: "myArray"), value (array, ejemplo: []), valueVariableRef (string, ejemplo: "$inputArray").',
        parameters: {
          name: '',
          value: [],
          valueVariableRef: ''
        }
      },
      {
        id: 'object',
        label: 'Objeto',
        icon: <Database className="h-4 w-4" />,
        type: 'dataNode',
        description: 'Crear o actualizar un objeto. Parámetros: name (string, ejemplo: "myObject"), value (object, ejemplo: {}), valueVariableRef (string, ejemplo: "$inputObject").',
        parameters: {
          name: '',
          value: {},
          valueVariableRef: ''
        }
      },
      {
        id: 'math',
        label: 'Matemáticas',
        icon: <Plus className="h-4 w-4" />,
        type: 'dataNode',
        description: 'Realizar operaciones matemáticas. Parámetros: operation (string, ejemplo: "add"), operands (array, ejemplo: [1, 2]), operandsVariableRef (string, ejemplo: "$inputOperands"), resultVar (string, ejemplo: "sum").',
        parameters: {
          operation: 'add',
          operands: [],
          operandsVariableRef: '',
          resultVar: ''
        }
      },
      {
        id: 'string',
        label: 'Cadena',
        icon: <Type className="h-4 w-4" />,
        type: 'dataNode',
        description: 'Operar con cadenas de texto. Parámetros: operation (string, ejemplo: "concat"), strings (array, ejemplo: ["Hello", "World"]), stringsVariableRef (string, ejemplo: "$inputStrings"), resultVar (string, ejemplo: "resultString").',
        parameters: {
          operation: 'concat',
          strings: [],
          stringsVariableRef: '',
          resultVar: ''
        }
      },
      {
        id: 'date',
        label: 'Fecha',
        icon: <Clock className="h-4 w-4" />,
        type: 'dataNode',
        description: 'Operar con fechas. Parámetros: operation (string, ejemplo: "now"), resultVar (string, ejemplo: "currentDate").',
        parameters: {
          operation: 'now',
          resultVar: ''
        }
      },
      {
        id: 'json',
        label: 'JSON',
        icon: <ClipboardList className="h-4 w-4" />,
        type: 'dataNode',
        description: 'Operar con JSON. Parámetros: operation (string, ejemplo: "parse"), data (string, ejemplo: "{\"key\": \"value\"}"), dataVariableRef (string, ejemplo: "$inputJson"), resultVar (string, ejemplo: "parsedJson").',
        parameters: {
          operation: 'parse',
          data: '',
          dataVariableRef: '',
          resultVar: ''
        }
      },
      {
        id: 'regex',
        label: 'RegExp',
        icon: <Search className="h-4 w-4" />,
        type: 'dataNode',
        description: 'Buscar con expresión regular. Parámetros: pattern (string, ejemplo: "\\d+"), text (string), textVariableRef (string, ejemplo: "$inputText"), flags (string, ejemplo: "g"), resultVar (string, ejemplo: "matches").',
        parameters: {
          pattern: '',
          text: '',
          textVariableRef: '',
          flags: 'g',
          resultVar: ''
        }
      },
      {
        id: 'randomize',
        label: 'Aleatorio',
        icon: <ArrowRightLeft className="h-4 w-4" />,
        type: 'dataNode',
        description: 'Generar un valor aleatorio. Parámetros: type (string, ejemplo: "number"), min (number), minVariableRef (string, ejemplo: "$minValue"), max (number), maxVariableRef (string, ejemplo: "$maxValue"), resultVar (string, ejemplo: "randomValue").',
        parameters: {
          type: 'number',
          min: 1,
          minVariableRef: '',
          max: 100,
          maxVariableRef: '',
          resultVar: ''
        }
      },
      {
        id: 'sort',
        label: 'Ordenar',
        icon: <ArrowUp className="h-4 w-4" />,
        type: 'dataNode',
        description: 'Ordenar un array. Parámetros: array (string, ejemplo: "myArray"), arrayVariableRef (string, ejemplo: "$inputArray"), order (string, ejemplo: "ascending"), resultVar (string, ejemplo: "sortedArray").',
        parameters: {
          array: '',
          arrayVariableRef: '',
          order: 'ascending',
          resultVar: ''
        }
      },
      {
        id: 'filter',
        label: 'Filtrar',
        icon: <ListFilter className="h-4 w-4" />,
        type: 'dataNode',
        description: 'Filtrar un array. Parámetros: array (string, ejemplo: "myArray"), arrayVariableRef (string, ejemplo: "$inputArray"), condition (string, ejemplo: "item > 10"), conditionVariableRef (string, ejemplo: "$filterCondition"), resultVar (string, ejemplo: "filteredArray").',
        parameters: {
          array: '',
          arrayVariableRef: '',
          condition: '',
          conditionVariableRef: '',
          resultVar: ''
        }
      },
      {
        id: 'map',
        label: 'Map',
        icon: <GitMerge className="h-4 w-4" />,
        type: 'dataNode',
        description: 'Aplicar función a un array. Parámetros: array (string, ejemplo: "myArray"), arrayVariableRef (string, ejemplo: "$inputArray"), operation (string, ejemplo: "item * 2"), operationVariableRef (string, ejemplo: "$mapOperation"), resultVar (string, ejemplo: "mappedArray").',
        parameters: {
          array: '',
          arrayVariableRef: '',
          operation: '',
          operationVariableRef: '',
          resultVar: ''
        }
      }
    ]
  },
  {
    id: 'wait',
    name: 'Esperar',
    icon: <Clock className="h-4 w-4" />,
    color: '#84cc16',
    bgColor: '#365314',
    nodes: [
      {
        id: 'delay',
        label: 'Esperar',
        icon: <Clock className="h-4 w-4" />,
        type: 'waitNode',
        description: 'Pausar la ejecución. Parámetros: duration (ms, ejemplo: 1000), durationVariableRef (string, ejemplo: "$waitTime").',
        parameters: {
          duration: 1000,
          durationVariableRef: ''
        }
      },
      {
        id: 'waitForPageLoad',
        label: 'Esperar carga de página',
        icon: <Loader className="h-4 w-4" />,
        type: 'waitNode',
        description: 'Esperar a que la página termine de cargar. Parámetros: timeout (ms, ejemplo: 30000), timeoutVariableRef (string, ejemplo: "$loadTimeout").',
        parameters: {
          timeout: 30000,
          timeoutVariableRef: ''
        }
      },
      {
        id: 'waitForSelector',
        label: 'Esperar elemento',
        icon: <Loader className="h-4 w-4" />,
        type: 'waitNode',
        description: 'Esperar a que aparezca un elemento. Parámetros: selectorType (string, ejemplo: "css"), selectorValue (string, ejemplo: "#myElement"), selectorVariableRef (string, ejemplo: "$elementSelector"), timeout (ms), timeoutVariableRef (string, ejemplo: "$waitTimeout").',
        parameters: {
          selectorType: 'css',
          selectorValue: '',
          selectorVariableRef: '',
          timeout: 30000,
          timeoutVariableRef: ''
        }
      },
      {
        id: 'waitForXPath',
        label: 'Esperar XPath',
        icon: <Loader className="h-4 w-4" />,
        type: 'waitNode',
        description: 'Esperar un elemento identificado por XPath. Parámetros: selectorType, selectorValue, selectorVariableRef, timeout, timeoutVariableRef',
        parameters: {
          selectorType: 'xpath',
          selectorValue: '',
          selectorVariableRef: '',
          timeout: 30000,
          timeoutVariableRef: ''
        }
      },
      {
        id: 'waitConnections',
        label: 'Esperar conexión',
        icon: <Loader className="h-4 w-4" />,
        type: 'waitNode',
        description: 'Esperar un evento o conexión. Parámetros: event, eventVariableRef, timeout, timeoutVariableRef',
        parameters: {
          event: '',
          eventVariableRef: '',
          timeout: 30000,
          timeoutVariableRef: ''
        }
      }
    ]
  },
  {
    id: 'onlineServices',
    name: 'Servicios Online',
    icon: <Network className="h-4 w-4" />,
    color: '#06b6d4',
    bgColor: '#164e63',
    nodes: [
      {
        id: 'mailSend',
        label: 'Enviar Email',
        icon: <Mail className="h-4 w-4" />,
        type: 'serviceNode',
        description: 'Enviar un correo electrónico. Parámetros: to (string), toVariableRef (string, ejemplo: "$recipient"), subject (string), subjectVariableRef (string, ejemplo: "$emailSubject"), body (string), bodyVariableRef (string, ejemplo: "$emailContent"), minWait (ms), maxWait (ms).',
        parameters: {
          to: '',
          toVariableRef: '',
          subject: '',
          subjectVariableRef: '',
          body: '',
          bodyVariableRef: '',
          minWait: 1000,
          maxWait: 3000
        }
      },
      {
        id: 'sms',
        label: 'Enviar SMS',
        icon: <Mail className="h-4 w-4" />,
        type: 'serviceNode',
        description: 'Enviar un SMS. Parámetros: to (string), toVariableRef (string, ejemplo: "$phoneNumber"), message (string), messageVariableRef (string, ejemplo: "$smsContent"), minWait (ms), maxWait (ms).',
        parameters: {
          to: '',
          toVariableRef: '',
          message: '',
          messageVariableRef: '',
          minWait: 1000,
          maxWait: 3000
        }
      },
      {
        id: 'apiCall',
        label: 'Llamar API',
        icon: <Network className="h-4 w-4" />,
        type: 'serviceNode',
        description: 'Llamar a una API RESTful. Parámetros: url (string), urlVariableRef (string, ejemplo: "$apiUrl"), method (string), methodVariableRef (string, ejemplo: "$apiMethod"), headers (object), headersVariableRef (string, ejemplo: "$apiHeaders"), body (object), bodyVariableRef (string, ejemplo: "$apiPayload"), resultVar (string, ejemplo: "apiResult"), minWait (ms), maxWait (ms).',
        parameters: {
          url: '',
          urlVariableRef: '',
          method: 'GET',
          methodVariableRef: '',
          headers: {},
          headersVariableRef: '',
          body: {},
          bodyVariableRef: '',
          resultVar: '',
          minWait: 500,
          maxWait: 2000
        }
      },
      {
        id: 'webhook',
        label: 'Webhook',
        icon: <Network className="h-4 w-4" />,
        type: 'serviceNode',
        description: 'Enviar datos a un webhook. Parámetros: url (string), urlVariableRef (string, ejemplo: "$webhookUrl"), payload (object), payloadVariableRef (string, ejemplo: "$webhookPayload"), resultVar (string, ejemplo: "webhookResult"), minWait (ms), maxWait (ms).',
        parameters: {
          url: '',
          urlVariableRef: '',
          payload: {},
          payloadVariableRef: '',
          resultVar: '',
          minWait: 500,
          maxWait: 2000
        }
      },
      {
        id: 'chatgpt',
        label: 'ChatGPT',
        icon: <MessageCircle className="h-4 w-4" />,
        type: 'serviceNode',
        description: 'Interactuar con la API de ChatGPT. Parámetros: prompt (string, ejemplo: "Hello, how are you?"), promptVariableRef (string, ejemplo: "$chatPrompt"), model (string, ejemplo: "gpt-3.5-turbo"), resultVar (string, ejemplo: "chatResponse"), minWait (ms), maxWait (ms).',
        parameters: {
          prompt: '',
          promptVariableRef: '',
          model: 'gpt-3.5-turbo',
          resultVar: '',
          minWait: 1000,
          maxWait: 3000
        }
      },
      {
        id: 'translate',
        label: 'Traducir',
        icon: <Globe className="h-4 w-4" />,
        type: 'serviceNode',
        description: 'Traducir texto. Parámetros: text (string), textVariableRef (string, ejemplo: "$textToTranslate"), sourceLang (string, ejemplo: "auto"), targetLang (string, ejemplo: "en"), resultVar (string, ejemplo: "translatedText"), minWait (ms), maxWait (ms).',
        parameters: {
          text: '',
          textVariableRef: '',
          sourceLang: 'auto',
          targetLang: 'en',
          resultVar: '',
          minWait: 500,
          maxWait: 2000
        }
      },
      {
        id: 'notification',
        label: 'Notificación',
        icon: <BellRing className="h-4 w-4" />,
        type: 'serviceNode',
        description: 'Enviar notificación a través de un canal. Parámetros: channel, channelVariableRef, message, messageVariableRef, minWait, maxWait',
        parameters: {
          channel: 'telegram',
          channelVariableRef: '',
          message: '',
          messageVariableRef: '',
          minWait: 500,
          maxWait: 2000
        }
      },
      {
        id: 'calendar',
        label: 'Calendario',
        icon: <CalendarDays className="h-4 w-4" />,
        type: 'serviceNode',
        description: 'Operar con calendario. Parámetros: action, actionVariableRef, event, eventVariableRef, resultVar, minWait, maxWait',
        parameters: {
          action: 'add',
          actionVariableRef: '',
          event: {},
          eventVariableRef: '',
          resultVar: '',
          minWait: 500,
          maxWait: 2000
        }
      },
      {
        id: 'database',
        label: 'Base de datos',
        icon: <Database className="h-4 w-4" />,
        type: 'serviceNode',
        description: 'Interactuar con base de datos. Parámetros: operation, operationVariableRef, table, tableVariableRef, data, dataVariableRef, resultVar, minWait, maxWait',
        parameters: {
          operation: 'select',
          operationVariableRef: '',
          table: '',
          tableVariableRef: '',
          data: {},
          dataVariableRef: '',
          resultVar: '',
          minWait: 500,
          maxWait: 2000
        }
      },
      {
        id: 'storage',
        label: 'Almacenamiento en la Nube',
        icon: <Save className="h-4 w-4" />,
        type: 'serviceNode',
        description: 'Interactuar con almacenamiento en la nube. Parámetros: service, serviceVariableRef, operation, operationVariableRef, path, pathVariableRef, data, dataVariableRef, resultVar, minWait, maxWait',
        parameters: {
          service: 'dropbox',
          serviceVariableRef: '',
          operation: 'upload',
          operationVariableRef: '',
          path: '',
          pathVariableRef: '',
          data: null,
          dataVariableRef: '',
          resultVar: '',
          minWait: 500,
          maxWait: 2000
        }
      }
    ]
  }
];

function NodePanel() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(
    nodeCategories.reduce((acc, category) => {
      acc[category.id] = true;
      return acc;
    }, {} as Record<string, boolean>)
  );

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, type: string, data: NodeItem) => {
    console.log('NodePanel: Starting drag with:', { type, data });
    event.dataTransfer.setData('application/reactflow/type', type);
    event.dataTransfer.setData('application/reactflow/data', JSON.stringify({
      nodeId: data.id,
      label: data.label,
      description: data.description,
      parameters: data.parameters
    }));
    event.dataTransfer.effectAllowed = 'move';
    
    // Add visual feedback
    const draggedElement = event.currentTarget;
    draggedElement.style.opacity = '0.5';
    
    // Reset opacity after drag ends
    setTimeout(() => {
      draggedElement.style.opacity = '1';
    }, 100);
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const filteredCategories = searchTerm.trim() === '' 
    ? nodeCategories 
    : nodeCategories.map(category => ({
        ...category,
        nodes: category.nodes.filter(node => 
          node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          node.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(category => category.nodes.length > 0);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-2 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar nodo..."
            className="w-full pl-8 pr-2 py-1 text-sm border border-gray-300 rounded"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setSearchTerm('')}
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {filteredCategories.map((category) => (
          <div key={category.id} className="mb-2">
            <button
              className={`flex items-center justify-between w-full text-left rounded px-2 py-1.5 mb-1 text-white text-sm font-medium transition-colors`}
              style={{ backgroundColor: category.bgColor }}
              onClick={() => toggleCategory(category.id)}
            >
              <div className="flex items-center">
                <div className="mr-2">{category.icon}</div>
                <span>{category.name}</span>
              </div>
              <div>
                {expandedCategories[category.id] ? (
                  <ArrowUp className="h-3 w-3 text-white" />
                ) : (
                  <ArrowDown className="h-3 w-3 text-white" />
                )}
              </div>
            </button>
            {expandedCategories[category.id] && (
              <div className="pl-1 space-y-1">
                {category.nodes.map((node) => (
                  <div
                    key={node.id}
                    className="flex items-center rounded px-2 py-1.5 text-xs bg-white border border-gray-200 hover:bg-gray-50 cursor-grab select-none transition-opacity duration-150"
                    draggable={true}
                    onDragStart={(event) => onDragStart(event, node.type, node)}
                    style={{ touchAction: 'none' }}
                  >
                    <div 
                      className="h-4 w-4 flex items-center justify-center mr-2"
                      style={{ color: category.color }}
                    >
                      {node.icon}
                    </div>
                    <div className="flex-1">{node.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default NodePanel;