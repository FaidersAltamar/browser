import { useState, useContext, useRef } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "../components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useAuth } from "../hooks/us/useAuth";
import { ThemeContext } from "../layouts/app-layout";
import { 
  Check, 
  Upload, 
  User, 
  Lock, 
  Globe, 
  Palette, 
  Bell, 
  Monitor, 
  Languages, 
  Clock,
  Loader2
} from "lucide-react";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { useSettings } from "../hooks/us/useSettings";

export default function SettingsPage() {
  const { user, getInitials } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState("personal");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    userSettings,
    isLoadingSettings: isLoading,
    updatePersonalSettings,
    updateSystemSettings,
    updatePassword,
    uploadAvatar,
    isUpdatingPersonalSettings: isUpdatingPersonal,
    isUpdatingSystemSettings: isUpdatingSystem,
    isUpdatingPassword,
    isUploadingAvatar
  } = useSettings();

  const [personalFormData, setPersonalFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [systemFormData, setSystemFormData] = useState({
    theme: theme,
    language: userSettings?.language || 'vi',
    timezone: userSettings?.timezone || 'Asia/Ho_Chi_Minh',
    notifications: userSettings?.notifications || false,
    desktopNotifications: userSettings?.desktopNotifications || false,
    soundEffects: userSettings?.soundEffects || false,
    autoUpdate: userSettings?.autoUpdate || false
  });

  // Handle personal input changes
  const handlePersonalInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPersonalFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle system input changes  
  const handleSystemInputChange = (name: string, value: any) => {
    setSystemFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Form submit handlers
  const handlePersonalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePersonalSettings(personalFormData);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePassword(personalFormData);
  };

  const handleSystemSubmit = (e: React.FormEvent) => {
    e.preventDefault(); 
    updateSystemSettings(systemFormData);
  };

  const handleAvatarUpload = (file: File) => {
    uploadAvatar(file);
  };

  // Handle avatar file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleAvatarUpload(e.target.files[0]);
    }
  };

  // Trigger file input click
  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Update theme in app context when changed in settings
  const handleThemeChange = (value: string) => {
    handleSystemInputChange("theme", value);
    
    // Handle actual theme change when selected from dropdown
    if (value !== theme) {
      toggleTheme();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Cargando configuración...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configuración</h1>
      </div>
      
      <Tabs defaultValue="personal" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Configuración personal</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            <span>Configuración del sistema</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal" className="space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Información de cuenta</CardTitle>
              <CardDescription>Actualiza tu información personal</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePersonalSubmit} className="space-y-6">
                <div className="flex items-center space-x-6">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-lg">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      El avatar se genera automáticamente desde la primera letra del nombre.
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 mt-6">
                  <div className="sm:col-span-3">
                    <Label htmlFor="firstName" className="block text-sm font-medium">Nombre</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={personalFormData.firstName}
                      onChange={handlePersonalInputChange}
                      className="mt-1"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <Label htmlFor="lastName" className="block text-sm font-medium">Apellido</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={personalFormData.lastName}
                      onChange={handlePersonalInputChange}
                      className="mt-1"
                    />
                  </div>
                  <div className="sm:col-span-6">
                    <Label htmlFor="email" className="block text-sm font-medium">Dirección de email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={personalFormData.email}
                      onChange={handlePersonalInputChange}
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={isUpdatingPersonal}
                  >
                    {isUpdatingPersonal ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </> 
                    ) : (
                      "Guardar cambios"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          {/* Password Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Cambiar contraseña
              </CardTitle>
              <CardDescription>Actualiza tu contraseña para proteger tu cuenta</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Contraseña actual</Label>
                  <Input 
                    id="currentPassword" 
                    name="currentPassword"
                    type="password" 
                    value={personalFormData.currentPassword}
                    onChange={handlePersonalInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword">Nueva contraseña</Label>
                  <Input 
                    id="newPassword" 
                    name="newPassword"
                    type="password" 
                    value={personalFormData.newPassword}
                    onChange={handlePersonalInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
                  <Input 
                    id="confirmPassword" 
                    name="confirmPassword"
                    type="password" 
                    value={personalFormData.confirmPassword}
                    onChange={handlePersonalInputChange}
                  />
                </div>
                <div className="flex justify-end mt-4">
                  <Button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={isUpdatingPassword}
                  >
                    {isUpdatingPassword ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Actualizando...
                      </>
                    ) : (
                      "Actualizar contraseña"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="system" className="space-y-6">
          {/* Appearance and Language Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Apariencia e idioma
              </CardTitle>
              <CardDescription>Personaliza la apariencia y el idioma de visualización</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSystemSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="theme">Tema</Label>
                    <Select 
                      value={systemFormData.theme} 
                      onValueChange={handleThemeChange}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Seleccionar tema" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Claro</SelectItem>
                        <SelectItem value="dark">Oscuro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="language">Idioma</Label>
                    <Select 
                      value={systemFormData.language} 
                      onValueChange={(value) => handleSystemInputChange("language", value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Seleccionar idioma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vi">Tiếng Việt</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="zh">中文</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="timezone">Zona horaria</Label>
                    <Select 
                      value={systemFormData.timezone} 
                      onValueChange={(value) => handleSystemInputChange("timezone", value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Seleccionar zona horaria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Ho_Chi_Minh">Hồ Chí Minh (GMT+7)</SelectItem>
                        <SelectItem value="Asia/Bangkok">Bangkok (GMT+7)</SelectItem>
                        <SelectItem value="Asia/Singapore">Singapore (GMT+8)</SelectItem>
                        <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
                        <SelectItem value="Europe/London">London (GMT+0)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
          
          {/* Notifications Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificaciones
              </CardTitle>
              <CardDescription>Gestiona cómo recibes las notificaciones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Notificaciones en la aplicación</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibir notificaciones dentro de la aplicación
                    </p>
                  </div>
                  <Switch
                    checked={systemFormData.notifications}
                    onCheckedChange={(checked) => handleSystemInputChange("notifications", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Notificaciones en el escritorio</Label>
                    <p className="text-sm text-muted-foreground">
                      Mostrar notificaciones incluso cuando no estás usando la aplicación
                    </p>
                  </div>
                  <Switch
                    checked={systemFormData.desktopNotifications}
                    onCheckedChange={(checked) => handleSystemInputChange("desktopNotifications", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Sonido</Label>
                    <p className="text-sm text-muted-foreground">
                      Reproducir sonido cuando hay una nueva notificación
                    </p>
                  </div>
                  <Switch
                    checked={systemFormData.soundEffects}
                    onCheckedChange={(checked) => handleSystemInputChange("soundEffects", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Actualización automática</Label>
                    <p className="text-sm text-muted-foreground">
                      Actualizar automáticamente la aplicación cuando hay una nueva versión
                    </p>
                  </div>
                  <Switch
                    checked={systemFormData.autoUpdate}
                    onCheckedChange={(checked) => handleSystemInputChange("autoUpdate", checked)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="button" 
                className="ml-auto bg-blue-600 hover:bg-blue-700" 
                onClick={handleSystemSubmit}
                disabled={isUpdatingSystem}
              >
                {isUpdatingSystem ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar cambios"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
