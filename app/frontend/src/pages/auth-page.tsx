import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { AuthLayout } from "../layouts/auth-layout";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Checkbox } from "../components/ui/checkbox";
import { Lock, User, KeyRound, Eye, EyeOff, AtSign, Phone } from "lucide-react";
import { useAuth } from "../hooks/us/useAuth";
import { useToast } from "../hooks/use-toast";


// Login schema
const loginSchema = z.object({
  username: z.string().min(2, "El nombre de usuario debe tener al menos 2 caracteres"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  rememberMe: z.boolean().optional(),
});

// Registration schema
const registerSchema = z
  .object({
    fullName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    email: z.string().email("Email no válido"),
    contact: z.string().min(5, "La información de contacto debe tener al menos 5 caracteres"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string(),
    referralCode: z.string().optional(),
    agreeTerms: z.boolean().refine((val) => val === true, {
      message: "Debes aceptar los términos de servicio",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

// Forgot password schema
const forgotPasswordSchema = z.object({
  username: z.string().min(2, "El nombre de usuario debe tener al menos 2 caracteres"),
});

export default function AuthPage() {
  // Sử dụng custom hook để quản lý logic và trạng thái
  const {
    user,
    isLoading: authLoading,
    login,
    register,
    forgotPassword,
    logout,
  } = useAuth();

  const [formType, setFormType] = useState<
    "login" | "register" | "forgotPassword"
  >("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const switchForm = (type: "login" | "register" | "forgotPassword") => {
    setFormType(type);
  };

  const toggleShowPassword = () => setShowPassword(!showPassword);
  const toggleShowConfirmPassword = () =>
    setShowConfirmPassword(!showConfirmPassword);

  const [_, navigate] = useLocation();

  // Form setup for login
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  // Form setup for registration
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      contact: "",
      password: "",
      confirmPassword: "",
      referralCode: "",
      agreeTerms: false,
    },
  });

  // Form setup for forgot password
  const forgotPasswordForm = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      username: "",
    },
  });

  // Handle login submission
  const onLoginSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      setIsSubmitting(true);
      await login({
        username: data.username,
        password: data.password,
      });
      // El inicio de sesión exitoso será manejado por useEffect
    } catch (error) {
      // El error ya fue manejado por el hook useAuth
      console.error("Login error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle registration submission
  const onRegisterSubmit = async (data: z.infer<typeof registerSchema>) => {
    try {
      setIsSubmitting(true);
      await register({
        username: data.email, // Using email as username
        password: data.password,
        firstName: data.fullName,
        lastName: "",
        email: data.email,
        role: "user",
      });
      // El registro exitoso será manejado por useEffect
    } catch (error) {
      // El error ya fue manejado por el hook useAuth
      console.error("Registration error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle forgot password submission
  const onForgotPasswordSubmit = async (
    data: z.infer<typeof forgotPasswordSchema>,
  ) => {
    try {
      setIsSubmitting(true);
      await forgotPassword(data.username);
      toast({
        title: "Solicitud enviada",
        description: "Por favor, revisa tu correo electrónico para restablecer la contraseña",
      });
      switchForm("login");
    } catch (error) {
      // El error ya fue manejado por el hook useAuth
      console.error("Forgot password error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <AuthLayout>
      {formType === "login" && (
        <>
          <div className="text-center mb-8">
            <Lock className="h-14 w-14 mx-auto text-blue-600" />
            <h3 className="text-2xl font-bold text-blue-600 mt-4">Iniciar sesión</h3>
            <p className="text-sm text-gray-600 mt-2">
              Ingresa tu información para acceder a tu cuenta
            </p>
          </div>

          <Form {...loginForm}>
            <form
              onSubmit={loginForm.handleSubmit(onLoginSubmit)}
              className="space-y-4"
            >
              <FormField
                control={loginForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">
                      Tên đăng nhập
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                          placeholder="Nhập tên đăng nhập của bạn"
                          className="pl-10 border-gray-300 focus:border-primary"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Contraseña</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Ingresa tu contraseña"
                          className="pl-10 pr-10 border-gray-300 focus:border-primary"
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                          onClick={toggleShowPassword}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <div className="flex items-center justify-between">
                <FormField
                  control={loginForm.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember-me"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-primary border-gray-300"
                      />
                      <label
                        htmlFor="remember-me"
                        className="text-sm font-medium text-gray-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Recordar sesión
                      </label>
                    </div>
                  )}
                />
                <div className="text-sm">
                  <a
                    href="#"
                    className="font-medium text-primary hover:text-primary/90 transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      switchForm("forgotPassword");
                    }}
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-md"
                disabled={isSubmitting || authLoading}
              >
                {isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes una cuenta?{" "}
              <a
                href="#"
                className="font-medium text-primary hover:text-primary/90 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  switchForm("register");
                }}
              >
                Regístrate
              </a>
            </p>
          </div>
        </>
      )}

      {formType === "register" && (
        <>
          <div className="text-center mb-6">
            <User className="h-14 w-14 mx-auto text-blue-600" />
            <h3 className="text-2xl font-bold text-blue-600 mt-4">Registro</h3>
            <p className="text-sm text-gray-600 mt-2">
              Crea una cuenta para gestionar huellas digitales del navegador
            </p>
          </div>

          <Form {...registerForm}>
            <form
              onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
              className="space-y-4"
            >
              <FormField
                control={registerForm.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 flex items-center">
                      Nombre <span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                          placeholder="Ingresa tu nombre"
                          className="pl-10 border-gray-300 focus:border-primary"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={registerForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 flex items-center">
                      Email <span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                          placeholder="Ingresa tu dirección de email"
                          className="pl-10 border-gray-300 focus:border-primary"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={registerForm.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 flex items-center">
                      Contacto de soporte{" "}
                      <span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                          placeholder="Ingresa gmail, teléfono, Facebook, telegram..."
                          className="pl-10 border-gray-300 focus:border-primary"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={registerForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 flex items-center">
                      Contraseña <span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Ingresa tu contraseña"
                          className="pl-10 pr-10 border-gray-300 focus:border-primary"
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                          onClick={toggleShowPassword}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={registerForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 flex items-center">
                      Confirmar contraseña{" "}
                      <span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Vuelve a ingresar tu contraseña"
                          className="pl-10 pr-10 border-gray-300 focus:border-primary"
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                          onClick={toggleShowConfirmPassword}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={registerForm.control}
                name="referralCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">
                      Código de referido (Opcional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ingresa el código de referido"
                        className="border-gray-300 focus:border-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={registerForm.control}
                name="agreeTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-primary border-gray-300"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm text-gray-700">
                        Acepto los{" "}
                        <a href="#" className="text-primary hover:underline">
                          Términos de servicio
                        </a>{" "}
                        y la{" "}
                        <a href="#" className="text-primary hover:underline">
                          Política de privacidad
                        </a>
                      </FormLabel>
                      <FormMessage className="text-xs" />
                    </div>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-md"
                disabled={isSubmitting || authLoading}
              >
                {isSubmitting ? "Procesando..." : "Crear cuenta"}
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{" "}
              <a
                href="#"
                className="font-medium text-primary hover:text-primary/90 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  switchForm("login");
                }}
              >
                Iniciar sesión
              </a>
            </p>
          </div>
        </>
      )}

      {formType === "forgotPassword" && (
        <>
          <div className="text-center mb-8">
            <Lock className="h-14 w-14 mx-auto text-blue-600" />
            <h3 className="text-2xl font-bold text-blue-600 mt-4">
              Olvidé mi contraseña
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              Ingresa tu nombre de usuario para recibir el enlace de restablecimiento
            </p>
          </div>

          <Form {...forgotPasswordForm}>
            <form
              onSubmit={forgotPasswordForm.handleSubmit(onForgotPasswordSubmit)}
              className="space-y-4"
            >
              <FormField
                control={forgotPasswordForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">
                      Nombre de usuario
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                          placeholder="Ingresa tu nombre de usuario"
                          className="pl-10 border-gray-300 focus:border-primary"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-md"
                disabled={isSubmitting || authLoading}
              >
                {isSubmitting ? "Procesando..." : "Enviar enlace de restablecimiento"}
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Recuerdas tu contraseña?{" "}
              <a
                href="#"
                className="font-medium text-primary hover:text-primary/90 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  switchForm("login");
                }}
              >
                Volver a iniciar sesión
              </a>
            </p>
          </div>
        </>
      )}
    </AuthLayout>
  );
}
