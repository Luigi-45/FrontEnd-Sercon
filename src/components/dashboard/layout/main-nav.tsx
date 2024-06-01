'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { Bell as BellIcon } from '@phosphor-icons/react/dist/ssr/Bell';
import { AlignRight, TextAlignJustify, X } from "@phosphor-icons/react";
import { List as ListIcon } from '@phosphor-icons/react/dist/ssr/List';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { Users as UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';
import { Popover, List, ListItem, ListItemText, ListItemSecondaryAction, Button } from "@mui/material";
import { usePopover } from '@/hooks/use-popover';
import { useState, useEffect } from 'react';
import { MobileNav } from './mobile-nav';
import { UserPopover } from './user-popover';
import { Producto } from '../productos/productos-table';

const ALARMA_I_API_BASE_URL = "http://localhost:8083/api/alarma-insumo"
const ALARMA_P_API_BASE_URL = "http://localhost:8084/api/alarma-producto"
const PRODUCTO_API_BASE_URL = "http://localhost:8084/api/producto"

function AsyncInsumo({ insumoId }: { insumoId: number }) {
  const [insumo, setInsumo] = useState<Insumo | null>(null);

  interface Insumo {
    id: number;
    nombre: string;
    descripcion: string;
    costo_de_compra: number;
    unidad_medida: string;
    fecha_adquisicion: string;
    proveedor_id: number;
    almacen_id: number;
    categoria_insumo_id: number;
  }

  useEffect(() => {
    const fetchInsumo = async () => {
      try {
        const response = await fetch(`http://localhost:8083/api/insumo/findById/${insumoId}`);
        const data = await response.json();
        setInsumo(data);
      } catch (error) {
        console.error('Error fetching insumo:', error);
      }
    };

    fetchInsumo();
  }, [insumoId]);

  return insumo ? "Insumo: "+insumo.nombre : null;
}

function AsyncProducto({ productoId }: { productoId: number }) {
  const [producto, setProducto] = useState<Producto | null>(null);

  interface Producto {
    id: number;
    nombre: string;
    descripcion: string;
    precio_de_venta: number;
    fecha_produccion: string;
    stock: number;
    almacen_id: number;
    categoria_producto_id: number;
  }

  useEffect(() => {
    const fetchInsumo = async () => {
      try {
        const response = await fetch(`http://localhost:8084/api/producto/findById/${productoId}`);
        const data = await response.json();
        setProducto(data);
      } catch (error) {
        console.error('Error fetching producto:', error);
      }
    };

    fetchInsumo();
  }, [productoId]);

  return producto ? "Producto: "+producto.nombre : null;
}

export function MainNav(): React.JSX.Element {
  const [openNav, setOpenNav] = React.useState<boolean>(false);

  const userPopover = usePopover<HTMLDivElement>();

  const [anchorEl, setAnchorEl] = useState<EventTarget | null>(null);

  const [alarmaI, setAlarmaI] = useState<AlarmaI[]>([]);

  const [alarmaP, setAlarmaP] = useState<AlarmaP[]>([]);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };
  
  const handleDeleteI = (index: number) => {
    const newAlarmas = [...alarmaI];
    newAlarmas.splice(index, 1);
    setAlarmaI(newAlarmas);
  };

  const handleDeleteP = (index: number) => {
    const newAlarmas = [...alarmaP];
    newAlarmas.splice(index, 1);
    setAlarmaP(newAlarmas);
  };

  interface AlarmaI {
    id: number;
    insumo_id: number;
    tipo_alarma: number;
    fecha: string;
  }

  interface AlarmaP {
    id: number;
    producto_id: number;
    tipo_alarma: number;
    fecha: string;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(ALARMA_I_API_BASE_URL);
        const data = await response.json();
        setAlarmaI(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(ALARMA_P_API_BASE_URL);
        const data = await response.json();
        setAlarmaP(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);


  const open = Boolean(anchorEl);

  return (
    <React.Fragment>
      <Box
        component="header"
        sx={{
          borderBottom: '1px solid var(--mui-palette-divider)',
          backgroundColor: 'var(--mui-palette-background-paper)',
          position: 'sticky',
          top: 0,
          zIndex: 'var(--mui-zIndex-appBar)',
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: 'center', justifyContent: 'space-between', minHeight: '64px', px: 2 }}
        >
          <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
            <IconButton
              onClick={(): void => {
                setOpenNav(true);
              }}
              sx={{ display: { lg: 'none' } }}
            >
              <ListIcon />
            </IconButton>
            <Tooltip title="Search">
              <IconButton>
                <MagnifyingGlassIcon />
              </IconButton>
            </Tooltip>
          </Stack>
          <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
            <Tooltip title="Notificaciones">
              <Badge badgeContent={4} color="success" variant="dot">
                <IconButton onClick={handlePopoverOpen}>
                  <BellIcon />
                </IconButton>
              </Badge>
            </Tooltip>
            <Popover
              open={open}
              anchorEl={anchorEl instanceof Element ? anchorEl : null}
              onClose={handlePopoverClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <List sx={{ borderRadius: '8px', borderColor: "#00a3ff" }}>
                {alarmaI.map((alarma, index) => (
                  <ListItem key={index} sx={{ border: '1px solid #ccc', borderRadius: '8px', backgroundColor:"#0051ff"}}>
                    <ListItemText
                      primary={alarma.tipo_alarma === 2 ? 'Sobreabastecimiento' : 'Stockout'}
                      secondary={<AsyncInsumo insumoId={alarma.insumo_id} /> }
                      primaryTypographyProps={{ variant: 'button', color: 'white' }}
                      secondaryTypographyProps={{ variant: 'body2', color: 'white' }}
                      classes={{ root: 'custom-root', primary: 'custom-primary', secondary: 'custom-secondary' }}
                    />
                    <ListItemSecondaryAction sx={{ bottom:"12px", left: '70%' }}>
                      <Button onClick={() => handleDeleteI(index)} size="small">
                        <X size={20} color='white'/>
                        </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                ))}

                {alarmaP.map((alarma, index) => (
                  <ListItem key={index} sx={{ border: '1px solid #ccc', borderRadius: '8px', backgroundColor:"#0051ff"}}>
                    <ListItemText
                      primary={alarma.tipo_alarma === 2 ? 'Sobreabastecimiento' : 'Stockout'}
                      secondary={<AsyncProducto productoId={alarma.producto_id} /> }
                      primaryTypographyProps={{ variant: 'button', color: 'white' }}
                      secondaryTypographyProps={{ variant: 'body2', color: 'white' }}
                      classes={{ root: 'custom-root', primary: 'custom-primary', secondary: 'custom-secondary' }}
                    />
                    <ListItemSecondaryAction sx={{ bottom:"12px", left: '70%' }}>
                      <Button onClick={() => handleDeleteP(index)} size="small">
                        <X size={20} color='white'/>
                        </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                ))}
              </List>
            </Popover>
            <Avatar
              onClick={userPopover.handleOpen}
              ref={userPopover.anchorRef}
              src="/img/logo.png"
              sx={{ cursor: 'pointer' }}
            />
          </Stack>
        </Stack>
      </Box>
      <UserPopover anchorEl={userPopover.anchorRef.current} onClose={userPopover.handleClose} open={userPopover.open} />
      <MobileNav
        onClose={() => {
          setOpenNav(false);
        }}
        open={openNav}
      />
    </React.Fragment>
  );
}
