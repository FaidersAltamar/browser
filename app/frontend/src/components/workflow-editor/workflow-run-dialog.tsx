// Ruta: src/components/workflow-editor/workflow-run-dialog.tsx

import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, User, Users, AlertTriangle, Search } from "lucide-react";

// 1. Definir tipos de datos necesarios
export interface Profile {
  id: string;
  name: string;
}

export interface Group {
  id: string;
  name: string;
  profileCount?: number;
}

export type RunPayload =
  | { mode: 'profile'; profileId: string }
  | { mode: 'group'; groupId: string; threads: number };

interface WorkflowRunDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRun: (payload: RunPayload) => void;
  workflow: { id: string; name: string };
  profiles: Profile[];
  groups: Group[];
}


// 2. Componente principal
export function WorkflowRunDialog({
  open,
  onOpenChange,
  onRun,
  workflow,
  profiles,
  groups,
}: WorkflowRunDialogProps) {
  // === Estado para gestionar todo el diálogo ===
  const [runMode, setRunMode] = useState<'profile' | 'group'>('profile');
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [threads, setThreads] = useState<number>(5);
  const [searchQuery, setSearchQuery] = useState("");

  // Memoizar para optimizar el filtrado de perfiles al buscar
  const filteredProfiles = useMemo(() => {
    if (!searchQuery) return profiles;
    return profiles.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [profiles, searchQuery]);

  // === Funciones de manejo ===

  // Manejar cuando se presiona el botón "Run Workflow"
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (runMode === 'profile' && selectedProfileId) {
      onRun({ mode: 'profile', profileId: selectedProfileId });
    } else if (runMode === 'group' && selectedGroupId) {
      onRun({ mode: 'group', groupId: selectedGroupId, threads });
    }
    onOpenChange(false); // Cerrar diálogo después de enviar
  };
  
  // Resetear todo el estado cuando se cierra el diálogo
  const resetState = () => {
    setRunMode('profile');
    setSelectedProfileId("");
    setSelectedGroupId("");
    setThreads(5);
    setSearchQuery("");
  };

  // Condición para habilitar/deshabilitar el botón Run
  const isRunDisabled =
    (runMode === 'profile' && !selectedProfileId) ||
    (runMode === 'group' && !selectedGroupId);


  // === Interfaz JSX ===
  return (
    <Dialog
      open={open}
      onOpenChange={(newOpenState) => {
        if (!newOpenState) {
          resetState(); // Llamar función reset cuando se cierra el diálogo
        }
        onOpenChange(newOpenState);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ejecutar Workflow: {workflow?.name}</DialogTitle>
          <DialogDescription>
            Elige cómo quieres ejecutar este workflow.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Seleccionar modo: Perfil o Grupo */}
          <RadioGroup value={runMode} onValueChange={(value) => setRunMode(value as 'profile' | 'group')} className="grid grid-cols-2 gap-4">
            <div>
              <RadioGroupItem value="profile" id="r-profile" className="sr-only" />
              <Label htmlFor="r-profile" className={`flex flex-col items-center justify-center rounded-md border-2 p-4 cursor-pointer hover:bg-accent hover:text-accent-foreground ${runMode === 'profile' ? 'border-primary' : 'border-muted'}`}>
                <User className="mb-3 h-6 w-6" />
                Ejecutar en Perfil
              </Label>
            </div>
            <div>
              <RadioGroupItem value="group" id="r-group" className="sr-only" />
              <Label htmlFor="r-group" className={`flex flex-col items-center justify-center rounded-md border-2 p-4 cursor-pointer hover:bg-accent hover:text-accent-foreground ${runMode === 'group' ? 'border-primary' : 'border-muted'}`}>
                <Users className="mb-3 h-6 w-6" />
                Ejecutar en Grupo
              </Label>
            </div>
          </RadioGroup>

          {/* Mostrar UI correspondiente al modo seleccionado */}
          {runMode === 'profile' ? (
            <div className="space-y-2">
              <Label>Seleccionar un Perfil</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar perfil..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <ScrollArea className="h-48 w-full rounded-md border">
                <div className="p-2">
                  <RadioGroup value={selectedProfileId} onValueChange={setSelectedProfileId}>
                    {filteredProfiles.length > 0 ? (
                      filteredProfiles.map((profile) => (
                        <Label
                          key={profile.id}
                          htmlFor={profile.id}
                          className={`flex items-center gap-3 rounded-md p-2 cursor-pointer border-2 ${selectedProfileId === profile.id ? 'border-primary' : 'border-transparent'}`}
                        >
                          <RadioGroupItem value={profile.id} id={profile.id} />
                          <span className="font-medium">{profile.name}</span>
                        </Label>
                      ))
                    ) : (
                      <p className="p-4 text-center text-sm text-muted-foreground">No se encontraron perfiles.</p>
                    )}
                  </RadioGroup>
                </div>
              </ScrollArea>
            </div>
          ) : ( // runMode === 'group'
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Seleccionar Grupo</Label>
                {groups?.length > 0 ? (
                  <Select onValueChange={setSelectedGroupId} value={selectedGroupId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un grupo para ejecutar" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map(group => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name} ({group.profileCount || 0} perfiles)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-sm text-yellow-600 flex items-center gap-2 p-3 border border-yellow-200 bg-yellow-50 rounded-md">
                    <AlertTriangle className="h-4 w-4" />
                    <span>No hay grupos disponibles. Por favor, crea un grupo primero.</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="threads">Hilos Concurrentes</Label>
                <Input id="threads" type="number" min={1} max={50} value={threads} onChange={(e) => setThreads(Number(e.target.value))} />
              </div>
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isRunDisabled} className="gap-2">
              <Play className="h-4 w-4" />
              Ejecutar Workflow
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}