'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import Grid from '@mui/material/Unstable_Grid2';

const states = [
  { value: 'Junin', label: 'Junin' },
  { value: 'Lima', label: 'Lima' },
  { value: 'Cuzco', label: 'Cuzco' },
] as const;

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

export function AccountDetailsForm(): React.JSX.Element {
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
    <form
      onSubmit={(event) => {
        event.preventDefault();
        
      }}
    >
      <Card>
        <CardHeader subheader="Datos del Personal" title="Perfil" />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Nombre</InputLabel>
                <OutlinedInput defaultValue={user.nombre} label="Nombre" name="Nombre" />
              </FormControl>
            </Grid>
            <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Apellido</InputLabel>
                <OutlinedInput defaultValue={user.apellido} label="Apellido" name="Apellido" />
              </FormControl>
            </Grid>
            <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Correo Electronico</InputLabel>
                <OutlinedInput defaultValue={user.email} label="Correo Electronico" name="email" />
              </FormControl>
            </Grid>
            <Grid md={6} xs={12}>
              <FormControl fullWidth>
                <InputLabel>Numero Telefonico</InputLabel>
                <OutlinedInput defaultValue={user.num_telefonico || ''} label="Numero Telefonico" name="Numero Telefonico" type="tel" />
              </FormControl>
            </Grid>
            <Grid md={6} xs={12}>
              <FormControl fullWidth>
                <InputLabel>Region</InputLabel>
                <Select defaultValue={user.region || 'Lima'} label="Region" name="region">
                  {states.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid md={6} xs={12}>
              <FormControl fullWidth>
                <InputLabel>Direccion</InputLabel>
                <OutlinedInput defaultValue={user.direccion || 'SERCON'} label="Direccion" name="Direccion" />
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button variant="contained" type="submit">Guardar Datos</Button>
        </CardActions>
      </Card>
    </form>
  );
}
