import React, { createContext, useContext } from 'react';

type Role = 'owner' | 'worker' | null;

interface AppRoleContextValue {
  role: Role;
  setRole: (role: Role) => void;
}

const AppRoleContext = createContext<AppRoleContextValue | null>(null);

export function AppRoleProvider({
  role,
  setRole,
  children,
}: {
  role: Role;
  setRole: (role: Role) => void;
  children: React.ReactNode;
}) {
  return (
    <AppRoleContext.Provider value={{ role, setRole }}>
      {children}
    </AppRoleContext.Provider>
  );
}

export function useAppRole() {
  const ctx = useContext(AppRoleContext);
  if (!ctx) {
    throw new Error('useAppRole must be used within AppRoleProvider');
  }
  return ctx;
}