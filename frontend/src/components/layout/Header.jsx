import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Bell, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Header({ onMenuToggle }) {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMenuToggle}
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </Button>
      
      <div className="flex-1">
        <h1 className="text-xl font-semibold md:text-2xl">
          O.T.R.A Food Distribution
        </h1>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="relative">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </Button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 rounded-md border bg-background p-4 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Notifications</h3>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5"
                  onClick={() => setShowNotifications(false)}
                  aria-label="Close notifications"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="py-1">
                <p className="text-sm text-muted-foreground">No new notifications</p>
              </div>
            </div>
          )}
        </div>
        
        <ThemeToggle />
        
        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <p className="text-sm font-medium">{user?.name || 'User'}</p>
            <p className="text-xs text-muted-foreground">{user?.role || 'Role'}</p>
          </div>
          <div className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground",
            "text-sm font-medium uppercase"
          )}>
            {user?.name ? user.name.charAt(0) : 'U'}
          </div>
        </div>
      </div>
    </header>
  );
} 