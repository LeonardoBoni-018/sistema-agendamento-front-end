import { useAuthStore } from '@/store/authStore'
import { Bell } from 'lucide-react'

interface HeaderProps {
    title: string
}

export function Header({ title }: HeaderProps) {
    const { user } = useAuthStore()

    return (
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6">
            <h1 className="text-white text-xl font-semibold">{title}</h1>
            <div className="flex items-center gap-4">
                <button className="text-gray-400 hover:text-white transition-colors relative">
                    <Bell size={20} />
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs font-bold">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-white text-sm">{user?.name}</span>
                </div>
            </div>
        </header>
    )
}