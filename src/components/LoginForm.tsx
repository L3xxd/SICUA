import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  LogIn,
  User,
  ShieldCheck,
  Users,
  Briefcase,
  Mail,
  Lock,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type QuickLogin = {
  role: string;
  email: string;
  color: string;
  icon: LucideIcon;
};

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const success = login(email, password);
    if (!success) setError('Credenciales inválidas');

    setLoading(false);
  };

  const quickLoginOptions: QuickLogin[] = [
    { role: 'Empleado',   email: 'empleado@empresa.com',   color: 'bg-blue-50 hover:bg-blue-100 text-blue-700',       icon: User },
    { role: 'Supervisor', email: 'supervisor@empresa.com', color: 'bg-green-50 hover:bg-green-100 text-green-700',    icon: ShieldCheck },
    { role: 'RRHH',       email: 'admin@empresa.com',      color: 'bg-purple-50 hover:bg-purple-100 text-purple-700', icon: Users },
    { role: 'Director',   email: 'director@empresa.com',   color: 'bg-orange-50 hover:bg-orange-100 text-orange-700', icon: Briefcase },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Encabezado con logo */}
        <div className="text-center">
          <div className="flex justify-center">
            <img
              src="/icono.png"
              alt="SICUA"
              className="w-16 sm:w-20 md:w-24 h-auto rounded-2xl shadow-md max-w-full"
              loading="eager"
            />
          </div>

          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Sistema de Control de Usuarios y Administración
          </h2>
          <p className="mt-2 text-sm text-gray-600">Accede a tu cuenta corporativa</p>
        </div>

        {/* Tarjeta de formulario */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <div className="mt-1 relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="usuario@empresa.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="mt-1 relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tu contraseña"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <LogIn className="h-5 w-5" aria-hidden="true" />
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Acceso rápido de demostración */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Acceso rápido de demostración</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {quickLoginOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.email}
                    onClick={() => {
                      setEmail(option.email);
                      setPassword('password');
                    }}
                    className={`flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium transition-colors ${option.color}`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {option.role}
                  </button>
                );
              })}
            </div>

            <p className="mt-4 text-xs text-gray-500 text-center">
              Contraseña para todas las cuentas: "password"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;




