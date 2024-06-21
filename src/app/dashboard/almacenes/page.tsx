'use client';
import * as React from 'react';
import { useRouter } from 'next/router';
import { paths } from '@/paths';
import { useState, useEffect } from 'react';
import { Alert, AlertTitle } from "@mui/material";
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { Upload as UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
import type { Almacen } from '@/components/dashboard/almacenes/almacenes-table';
import AddAlmacenModal from '@/components/dashboard/almacenes/AddAlmacenModal';
import { config } from '@/config';
import { handleDeleteAlmacen } from "@/components/dashboard/almacenes/ActionsAlmacen";
import { AlmacenesFilters } from "@/components/dashboard/almacenes/almacenes-filters";
import { AlmacenesTable } from "@/components/dashboard/almacenes/almacenes-table";
import ToastProvider from "@/components/alerts/ToastProvider";
import { toast } from 'react-toastify';

const ALMACEN_API_BASE_URL = "http://35.198.40.220:8085/api/almacen";

const notify = () => toast.success("Se agregó correctamente");
const notifyD = () => toast.error("Se eliminó correctamente");
const notifyA = () => toast.success("Se actualizó correctamente");

export default function Page(): React.JSX.Element {
  const [almacen, setAlmacen] = useState<Almacen[]>([]);
  const [filteredAlmacen, setFilteredAlmacen] = useState<Almacen[]>([]);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [filterText, setFilterText] = useState<string>('');
  const [openModal, setOpenModal] = useState<boolean>(false);
  const router = useRouter();


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(ALMACEN_API_BASE_URL);
        const data: Almacen[] = await response.json();
        setAlmacen(data);
        setFilteredAlmacen(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const filteredData = almacen.filter((item: Almacen) =>
      item.nombre_almacen.toLowerCase().includes(filterText.toLowerCase())
    );
    setFilteredAlmacen(filteredData);
  }, [filterText, almacen]);

  const paginatedAlmacen = applyPagination(filteredAlmacen, page, rowsPerPage);

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  async function reloadTable() {
    try {
      const response = await fetch(ALMACEN_API_BASE_URL);
      const data: Almacen[] = await response.json();
      setAlmacen(data);
      setFilteredAlmacen(data);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <Stack spacing={3}>
      <ToastProvider>
        <Stack direction="row" spacing={3}>
          <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
            <Typography variant="h4">Lista de Almacenes</Typography>
          </Stack>
          <div>
            {localStorage.getItem('rol') === '2' ? (
              <a href="/home" className="link">Ir a Home</a>
            ) : (
              <Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained" onClick={handleOpenModal}>
                Agregar Almacén
              </Button>
            )}
          </div>
        </Stack>
        <AddAlmacenModal open={openModal} onClose={handleCloseModal} reloadTable={reloadTable} notify={notify} />
        <AlmacenesFilters onFilterChange={setFilterText} filterText={filterText} />
        <AlmacenesTable
          count={almacen.length}
          page={page}
          onPageChange={setPage}
          onRowsPerPageChange={setRowsPerPage}
          onDeleteProducto={handleDeleteAlmacen}
          rows={paginatedAlmacen}
          rowsPerPage={rowsPerPage}
          reloadTable={reloadTable}
          notifyD={notifyD}
          notifyA={notifyA}
        />
      </ToastProvider>
    </Stack>
  );
}

function applyPagination(rows: Almacen[], page: number, rowsPerPage: number): Almacen[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}
