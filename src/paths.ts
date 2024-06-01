export const paths = {
  home: '/',
  auth: { signIn: '/auth/sign-in', signUp: '/auth/sign-up', resetPassword: '/auth/reset-password' },
  dashboard: {
    overview: '/dashboard',
    account: '/dashboard/account',
    customers: '/dashboard/customers',
    settings: '/dashboard/settings',
    productos: '/dashboard/productos',
    almacenes: '/dashboard/almacenes',
    proveedores: '/dashboard/proveedores',
    categoriaInsumo: '/dashboard/categoria-insumo',
    categoriaProducto: '/dashboard/categoria-producto',
  },
  errors: { notFound: '/errors/not-found' },
} as const;
