import { LayoutDashboard, Users, CreditCard, History, Settings } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const items = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Membros', url: '/membros', icon: Users },
  { title: 'Planos', url: '/planos', icon: CreditCard },
  { title: 'Histórico', url: '/historico', icon: History },
  { title: 'Definições', url: '/definicoes', icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent className="pt-6">
        <div className={`px-4 mb-8 ${collapsed ? 'px-2' : ''}`}>
          <h1 className={`font-semibold tracking-tight ${collapsed ? 'text-center text-lg' : 'text-xl'}`}>
            {collapsed ? 'N' : 'Nexus'}
          </h1>
          {!collapsed && (
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground mt-1">Gestão de Membros</p>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/'}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-foreground font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
