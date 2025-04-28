import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

// Динамический импорт React-приложения
const AdminApp = dynamic(() => import('../../react-app/AdminApp'), {
  ssr: false
})

export default function AdminPage() {
  const router = useRouter()
  // Передаем все данные маршрутизации в React-приложение
  return <AdminApp path={router.query.path || []} asPath={router.asPath} />
}