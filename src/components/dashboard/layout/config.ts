import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { key: 'home', title: 'Home', href: paths.dashboard.overview, icon: 'chart-pie' },
  { key: 'cuenta', title: 'Usuario', href: paths.dashboard.account, icon: 'user' },
  { key: 'insumos', title: 'Insumos', href: paths.dashboard.customers, icon: "box" },
  { key: 'productos', title: 'Productos', href: paths.dashboard.productos, icon: 'circuity' },
  { key: 'almacenes', title: 'Almacenes', href: paths.dashboard.almacenes, icon: 'house' },
  { key: 'proveedores', title: 'Proveedores', href: paths.dashboard.proveedores, icon: 'tote' },
 
] satisfies NavItemConfig[];
