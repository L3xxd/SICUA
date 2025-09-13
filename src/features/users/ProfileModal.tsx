import React from "react";
import { User } from "../../types"; // Ajusta el import según tu definición de usuario

interface ProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ user, isOpen, onClose }) => {
  if (!isOpen) return null;

  // Calcula la antigüedad
  const entryDate = new Date(user.fechaIngreso);
  const now = new Date();
  const diff = now.getTime() - entryDate.getTime();
  const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
        <button className="absolute top-2 right-2 text-gray-500" onClick={onClose}>✕</button>
        <h2 className="text-xl font-bold mb-4">Perfil de Usuario</h2>
        <div className="space-y-2">
          <div><span className="font-semibold">Nombre:</span> {user.nombreCompleto}</div>
          <div><span className="font-semibold">Teléfono:</span> {user.telefono}</div>
          <div><span className="font-semibold">Correo:</span> {user.email}</div>
          <div><span className="font-semibold">Puesto:</span> {user.puesto}</div>
          <div><span className="font-semibold">Departamento:</span> {user.departamento}</div>
          <div><span className="font-semibold">Fecha de ingreso:</span> {user.fechaIngreso}</div>
          <div><span className="font-semibold">Antigüedad:</span> {years} año(s)</div>
          <div><span className="font-semibold">Tipo de contrato:</span> {user.tipoContrato}</div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
