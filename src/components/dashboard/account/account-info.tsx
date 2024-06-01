'use client';
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface User {
  nombre: string;
  apellido: string;
  avatar: string;
  puesto: string;
  país: string;
  ciudad: string;
  zonaHoraria: string;
}

export function AccountInfo(): React.JSX.Element {
  const [userd, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    const fetchUserFromAPI = async () => {
      const email = localStorage.getItem('user-email');
      const USER_API_BASE_URL = `http://localhost:8086/api/personal/findByEmail/${email}`;

      try {
        const response = await fetch(USER_API_BASE_URL);

        if (!response.ok) {
          throw new Error('Error al obtener los datos del usuario');
        }

        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('Error al obtener los datos del usuario:', error);
      }
    };
    fetchUserFromAPI();
  }, []);

  if (!userd) {
    return <div>Cargando...</div>;
  }

  const user = {
    nombre: userd.nombre,
    apellido: userd.apellido,
    avatar: '/img/logo.png',
    puesto: 'Desarrollador Senior',
    país: 'Junín',
    ciudad: 'Huancayo',
    zonaHoraria: 'GMT-7',
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          <div>
            <Avatar src={user.avatar} sx={{ height: '80px', width: '80px' }} />
          </div>
          <Stack spacing={1} sx={{ textAlign: 'center' }}>
            <Typography variant="h5">{user.nombre+" "+user.apellido}</Typography>
            <Typography color="text.secondary" variant="body2">
              {user.ciudad}, {user.país}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Zona Horaria: {user.zonaHoraria}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
      <Divider />
      <CardActions>
        <Button fullWidth variant="text">
          Subir Imagen
        </Button>
      </CardActions>
    </Card>
  );
}
