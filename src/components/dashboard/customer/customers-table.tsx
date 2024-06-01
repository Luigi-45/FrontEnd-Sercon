'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import { useState } from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
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
import { EditModal } from './DeleteInsumo';
import { OpcionModal } from '@/components/dashboard/customer/ModifyLimits';

import { useSelection } from '@/hooks/use-selection';

const LIMITE_CATEGORIA_API_BASE_URL = "http://localhost:8083/api/limite-insumo/findByInsumoId/";

function noop(): void {
}

export interface Insumo {
  id: number;
  nombre: string;
  descripcion: string;
  costo_de_compra: number;
  unidad_medida: string;
  fecha_adquisicion: string;
  stock: number;
  proveedor_id: number;
  almacen_id: number;
  categoria_insumo_id: number;
}

export interface Limite {
  id: number;
  insumoId: number;
  nombre: string;
  stock: number;
  limite_stockout: number;
  limite_sobreabastecimiento: number;
  costo: number;
}

interface CustomersTableProps {
  count?: number;
  page?: number;
  onPageChange?: (page: number) => void;
  onDeleteInsumo?: (id: number, reload: () => void, notifyD: () => void) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  reloadTable?: () => void;
  notifyD?: () => void;
  notifyA?: () => void;
  rows?: Insumo[];
  rowsPerPage?: number;
}

export function CustomersTable({
  count = 0,
  rows = [],
  page = 0,
  onPageChange = noop,
  reloadTable = noop,
  notifyD = noop,
  notifyA = noop,
  onDeleteInsumo = noop,
  rowsPerPage = 0,
  onRowsPerPageChange = noop,
}: CustomersTableProps): React.JSX.Element {
  const rowIds = React.useMemo(() => {
    return rows.map((insumo) => insumo.id);
  }, [rows]);

  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);

  const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < rows.length;
  const selectedAll = rows.length > 0 && selected?.size === rows.length;

  const [selectedInsumo, setSelectedInsumo] = React.useState<Insumo | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isOpcionModalOpen, setIsOpcionModalOpen] = React.useState(false);
  const [selectedlimite, setSelectedLimite] = useState<Limite | null>(null);

  const handleEditClick = async (insumo: Insumo) => {
    setIsEditModalOpen(true);
    setSelectedInsumo(insumo);
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
    setSelectedInsumo(null);
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
              <TableCell>Costo</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Unidad de medida</TableCell>
              <TableCell>Fecha de adquisicion</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((insumo) => {
              const isSelected = selected?.has(insumo.id);

              return (
                <TableRow hover key={insumo.id} selected={isSelected}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={(event) => {
                        if (event.target.checked) {
                          selectOne(insumo.id);
                        } else {
                          deselectOne(insumo.id);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
                      <Typography variant="subtitle2">{insumo.nombre}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{insumo.descripcion}</TableCell>
                  <TableCell>
                    {insumo.costo_de_compra}
                  </TableCell>
                  <TableCell>{insumo.stock}</TableCell>
                  <TableCell>{insumo.unidad_medida}</TableCell>
                  <TableCell>{dayjs(insumo.fecha_adquisicion).format('MMM D, YYYY')}</TableCell>
                  <TableCell align="center">
                    <Grid container direction="column" alignItems="center">
                      <Grid item>
                        <Box sx={{ '& > *': { marginBottom: 1 } }}>
                          <Grid container justifyContent="center">
                            <Button variant="contained" color="primary" onClick={() => handleEditClick(insumo)}>
                              Editar
                            </Button>
                            <Box sx={{ width: 16, gap: 2 }} />
                            <Button variant="contained" color="secondary" onClick={() => onDeleteInsumo(insumo.id, reloadTable, notifyD)}>
                              Eliminar
                            </Button>
                          </Grid>
                        </Box>
                      </Grid>
                      <Grid item>
                        <Button variant="contained" color="warning" onClick={() => handleModifyClick(insumo.id)}>
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
      <EditModal isOpen={isEditModalOpen} onClose={handleCloseEditModal} insumo={selectedInsumo} reloadTable={reloadTable} notifyA={notifyA} />
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
