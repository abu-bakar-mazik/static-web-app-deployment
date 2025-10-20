import { Icon } from '@chakra-ui/react';
import { IRoute } from './types/navigation';
import { Comment01Icon, DocumentAttachmentIcon, LibraryIcon, Loading03Icon, FolderLibraryIcon, MicrosoftAdminIcon, ChartRelationshipIcon, Exchange01Icon, AlgorithmIcon, FileScriptIcon, AiSettingIcon } from 'hugeicons-react';
import { useAuth } from './hooks/useAuth';
export default function RouteConfig() {
  const { userRole } = useAuth();
  const baseRoutes: IRoute[] = [
    {
      name: 'Chat',
      path: '/',
      icon: <Comment01Icon style={{ width: 24, height: 24 }} color="inherit" />,
      collapse: false,
    },
    {
      name: 'Batch Prompting',
      path: '/batch',
      icon: <Loading03Icon style={{ width: 24, height: 24 }} color="inherit" />,
      collapse: false,
    },
    {
      name: 'Documents',
      path: '/documents',
      icon: <DocumentAttachmentIcon style={{ width: 24, height: 24 }} color="inherit" />,
      collapse: false,
    },
    {
      name: 'Prompt Library',
      path: '/prompt-library',
      icon: <LibraryIcon style={{ width: 24, height: 24 }} color="inherit" />,
      collapse: false,
    },
    {
      name: 'Documentation Categories',
      path: '/categories',
      icon: <FolderLibraryIcon style={{ width: 24, height: 24 }} color="inherit" />,
      collapse: false,
    },
  ];
  const batchRoute: IRoute = {
    name: 'Batch Automation',
    path: '/batchautomation',
    icon: <AiSettingIcon style={{ width: 24, height: 24 }} color="inherit" />,
    collapse: false,
  };
  const adminRoute: IRoute = {
    name: 'Admin - Logs',
    path: '/admin/logs-analysis',
    icon: <Icon as={MicrosoftAdminIcon} boxSize={{ base: 5, sm: 5, xl: 6 }} color="inherit" />,
    collapse: false,
  };
  const routes: IRoute[] = [...baseRoutes];
  if (['Owner', 'Admin', 'admin'].includes(userRole || '')) {
    routes.push(...[batchRoute, adminRoute]);
  }
  if (['documentprocessautomation'].includes(userRole || '')) {
    routes.push(...[batchRoute]);
  }
  return routes;
}
