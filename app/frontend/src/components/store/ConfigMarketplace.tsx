import React from 'react';
import { Search, DownloadCloud, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ConfigMarketplaceProps {
  searchQuery: string;
  onSearch: (query: string) => void;
}

const ConfigMarketplace: React.FC<ConfigMarketplaceProps> = ({ searchQuery, onSearch }) => {
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Configuraciones</h2>
        <div className="flex space-x-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span>Filtrar</span>
          </Button>
          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
            <DownloadCloud className="w-4 h-4" />
            <span>Subir configuración</span>
          </Button>
        </div>
      </div>

      <div className="relative mb-8">
        <Input
          type="text"
          placeholder="Buscar configuración..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          className="pl-10 pr-4 h-12 border-gray-300 rounded-lg w-full"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
      </div>

      {/* Coming Soon Message */}
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-24 h-24 mb-6 flex items-center justify-center rounded-full bg-blue-100">
          <DownloadCloud className="h-12 w-12 text-blue-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No hay configuraciones</h3>
        <p className="text-gray-600 max-w-md">
          Aún no se ha creado ninguna configuración. Puedes subir tu configuración o crear una nueva.
        </p>
        <Button className="mt-6 bg-blue-600 hover:bg-blue-700">
          Crear nueva configuración
        </Button>
      </div>
    </div>
  );
};

export default ConfigMarketplace;