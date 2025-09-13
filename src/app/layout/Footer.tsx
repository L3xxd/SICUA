import React from 'react';

/**
 * Componente: Footer
 * Propósito: Mostrar el aviso de derechos de autor en toda la aplicación.
 * Ubicaciones de uso:
 *  - Layout principal: `src/app/layout/Layout.tsx`
 *  - Pantalla de login: `src/features/auth/LoginPage.tsx`
 * Contenido: Año actual + autores del sistema.
 * Última modificación: Inclusión inicial del componente y estilos base (borde superior y fondo blanco).
 */

const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <p className="text-center text-sm text-gray-500">
          © {year} Alejandro Balderas Rios, Citlalli Perez Tellez y Cristofer Castro Alvarez. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
