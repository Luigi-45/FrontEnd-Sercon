'use client';
import Link from 'next/link';
import { useRouter } from 'next/router';
import * as React from 'react';
import { useState, useEffect } from 'react';
import RouterLink from 'next/link';
import { usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ArrowSquareUpRight as ArrowSquareUpRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowSquareUpRight';
import { CaretUpDown as CaretUpDownIcon } from '@phosphor-icons/react/dist/ssr/CaretUpDown';
import { Circuitry, Coffee, DevToLogo } from "@phosphor-icons/react";
import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';
import { isNavItemActive } from '@/lib/is-nav-item-active';
import { Logo } from '@/components/core/logo';
import Avatar from '@mui/material/Avatar';


import { navItems } from './config';
import { navIcons } from './nav-icons';

interface User {
  nombre: string;
  apellido: string;
  email: string;
  num_telefonico?: string;
  region?: string;
  direccion?: string;
}

const email = localStorage.getItem('user-email');
const USER_API_BASE_URL = `http://localhost:8086/api/personal/findByEmail/${email}`;

export function SideNav(): React.JSX.Element {
  const pathname = usePathname();

  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    const fetchUserFromAPI = async () => {
      try {
        const response = await fetch(USER_API_BASE_URL);

        if (!response.ok) {
          throw new Error('Error al obtener los datos del usuario');
        }

        const userData: User = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('Error al obtener los datos del usuario:', error);
      }
    };

    fetchUserFromAPI();
  }, []);

  if (!user) {
    return <div>Cargando...</div>;
  }

  return (
    <Box
      sx={{
        '--SideNav-background': 'var(--mui-palette-neutral-950)',
        '--SideNav-color': 'var(--mui-palette-common-white)',
        '--NavItem-color': 'var(--mui-palette-neutral-300)',
        '--NavItem-hover-background': 'rgba(255, 255, 255, 0.04)',
        '--NavItem-active-background': 'var(--mui-palette-primary-main)',
        '--NavItem-active-color': 'var(--mui-palette-primary-contrastText)',
        '--NavItem-disabled-color': 'var(--mui-palette-neutral-500)',
        '--NavItem-icon-color': 'var(--mui-palette-neutral-400)',
        '--NavItem-icon-active-color': 'var(--mui-palette-primary-contrastText)',
        '--NavItem-icon-disabled-color': 'var(--mui-palette-neutral-600)',
        bgcolor: 'var(--SideNav-background)',
        color: 'var(--MobileNav-color)',
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column',
        height: '100%',
        left: 0,
        maxWidth: '100%',
        position: 'fixed',
        scrollbarWidth: 'none',
        top: 0,
        width: 'var(--SideNav-width)',
        zIndex: 'var(--SideNav-zIndex)',
        '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      <Stack alignItems="center" spacing={2}>
        <div style={{ display: 'flex', alignItems: 'center' , justifyContent: 'center', padding: 18}}>
          <Box component={RouterLink} href={paths.home} sx={{ display: 'inline-flex' }}>
            <Avatar src="/img/l.jpg" sx={{ width: 80, height: 80, marginRight: 1 }} />
          </Box>
          <Typography color="white" variant="subtitle1">
            SERCON
          </Typography>
        </div>
        
      </Stack>

      <Stack spacing={2} sx={{ p: 3 }} >
        <Box
          sx={{
            alignItems: 'center',
            backgroundColor: 'var(--mui-palette-info-950)',
            border: '1px solid var(--mui-palette-neutral-700)',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            p: '4px 12px',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar src="/img/logo.png" sx={{ marginRight: 1 }} />
            <Typography color="white" variant="body2">
            {user.nombre} {user.apellido}
            </Typography>
          </Box>
        </Box>
      </Stack>
      <Divider sx={{ borderColor: 'var(--mui-palette-neutral-700)' }} />
      <Box component="nav" sx={{ flex: '1 1 auto', p: '12px' }}>
        {renderNavItems({ pathname, items: navItems })}
      </Box>
      <Divider sx={{ borderColor: 'var(--mui-palette-neutral-700)' }} />
    </Box>
  );
}

function renderNavItems({ items = [], pathname }: { items?: NavItemConfig[]; pathname: string }): React.JSX.Element {
  const children = items.reduce((acc: React.ReactNode[], curr: NavItemConfig): React.ReactNode[] => {
    const { key, ...item } = curr;

    acc.push(<NavItem key={key} pathname={pathname} {...item} />);

    return acc;
  }, []);

  return (
    <Stack component="ul" spacing={1} sx={{ listStyle: 'none', m: 0, p: 0 }}>
      {children}
    </Stack>
  );
}

interface NavItemProps extends Omit<NavItemConfig, 'items'> {
  pathname: string;
}

function NavItem({ disabled, external, href, icon, matcher, pathname, title }: NavItemProps): React.JSX.Element {
  const active = isNavItemActive({ disabled, external, href, matcher, pathname });
  const Icon = icon ? navIcons[icon] : null;
  const [redirected, setRedirected] = useState(false);

  const handleRedirect = () => {
    if (href) {
      setRedirected(true);
    }
  };

  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <li>
      <Box
        {...(href
          ? {
            component: external ? 'a' : RouterLink,
            href,
            target: external ? '_blank' : undefined,
            rel: external ? 'noreferrer' : undefined,
            onClick: () => setRedirected(false),
          }
          : { role: 'button' })}
        sx={{
          alignItems: 'center',
          borderRadius: 1,
          color: 'var(--NavItem-color)',
          cursor: 'pointer',
          display: 'flex',
          flex: '0 0 auto',
          gap: 1,
          p: '6px 16px',
          position: 'relative',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          ...(disabled && {
            bgcolor: 'var(--NavItem-disabled-background)',
            color: 'var(--NavItem-disabled-color)',
            cursor: 'not-allowed',
          }),
          ...(active && { bgcolor: 'var(--NavItem-active-background)', color: 'var(--NavItem-active-color)' }),
        }}
      >
        <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'center', flex: '0 0 auto' }}>
          {Icon ? (
            <Icon
              fill={active ? 'var(--NavItem-icon-active-color)' : 'var(--NavItem-icon-color)'}
              fontSize="var(--icon-fontSize-md)"
              weight={active ? 'fill' : undefined}
            />
          ) : null}
        </Box>
        <Box sx={{ flex: '1 1 auto' }}>
          <Typography
            component="span"
            sx={{ color: 'inherit', fontSize: '0.875rem', fontWeight: 500, lineHeight: '28px' }}
          >
            {title}
          </Typography>
        </Box>
        <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'center', flex: '0 0 auto' }}>
          {title === 'Insumos' || title === 'Productos' ? (
            <CaretUpDownIcon fontSize="var(--icon-fontSize-md)" onClick={handleClick} />
          ) : null}
        </Box>
      </Box>
      {open && (() => {
        if (title === 'Insumos') {
          return (
            <Box
              {...(href
                ? {
                  component: external ? 'a' : RouterLink,
                  href: external ? href : paths.dashboard.categoriaInsumo,
                  target: external ? '_blank' : undefined,
                  rel: external ? 'noreferrer' : undefined,
                  onClick: handleRedirect,
                }
                : { role: 'button' })}
              sx={{
                alignItems: 'center',
                borderRadius: 1,
                color: "var(--NavItem-color)",
                cursor: 'pointer',
                display: 'flex',
                flex: '0 0 auto',
                gap: 1,
                p: '6px 16px',
                position: 'relative',
                textDecoration: 'none',
                backgroundColor: redirected ? { backgroundColor: 'var(--NavItem-active-background)', color: 'var(--NavItem-active-color)' } : {
                  backgroundColor
                    : 'var(--NavItem-disabled-background)',
                  color: "var(--NavItem-color)",
                },
                whiteSpace: 'nowrap',
              }}
            >
              <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'center', flex: '0 0 auto' }}>
                <Coffee weight={redirected ? 'fill' : undefined} fill={redirected ? 'var(--NavItem-icon-active-color)' : 'var(--NavItem-icon-color)'} />
              </Box>
              <Box sx={{ flex: '1 1 auto' }}>
                <Typography
                  component="span"
                  sx={{ color: 'inherit', fontSize: '0.875rem', fontWeight: 500, lineHeight: '28px' }}
                >
                  Categorias Insumo
                </Typography>
              </Box>
            </Box>
          );
        } else {
          return (
            <Box
              {...(href
                ? {
                  component: external ? 'a' : RouterLink,
                  href: external ? href : paths.dashboard.categoriaProducto,
                  target: external ? '_blank' : undefined,
                  rel: external ? 'noreferrer' : undefined,
                  onClick: handleRedirect,
                }
                : { role: 'button' })}
              sx={{
                alignItems: 'center',
                borderRadius: 1,
                color: "var(--NavItem-color)",
                cursor: 'pointer',
                display: 'flex',
                flex: '0 0 auto',
                gap: 1,
                p: '6px 16px',
                position: 'relative',
                textDecoration: 'none',
                backgroundColor: redirected ? { backgroundColor: 'var(--NavItem-active-background)', color: 'var(--NavItem-active-color)' } : {
                  backgroundColor
                    : 'var(--NavItem-disabled-background)',
                  color: "var(--NavItem-color)",
                },
                whiteSpace: 'nowrap',
              }}
            >
              <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'center', flex: '0 0 auto' }}>
                <Coffee weight={redirected ? 'fill' : undefined} fill={redirected ? 'var(--NavItem-icon-active-color)' : 'var(--NavItem-icon-color)'} />
              </Box>
              <Box sx={{ flex: '1 1 auto' }}>
                <Typography
                  component="span"
                  sx={{ color: 'inherit', fontSize: '0.875rem', fontWeight: 500, lineHeight: '28px' }}
                >
                  Categorias Producto
                </Typography>
              </Box>
            </Box>
          );
        }
      })()}

    </li>
  );
}
