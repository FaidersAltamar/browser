// File: src/components/profile/import-profiles-dialog.tsx

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileUp, Upload } from "lucide-react";

// Định nghĩa kiểu dữ liệu mà dialog này sẽ trả về
export interface ImportPayload {
  fileName: string;
  fileContent: string; // Contenido del archivo como cadena
  fileType: string;    // Loại file, ví dụ: 'application/json'
}

// Interface props mới
interface ImportProfilesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Callback này giờ sẽ nhận một payload đã được xử lý
  onImport: (payload: ImportPayload) => void; 
  isImporting: boolean;
}

export function ImportProfilesDialog({
  open,
  onOpenChange,
  onImport,
  isImporting,
}: ImportProfilesDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null); // Eliminar error anterior cuando se selecciona un archivo nuevo
    }
  };

  const handleImport = () => {
    if (!selectedFile) return;

    // Leer contenido del archivo
    const reader = new FileReader();

    reader.onload = (e) => {
      const fileContent = e.target?.result as string;
      
      // Crear payload para enviar al componente padre
      const payload: ImportPayload = {
        fileName: selectedFile.name,
        fileContent: fileContent,
        fileType: selectedFile.type,
      };

      // Llamar callback proporcionado por el padre
      onImport(payload);
    };

    reader.onerror = () => {
      setError("Failed to read the file. Please try again.");
    };
    
    // Comenzar a leer el archivo como texto
    reader.readAsText(selectedFile);
  };
  
  // Resetear estado cuando se cierra el diálogo
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
        setTimeout(() => {
            setSelectedFile(null);
            setError(null);
        }, 150);
    }
    onOpenChange(newOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Import Profiles
          </DialogTitle>
          <DialogDescription>
            Import profiles from a compatible file (.json, .csv, .zip)
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="border-2 border-dashed rounded-lg p-8 text-center flex flex-col items-center justify-center">
            <FileUp className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {selectedFile ? selectedFile.name : "Drop your file here or click to select"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Supports JSON, CSV, or ZIP files.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("profile-file-upload")?.click()}
            >
              Select File
            </Button>
            <Input
              id="profile-file-upload"
              type="file"
              className="hidden"
              accept=".json,.csv,.zip,.txt"
              onChange={handleFileChange}
              key={selectedFile?.name || ''}
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isImporting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleImport}
            disabled={!selectedFile || isImporting}
          >
            {isImporting ? "Importing..." : "Import Profiles"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}