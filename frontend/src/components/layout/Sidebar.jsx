import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Home, 
  Package, 
  Users, 
  Settings, 
  LogOut, 
  Building2, 
  ShoppingCart, 
  BarChart3, 
  X, 
  Tags,
  UserCircle,
  ClipboardList,
  MessageSquareText
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export default function Sidebar({ onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  if (!user) return null;

  // Original sidebar items
  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
      roles: ['admin', 'stock_manager', 'accountant']
    },
    {
      title: "Products",
      href: "/products",
      icon: Package,
      roles: ['admin', 'stock_manager']
    },
    {
      title: "Stock Movements",
      href: "/stock-movements",
      icon: ShoppingCart,
      roles: ['admin', 'stock_manager']
    },
    {
      title: "Categories",
      href: "/categories",
      icon: Tags,
      roles: ['admin', 'stock_manager']
    },
    {
      title: "Suppliers",
      href: "/suppliers",
      icon: Building2,
      roles: ['admin', 'stock_manager']
    },
    {
      title: "Reports",
      href: "/reports",
      icon: BarChart3,
      roles: ['admin', 'accountant']
    },
    {
      title: "Users",
      href: "/users",
      icon: Users,
      roles: ['admin']
    },
    {
      title: "AI Assistant",
      href: "/chat",
      icon: MessageSquareText,
      roles: ['admin', 'stock_manager', 'accountant']
    },
  ];

  // Filter based on user role
  const filteredNavItems = navItems.filter(item => item.roles.includes(user.role.toLowerCase()));
  
  // Build complete sidebar items by adding profile, settings, and audit logs
  const sidebarItems = [
    ...filteredNavItems,
    {
      title: "My Profile",
      href: "/profile",
      icon: UserCircle,
      roles: ['admin', 'stock_manager', 'accountant']
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
      roles: ['admin', 'stock_manager', 'accountant']
    },
  ];
  
  // Add audit logs only for admins
  if (user?.role.toLowerCase() === 'admin') {
    sidebarItems.push({
      title: "Audit Logs",
      href: "/audit-logs",
      icon: ClipboardList,
      roles: ['admin']
    });
  }

  return (
    <div className="flex h-full flex-col overflow-auto border-r bg-background">
      <div className="flex h-16 items-center justify-between px-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="font-semibold text-lg">O.T.R.A</span>
          <span className="text-xs text-muted-foreground">Food Distribution</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4">
        {sidebarItems.map((item) => {
          const isActive = location.pathname === item.href || 
                           (item.href !== "/dashboard" && location.pathname.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => onClose && window.innerWidth < 768 ? onClose() : null}
              className={cn(
                "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary dark:bg-primary/20"
                  : "text-foreground/70 hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon 
                className={cn(
                  "mr-3 h-5 w-5 shrink-0",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )} 
              />
              {item.title}
            </Link>
          );
        })}
        
        <Separator className="my-4" />
        
        <Button variant="outline" className="w-full justify-start" onClick={() => {
          logout();
          navigate('/login');
        }}>
          <LogOut className="mr-3 h-5 w-5 text-muted-foreground" />
          Logout
        </Button>
      </nav>
      
      <div className="mt-auto border-t p-4">
        <div className="mb-3 space-y-1">
          <p className="text-sm font-medium">{user.name || user.email}</p>
          <p className="text-xs capitalize text-muted-foreground">Role: {user.role}</p>
        </div>
      </div>
    </div>
  );
}

// Need to import useNavigate from react-router-dom for the handleLogout function
// import { useNavigate } from "react-router-dom"; // This is redundant 