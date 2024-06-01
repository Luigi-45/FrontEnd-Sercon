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
import Button from '@mui/material/Button';
import { EditModal } from '@/components/dashboard/proveedores/ActionsProveedor';

import { useSelection } from '@/hooks/use-selection';

function noop(): void {
}

export interface Proveedor {
  id: number;
  nombre_empresa: string;
  nombre_contacto: string;
  ruc: number;
  descripcion: string;
  ciudad: string;
  direccion: string;
  num_telefonico: number;
  email_contacto: string;
}

interface ProveedoresTableProps {
  count?: number;
  page?: number;
  onPageChange?: (page: number) => void;
  onDeleteProveedor?: (id: number, reload: () => void, notifyD: () => void) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  reloadTable?: () => void;
  notifyD?: () => void;
  notifyA?: () => void;
  rows?: Proveedor[];
  rowsPerPage?: number;
}

export function ProveedoresTable({
  count = 0,
  rows = [],
  page = 0,
  onPageChange= noop,
  reloadTable= noop,
  notifyD= noop,
  notifyA= noop,
  onDeleteProveedor= noop,
  rowsPerPage = 0,
  onRowsPerPageChange = noop,
}: ProveedoresTableProps): React.JSX.Element {
  const rowIds = React.useMemo(() => {
    return rows.map((proveedor) => proveedor.id);
  }, [rows]);

  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);

  const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < rows.length;
  const selectedAll = rows.length > 0 && selected?.size === rows.length;

  const [selectedproveedor, setSelectedproveedor] = React.useState<Proveedor | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

  const handleEditClick = (proveedor: Proveedor) => {
    setIsEditModalOpen(true);
    setSelectedproveedor(proveedor);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedproveedor(null);
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
              <TableCell>Nombre Empresa</TableCell>
              <TableCell>Nombre Contacto</TableCell>
              <TableCell>RUC</TableCell>
              <TableCell>Descripcion</TableCell>
              <TableCell>Ciudad</TableCell>
              <TableCell>Direccion</TableCell>
              <TableCell>Numero Telefonico</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((proveedor) => {
              const isSelected = selected?.has(proveedor.id);

              return (
                <TableRow hover key={proveedor.id} selected={isSelected}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={(event) => {
                        if (event.target.checked) {
                          selectOne(proveedor.id);
                        } else {
                          deselectOne(proveedor.id);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
                      <Typography variant="subtitle2">{proveedor.nombre_empresa}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{proveedor.nombre_contacto}</TableCell>
                  <TableCell>
                    {proveedor.ruc}
                  </TableCell>
                  <TableCell>{proveedor.descripcion}</TableCell>
                  <TableCell>{proveedor.ciudad}</TableCell>
                  <TableCell>{proveedor.direccion}</TableCell>
                  <TableCell>{proveedor.num_telefonico}</TableCell>
                  <TableCell>{proveedor.email_contacto}</TableCell>
                  <TableCell>
                    <Box sx={{ '& > *': { marginRight: 1 } }}>
                      <Button variant="contained" color="primary" onClick={() => handleEditClick(proveedor)} >
                        Editar
                      </Button>
                      <Button variant="contained" color="secondary" onClick={() => onDeleteProveedor(proveedor.id, reloadTable, notifyD)}>
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
      <EditModal isOpen={isEditModalOpen} onClose={handleCloseEditModal} proveedor={selectedproveedor} reloadTable={reloadTable} notifyA={notifyA}/>
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
