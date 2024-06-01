'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';
import Button from '@mui/material/Button';
import { EditModal } from '@/components/dashboard/productos/ActionsProducto';
import { OpcionModal } from '@/components/dashboard/productos/ModifyLimits';

import { useSelection } from '@/hooks/use-selection';

const LIMITE_CATEGORIA_API_BASE_URL = "http://localhost:8084/api/limite-producto/findByProductoId/";

function noop(): void {
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio_de_venta: number;
  fecha_produccion: string;
  stock: number;
  almacen_id: number;
  categoria_producto_id: number;
}
export interface Limite {
  id: number;
  productoId: number;
  nombre: string;
  stock: number;
  limite_stockout: number;
  limite_sobreabastecimiento: number;
  efectivo_aproximado: number;
}

interface ProductosTableProps {
  count?: number;
  page?: number;
  onPageChange?: (page: number) => void;
  onDeleteProducto?: (id: number, reload: () => void, notifyD: () => void) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  reloadTable?: () => void;
  notifyD?: () => void;
  notifyA?: () => void;
  rows?: Producto[];
  rowsPerPage?: number;
}

export function ProductosTable({
  count = 0,
  rows = [],
  page = 0,
  onPageChange = noop,
  reloadTable = noop,
  notifyD = noop,
  notifyA = noop,
  onDeleteProducto = noop,
  rowsPerPage = 0,
  onRowsPerPageChange = noop,
}: ProductosTableProps): React.JSX.Element {
  const rowIds = React.useMemo(() => {
    return rows.map((producto) => producto.id);
  }, [rows]);

  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);

  const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < rows.length;
  const selectedAll = rows.length > 0 && selected?.size === rows.length;

  const [selectedproducto, setSelectedproducto] = React.useState<Producto | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isOpcionModalOpen, setIsOpcionModalOpen] = React.useState(false);
  const [selectedlimite, setSelectedLimite] = useState<Limite | null>(null);

  const handleEditClick = async (producto: Producto) => {
    setIsEditModalOpen(true);
    setSelectedproducto(producto);
  };

  const handleModifyClick = async (id: number) => {
    setIsOpcionModalOpen(true);
    const response = await fetch(LIMITE_CATEGORIA_API_BASE_URL +id, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    setSelectedLimite(data);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedproducto(null);
  };

  const handleCloseOpcionModal = () => {
    setIsOpcionModalOpen(false);
    setSelectedLimite(null);
  };

  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedAll}
                  indeterminate={selectedSome}
                  onChange={(event) => {
                    if (event.target.checked) {
                      selectAll();
                    } else {
                      deselectAll();
                    }
                  }}
                />
              </TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripcion</TableCell>
              <TableCell>Precio de Venta</TableCell>
              <TableCell>Fecha de produccion</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((producto) => {
              const isSelected = selected?.has(producto.id);

              return (
                <TableRow hover key={producto.id} selected={isSelected}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={(event) => {
                        if (event.target.checked) {
                          selectOne(producto.id);
                        } else {
                          deselectOne(producto.id);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
                      <Typography variant="subtitle2">{producto.nombre}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{producto.descripcion}</TableCell>
                  <TableCell>
                    {producto.precio_de_venta}
                  </TableCell>
                  <TableCell>{dayjs(producto.fecha_produccion).format('MMM D, YYYY')}</TableCell>
                  <TableCell>{producto.stock}</TableCell>
                  <TableCell align="center">
                    <Grid container direction="column" alignItems="center">
                      <Grid item>
                        <Box sx={{ '& > *': { marginBottom: 1 } }}>
                          <Grid container justifyContent="center">
                            <Button variant="contained" color="primary" onClick={() => handleEditClick(producto)}>
                              Editar
                            </Button>
                            <Box sx={{ width: 16 }} />
                            <Button variant="contained" color="secondary" onClick={() => onDeleteProducto(producto.id, reloadTable, notifyD)}>
                              Eliminar
                            </Button>
                          </Grid>
                        </Box>
                      </Grid>
                      <Grid item>
                        <Button variant="contained" color="warning" onClick={() => handleModifyClick(producto.id)}>
                          Configuracion
                        </Button>
                      </Grid>
                    </Grid>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
      <EditModal isOpen={isEditModalOpen} onClose={handleCloseEditModal} producto={selectedproducto} reloadTable={reloadTable} notifyA={notifyA} />
      <OpcionModal isOpen={isOpcionModalOpen} onClose={handleCloseOpcionModal} limite={selectedlimite} notifyA={notifyA} />
      <Divider />
      <TablePagination
        component="div"
        count={count}
        onPageChange={(event, newPage) => onPageChange(newPage)}
        onRowsPerPageChange={(event) => onRowsPerPageChange(parseInt(event.target.value, 10))}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Card>
  );
}
