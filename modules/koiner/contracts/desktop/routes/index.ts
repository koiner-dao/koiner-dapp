import { RouteRecordRaw } from 'vue-router';
import { contractRoutes } from './contract-routes';
import { contractsRoutes } from './contracts-routes';

export const contractsModuleDesktopRoutes: RouteRecordRaw[] = [
  ...contractRoutes,
  ...contractsRoutes,
];
