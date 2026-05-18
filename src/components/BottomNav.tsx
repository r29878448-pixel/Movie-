import { NavLink } from 'react-router-dom';
import { Home, Tv, Film, MonitorPlay, User } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Tv, label: 'Series', path: '/series' },
  { icon: MonitorPlay, label: 'Live TV', path: '/livetv' },
  { icon: Film, label: 'Movies', path: '/movies' },
  { icon: User, label: 'Profile', path: '/profile' },
];

export function BottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#E8EDF2] pointer-events-auto">
      <nav className="flex items-center justify-around px-2 py-3 pb-safe-offset-3">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                'relative flex flex-col items-center justify-center w-[70px] h-[70px] rounded-2xl transition-all duration-300',
                isActive 
                  ? 'text-[#F2AE01] bg-[#E8EDF2] shadow-[inset_4px_4px_8px_#c5cad0,inset_-4px_-4px_8px_#ffffff]' 
                  : 'text-gray-400 hover:text-gray-500'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-[#F2AE01] rounded-b-full"></div>
                )}
                <item.icon className="w-6 h-6 mb-1" />
                <span className="text-[10px] sm:text-[11px] font-bold">
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
