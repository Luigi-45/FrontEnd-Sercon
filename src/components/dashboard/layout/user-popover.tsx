import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import { GearSix as GearSixIcon } from '@phosphor-icons/react/dist/ssr/GearSix';
import { SignOut as SignOutIcon } from '@phosphor-icons/react/dist/ssr/SignOut';
import { User as UserIcon } from '@phosphor-icons/react/dist/ssr/User';

import { paths } from '@/paths';
import { authClient } from '@/lib/auth/client';
import { logger } from '@/lib/default-logger';
import { useUser } from '@/hooks/use-user';

export interface UserPopoverProps {
  anchorEl: Element | null;
  onClose: () => void;
  open: boolean;
}

interface Usuario {
  nombre: string;
  apellido: string;
  email: string;
  num_telefonico?: string;
  region?: string;
  direccion?: string;
}

export function UserPopover({ anchorEl, onClose, open }: UserPopoverProps): React.JSX.Element {
  const { checkSession } = useUser();
  const router = useRouter();
  const [usuario, setUsuario] = React.useState<Usuario | null>(null);
  const [email, setEmail] = React.useState<string | null>(null);

  React.useEffect(() => {
    const storedEmail = localStorage.getItem('user-email');
    setEmail(storedEmail);
  }, []);

  React.useEffect(() => {
    if (!email) return;

    const fetchUsuarioFromAPI = async () => {
      try {
        const response = await fetch(`http://localhost:8086/api/personal/findByEmail/${email}`);

        if (!response.ok) {
          throw new Error('Error al obtener los datos del usuario');
        }

        const userData: Usuario = await response.json();
        setUsuario(userData);
      } catch (error) {
        console.error('Error al obtener los datos del usuario:', error);
      }
    };

    fetchUsuarioFromAPI();
  }, [email]);

  const handleSignOut = React.useCallback(async (): Promise<void> => {
    try {
      const { error } = await authClient.signOut();

      if (error) {
        logger.error('Error al cerrar sesión', error);
        return;
      }

      await checkSession?.();
      router.refresh();
    } catch (err) {
      logger.error('Error al cerrar sesión', err);
    }
  }, [checkSession, router]);

  if (!usuario) {
    return <div>Cargando...</div>;
  }

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      onClose={onClose}
      open={open}
      slotProps={{ paper: { sx: { width: '240px' } } }}
    >
      <Box sx={{ p: '16px 20px ' }}>
        <Typography variant="subtitle1">{usuario.nombre} {usuario.apellido}</Typography>
        <Typography color="text.secondary" variant="body2">
          {usuario.email}
        </Typography>
      </Box>
      <Divider />
      <MenuList disablePadding sx={{ p: '8px', '& .MuiMenuItem-root': { borderRadius: 1 } }}>
        <MenuItem component={RouterLink} href={paths.dashboard.account} onClick={onClose}>
          <ListItemIcon>
            <UserIcon fontSize="var(--icon-fontSize-md)" />
          </ListItemIcon>
          Perfil
        </MenuItem>
        <MenuItem onClick={handleSignOut}>
          <ListItemIcon>
            <SignOutIcon fontSize="var(--icon-fontSize-md)" />
          </ListItemIcon>
          Desconectar
        </MenuItem>
      </MenuList>
    </Popover>
  );
}
