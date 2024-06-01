'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
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
import { EditModal } from '@/components/dashboard/almacenes/ActionsAlmacen';

import { useSelection } from '@/hooks/use-selection';

function noop(): void {
}

export interface Almacen {
  id: number;
  nombre_almacen: string;
  responsable: string;
  ciudad: string;
  direccion: string;
  num_telefonico: number;
  email_contacto: string;
}

interface AlmacenesTableProps {
  count?: number;
  page?: number;
  onPageChange?: (page: number) => void;
  onDeleteProducto?: (id: number, reload: () => void, notifyD: () => void) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  reloadTable?: () => void;
  notifyD?: () => void;
  notifyA?: () => void;
  rows?: Almacen[];
  rowsPerPage?: number;
}

export function AlmacenesTable({
  count = 0,
  rows = [],
  page = 0,
  onPageChange= noop,
  reloadTable= noop,
  notifyD= noop,
  notifyA= noop,
  onDeleteProducto= noop,
  rowsPerPage = 0,
  onRowsPerPageChange = noop,
}: AlmacenesTableProps): React.JSX.Element {
  const rowIds = React.useMemo(() => {
    return rows.map((almacen) => almacen.id);
  }, [rows]);

  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);

  const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < rows.length;
  const selectedAll = rows.length > 0 && selected?.size === rows.length;

  const [selectedalmacen, setSelectedalmacen] = React.useState<Almacen | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

  const handleEditClick = (almacen: Almacen) => {
    setIsEditModalOpen(true);
    setSelectedalmacen(almacen);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedalmacen(null);
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
              <TableCell>Responsable</TableCell>
              <TableCell>Ciudad</TableCell>
              <TableCell>Direccion</TableCell>
              <TableCell>Numero telefonico</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((almacen) => {
              const isSelected = selected?.has(almacen.id);

              return (
                <TableRow hover key={almacen.id} selected={isSelected}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={(event) => {
                        if (event.target.checked) {
                          selectOne(almacen.id);
                        } else {
                          deselectOne(almacen.id);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
                      <Typography variant="subtitle2">{almacen.nombre_almacen}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{almacen.responsable}</TableCell>
                  <TableCell>
                    {almacen.ciudad}
                  </TableCell>
                  <TableCell>{almacen.direccion}</TableCell>
                  <TableCell>{almacen.num_telefonico}</TableCell>
                  <TableCell>{almacen.email_contacto}</TableCell>
                  <TableCell>
                    <Box sx={{ '& > *': { marginRight: 1 } }}>
                      <Button variant="contained" color="primary" onClick={() => handleEditClick(almacen)} >
                        Editar
                      </Button>
                      <Button variant="contained" color="secondary" onClick={() => onDeleteProducto(almacen.id, reloadTable,notifyD)}>
                        Eliminar
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
      <EditModal isOpen={isEditModalOpen} onClose={handleCloseEditModal} almacen={selectedalmacen} reloadTable={reloadTable} notifyA={notifyA}/>
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
