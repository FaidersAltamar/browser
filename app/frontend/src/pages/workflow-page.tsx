import React, { useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import WorkflowEditor from '../components/workflow-editor';
import WorkflowList from '../components/workflow-editor/WorkflowList'; // Giả sử đây là đường dẫn đúng
import { WorkflowRunDialog, RunPayload } from '../components/workflow-editor/workflow-run-dialog'; // Giả sử đây là đường dẫn đúng
import { useWorkflow } from '../hooks/us/useWorkflow'; // Giả sử đây là đường dẫn đúng
import { useProfile } from '../hooks/us/useProfile';

enum WorkflowView {
  LIST = 'list',
  EDITOR = 'editor'
}

// Giả định một kiểu Workflow cơ bản để tương thích với WorkflowList
// Bạn nên định nghĩa kiểu này ở một file chung (ví dụ: types.ts)
interface Workflow {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  isRunning?: boolean; // Temporalmente mantenido, se manejará después
}

export default function WorkflowPage() {
  // Sử dụng hook để quản lý workflow
  const {
    workflows, // CHANGED: Lấy workflows từ hook
    isLoadingWorkflows,
    duplicateWorkflow,
    deleteWorkflow, // ADDED: Obtener función deleteWorkflow
  } = useWorkflow();

  const {
    profiles,
    groups,
    isLoadingProfiles,
    isLoadingGroups,
    launchProfileWithWorkflow, // Lấy trực tiếp từ useProfile
    launchGroupWithWorkflow,   // Lấy trực tiếp từ useProfile
  } = useProfile(""); // selectedVendorId có thể không cần thiết cho các hành động này
  // Quản lý trạng thái local của trang
  const [currentView, setCurrentView] = useState<WorkflowView>(WorkflowView.LIST);
  const [currentWorkflow, setCurrentWorkflow] = useState<any | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<any | null>(null);
  const [isRunDialogOpen, setIsRunDialogOpen] = useState(false);

  // Handler tạo workflow mới
  const handleCreateWorkflow = () => {
    setCurrentWorkflow(null);
    setCurrentView(WorkflowView.EDITOR);
  };

  const handleEditWorkflow = (workflowId: string) => {
    // Buscar objeto workflow completo en la lista basado en ID
    const workflowToEdit = workflows.find(wf => wf.id === workflowId);

    if (workflowToEdit) {
      setCurrentWorkflow(workflowToEdit); // Guardar objeto completo en el estado
      setCurrentView(WorkflowView.EDITOR);
    } else {
      // Manejar caso cuando no se encuentra el workflow (aunque es raro)
      console.error("Could not find the workflow to edit with ID:", workflowId);
    }
  };

  // Handler para ejecutar workflow
  const handleRunWorkflow = (workflow: any) => {
    setSelectedWorkflow(workflow);
    setIsRunDialogOpen(true);
  };

  // Handler para eliminar workflow
  const handleDeleteWorkflow = (workflowId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este workflow?')) {
      deleteWorkflow(workflowId);
    }
  };

  const handleDuplicateWorkflow = (workflowId: string) => {
    // Puedes agregar una ventana de confirmación aquí si quieres
    if (window.confirm('¿Quieres crear una copia de este workflow?')) {
      duplicateWorkflow(workflowId);
    }
  };

  // Handler para volver a la lista
  const handleBackToList = () => {
    setCurrentView(WorkflowView.LIST);
    setCurrentWorkflow(null);
  };

  const handleStopWorkflow = (workflowId: string) => {
    console.log("Stop workflow clicked for ID:", workflowId);
    // TODO: Implement actual stop workflow logic
    alert("Stop workflow functionality will be implemented later");
  };

  // Handler thực thi workflow
  // const handleExecuteWorkflow = (workflowId: string, profileIds: string[], threads: number) => {
  //   executeWorkflow(workflowId, profileIds, threads);
  //   setIsRunDialogOpen(false);
  // };

  const handleExecuteWorkflow = (payload: RunPayload) => {
    if (!selectedWorkflow) {
      console.error("No workflow selected to run.");
      return;
    }

    // Clasificar payload y llamar la función mutation correcta desde useProfile
    if (payload.mode === 'profiles') {
      // Ejecutar en cada perfil individualmente
      payload.profileIds.forEach(profileId => {
        launchProfileWithWorkflow({
          profileId: profileId,
          workflowId: selectedWorkflow.id
        });
      });
    } else if (payload.mode === 'group') {
      // Ejecutar por grupo
      launchGroupWithWorkflow({
        groupId: payload.groupId,
        workflowId: selectedWorkflow.id,
        threads: payload.threads
      });
    }

    // Cerrar diálogo después de llamar la mutation
    setIsRunDialogOpen(false);
  };

  // Mostrar indicador de carga cuando se están cargando los datos
  if (isLoadingWorkflows) {
    return <div className="p-6">Loading workflows...</div>;
  }

  return (
    <div className="h-screen bg-white text-gray-800">
      {currentView === WorkflowView.LIST ? (
        <WorkflowList
          workflows={workflows} // CHANGED: Pasar workflows reales
          onCreateNew={handleCreateWorkflow}
          onStopWorkflow={handleStopWorkflow}
          onEdit={handleEditWorkflow}
          onRunWorkflow={handleRunWorkflow}
          onDelete={handleDeleteWorkflow}
          onDuplicate={handleDuplicateWorkflow} // ADDED: Pasar función delete
        />
      ) : (
        <ReactFlowProvider>

          <WorkflowEditor
            onBackToList={handleBackToList}
            workflowId={currentWorkflow?.id}
          />
        </ReactFlowProvider>
      )}

      {selectedWorkflow && (
        <WorkflowRunDialog
          open={isRunDialogOpen}
          onOpenChange={setIsRunDialogOpen}
          workflow={selectedWorkflow}
          // Truyền profiles và groups xuống dialog
          profiles={profiles}
          groups={groups}
          // Truyền hàm điều phối đã được cập nhật
          onRun={handleExecuteWorkflow}
        />
      )}
    </div>
  );
}