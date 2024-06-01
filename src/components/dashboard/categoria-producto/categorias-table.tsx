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
import { EditModal } from '@/components/dashboard/categoria-producto/ActionsCategoria';

import { useSelection } from '@/hooks/use-selection';

function noop(): void {
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
}

interface CategoriasTableProps {
  count?: number;
  page?: number;
  onPageChange?: (page: number) => void;
  onDeleteProducto?: (id: number, reload: () => void, notifyD: () => void) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  reloadTable?: () => void;
  notifyD?: () => void;
  notifyA?: () => void;
  rows?: Categoria[];
  rowsPerPage?: number;
}

export function CategoriasTable({
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
}: CategoriasTableProps): React.JSX.Element {
  const rowIds = React.useMemo(() => {
    return rows.map((categoria) => categoria.id);
  }, [rows]);

  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);

  const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < rows.length;
  const selectedAll = rows.length > 0 && selected?.size === rows.length;

  const [selectedcategoria, setSelectedcategoria] = React.useState<Categoria | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

  const handleEditClick = (categoria: Categoria) => {
    setIsEditModalOpen(true);
    setSelectedcategoria(categoria);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedcategoria(null);
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
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((categoria) => {
              const isSelected = selected?.has(categoria.id);

              return (
                <TableRow hover key={categoria.id} selected={isSelected}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={(event) => {
                        if (event.target.checked) {
                          selectOne(categoria.id);
                        } else {
                          deselectOne(categoria.id);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
                      <Typography variant="subtitle2">{categoria.nombre}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{categoria.descripcion}</TableCell>
                  <TableCell>
                    <Box sx={{ '& > *': { marginRight: 1 } }}>
                      <Button variant="contained" color="primary" onClick={() => handleEditClick(categoria)} >
                        Editar
                      </Button>
                      <Button variant="contained" color="secondary" onClick={() => onDeleteProducto(categoria.id, reloadTable,notifyD)}>
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
      <EditModal isOpen={isEditModalOpen} onClose={handleCloseEditModal} categoria={selectedcategoria} reloadTable={reloadTable} notifyA={notifyA}/>
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