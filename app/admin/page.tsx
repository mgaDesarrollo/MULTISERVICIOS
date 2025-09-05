import { AdminPanel } from "@/components/admin-panel"

// La protección de esta ruta se maneja en middleware.ts
export default function AdminPage() {
  return <AdminPanel />
}
