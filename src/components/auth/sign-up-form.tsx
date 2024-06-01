'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { paths } from '@/paths';
import { authClient } from '@/lib/auth/client';
import { useUser } from '@/hooks/use-user';

const schema = zod.object({
  nombres: zod.string().min(1, { message: 'First name is required' }),
  apellidos: zod.string().min(1, { message: 'Last name is required' }),
  email: zod.string().min(1, { message: 'Email is required' }).email(),
  contraseña: zod.string().min(6, { message: 'Password should be at least 6 characters' }),
  edad: zod.string().min(1, { message: 'Age is required' }).regex(/^\d+$/, 'Age must be a number'),
  genero: zod.string().min(1, { message: 'Gender is required' }),
  num_telefonico: zod.string().min(1, { message: 'Phone number is required' }),
  dni: zod.string().min(1, { message: 'DNI is required' }),
  terms: zod.boolean().refine((value) => value, 'You must accept the terms and conditions'),
});

type Values = zod.infer<typeof schema>;

const LOGIN_API_BASE_URL = "http://localhost:8086/api/usuarios/save";
const PERSONAL_API_BASE_URL = "http://localhost:8086/api/personal/save";

const defaultValues = { nombres: '', apellidos: '', email: '', contraseña: '', edad: '', genero: '', num_telefonico: '', dni: '', terms: false } satisfies Values;

export function SignUpForm(): React.JSX.Element {
  const router = useRouter();

  const { checkSession } = useUser();

  const [isPending, setIsPending] = React.useState<boolean>(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      setIsPending(true);

      const ageNumber = Number(values.edad);

      const loginResponse = await fetch(LOGIN_API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          contrasenia: values.contraseña,
          rol: 1,
        }),
      });

      if (!loginResponse.ok) {
        const error = await loginResponse.text();
        setError('root', { type: 'server', message: error });
        setIsPending(false);
        return;
      }

      const personalResponse = await fetch(PERSONAL_API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: values.nombres,
          apellido: values.apellidos,
          email: values.email,
          edad: ageNumber,
          genero: values.genero,
          num_telefonico: values.num_telefonico,
          dni: values.dni,
        }),
      });

      if (!personalResponse.ok) {
        const error = await personalResponse.text();
        setError('root', { type: 'server', message: error });
        setIsPending(false);
        return;
      }

      await checkSession?.();

      router.refresh();
    },
    [checkSession, router, setError]
  );

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h4">Sign up</Typography>
        <Typography color="text.secondary" variant="body2">
          Already have an account?{' '}
          <Link component={RouterLink} href={paths.auth.signIn} underline="hover" variant="subtitle2">
            Sign in
          </Link>
        </Typography>
      </Stack>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Controller
            control={control}
            name="nombres"
            render={({ field }) => (
              <FormControl error={Boolean(errors.nombres)}>
                <InputLabel>Nombres</InputLabel>
                <OutlinedInput {...field} label="Nombres" />
                {errors.nombres ? <FormHelperText>{errors.nombres.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="apellidos"
            render={({ field }) => (
              <FormControl error={Boolean(errors.apellidos)}>
                <InputLabel>Apellidos</InputLabel>
                <OutlinedInput {...field} label="Apellidos" />
                {errors.apellidos ? <FormHelperText>{errors.apellidos.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <FormControl error={Boolean(errors.email)}>
                <InputLabel>Email</InputLabel>
                <OutlinedInput {...field} label="Email" type="email" />
                {errors.email ? <FormHelperText>{errors.email.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="contraseña"
            render={({ field }) => (
              <FormControl error={Boolean(errors.contraseña)}>
                <InputLabel>Contraseña</InputLabel>
                <OutlinedInput {...field} label="Contraseña" type="password" />
                {errors.contraseña ? <FormHelperText>{errors.contraseña.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="edad"
            render={({ field }) => (
              <FormControl error={Boolean(errors.edad)}>
                <InputLabel>Edad</InputLabel>
                <OutlinedInput {...field} label="Edad" type="number" />
                {errors.edad ? <FormHelperText>{errors.edad.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="genero"
            render={({ field }) => (
              <FormControl error={Boolean(errors.genero)}>
                <InputLabel>Genero</InputLabel>
                <OutlinedInput {...field} label="Genero" />
                {errors.genero ? <FormHelperText>{errors.genero.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="num_telefonico"
            render={({ field }) => (
              <FormControl error={Boolean(errors.num_telefonico)}>
                <InputLabel>Numero Telefonico</InputLabel>
                <OutlinedInput {...field} label="Numero Telefonico" />
                {errors.num_telefonico ? <FormHelperText>{errors.num_telefonico.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="dni"
            render={({ field }) => (
              <FormControl error={Boolean(errors.dni)}>
                <InputLabel>DNI</InputLabel>
                <OutlinedInput {...field} label="DNI" />
                {errors.dni ? <FormHelperText>{errors.dni.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          {errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}
          <Button disabled={isPending} type="submit" variant="contained">
            Sign up
          </Button>
        </Stack>
      </form>
      <Alert color="warning"></Alert>
    </Stack>
  );
}
