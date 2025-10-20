'use client';

// import { usePathname } from 'next/navigation';
import ChatSidebarContent from '@/components/sidebar/components/Content';
import DocumentSidebar from '@/components/sidebar/components/DocumentContent';
import { IRoute } from '@/types/navigation';

interface SidebarWrapperProps {
  routes: IRoute[];
  [x: string]: any;
}

function SidebarWrapper(props : SidebarWrapperProps) {
  const { routes, setApiKey } = props;
  // const pathname = usePathname();
  // const isAdminRoute = pathname?.includes('admin');
  // if (isAdminRoute) {
  //   return <DocumentSidebar />;
  // }

  return <ChatSidebarContent setApiKey={setApiKey} routes={routes} />;
}

export default SidebarWrapper;
