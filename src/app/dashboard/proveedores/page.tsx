'use client';
import * as React from 'react';
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { paths } from '@/paths';
import { logger } from '@/lib/default-logger';
import type { Metadata } from 'next';
import { Alert, AlertTitle } from "@mui/material";
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { Upload as UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
import type { Proveedor } from '@/components/dashboard/proveedores/proveedores-table';
import AddProveedorModal from '@/components/dashboard/proveedores/AddProveedorModal';
import { config } from '@/config';
import { handleDeleteProveedor } from "@/components/dashboard/proveedores/ActionsProveedor";
import { ProveedoresFilters } from '@/components/dashboard/proveedores/proveedores-filters';
import { ProveedoresTable } from "@/components/dashboard/proveedores/proveedores-table";
import  ToastProvider  from "../../../components/alerts/ToastProvider";
import { toast } from 'react-toastify';


const PROVEEDORES_API_BASE_URL = "http://35.198.40.220:8085/api/proveedores";

const notify = () => toast.success("Se agrego correctamente");
const notifyD = () => toast.error("Se elimino correctamente");
const notifyA = () => toast.success("Se actualizo correctamente");


export default function Page(): React.JSX.Element {
  const router = useRouter();
  const [proveedor, setProveedor] = useState([]);
  const [filteredProveedor, setFilteredProveedor] = useState<Proveedor[]>([]);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [filterText, setFilterText] = useState<string>('');
  const [openModal, setOpenModal] = useState(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    const checkPermissions = async () => {
      const rol = localStorage.getItem('rol');
      if (rol !== '1') {
        logger.debug('[Page]: Usuario no tiene el rol de validador, redirigiendo');
        router.replace(paths.dashboard.customers); 
        return;
      }
      setIsChecking(false);
    };

    checkPermissions().catch(() => {
    });
  }, [router]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(PROVEEDORES_API_BASE_URL);
        const data = await response.json();
        setProveedor(data);
        setFilteredProveedor(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {

    const filteredData = proveedor.filter((item: Proveedor) =>
      item.nombre_empresa.toLowerCase().includes(filterText.toLowerCase())
    );
    setFilteredProveedor(filteredData);
  }, [filterText, proveedor]);


  const paginatedProductos = applyPagination(filteredProveedor, page, rowsPerPage);

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  async function reloadTable() {
    try {
      const response = await fetch(PROVEEDORES_API_BASE_URL);
      const data = await response.json();
      setProveedor(data);
      setFilteredProveedor(data);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <Stack spacing={3}>
      <ToastProvider >
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Lista de Proveedores</Typography>
        </Stack>
        <div>
          <Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained" onClick={handleOpenModal}>
            Agregar Proveedor
          </Button>
        </div>
      </Stack>
      <AddProveedorModal open={openModal} onClose={handleCloseModal} reloadTable={reloadTable} notify={notify}/>
      <ProveedoresFilters onFilterChange={setFilterText} filterText={filterText} />
      <ProveedoresTable
        count={proveedor.length}
        page={page}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        onDeleteProveedor={handleDeleteProveedor}
        rows={paginatedProductos}
        rowsPerPage={rowsPerPage}
        reloadTable={reloadTable}
        notifyD={notifyD}
        notifyA={notifyA}
      />
      </ToastProvider>
    </Stack>
  );
}

function applyPagination(rows: Proveedor[], page: number, rowsPerPage: number): Proveedor[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}
