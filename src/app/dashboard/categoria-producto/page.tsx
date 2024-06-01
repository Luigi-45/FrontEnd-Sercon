'use client';
import * as React from 'react';
import { useState, useEffect } from "react";
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { Upload as UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
import type { Categoria } from '@/components/dashboard/categoria-producto/categorias-table';
import AddCategoriaModal from '@/components/dashboard/categoria-producto/AddCategoriaModal';
import { config } from '@/config';
import { handleDeleteCategoria } from "@/components/dashboard/categoria-producto/ActionsCategoria";
import { CategoriasFilters } from '@/components/dashboard/categoria-producto/categorias-filters';
import { CategoriasTable } from "@/components/dashboard/categoria-producto/categorias-table";
import  ToastProvider  from "../../../components/alerts/ToastProvider";
import { toast } from 'react-toastify';


const CATEGORIA_API_BASE_URL = "http://localhost:8084/api/categoria-producto";

const notify = () => toast.success("Se agrego correctamente");
const notifyD = () => toast.error("Se elimino correctamente");
const notifyA = () => toast.success("Se actualizo correctamente");


export default function Page(): React.JSX.Element {
  const [categoria, setCategoria] = useState([]);
  const [filteredCategoria, setFilteredCategoria] = useState<Categoria[]>([]);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [filterText, setFilterText] = useState<string>('');
  const [openModal, setOpenModal] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(CATEGORIA_API_BASE_URL);
        const data = await response.json();
        setCategoria(data);
        setFilteredCategoria(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {

    const filteredData = categoria.filter((item: Categoria) =>
      item.nombre.toLowerCase().includes(filterText.toLowerCase())
    );
    setFilteredCategoria(filteredData);
  }, [filterText, categoria]);


  const paginatedAlmacen = applyPagination(filteredCategoria, page, rowsPerPage);

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  async function reloadTable() {
    try {
      const response = await fetch(CATEGORIA_API_BASE_URL);
      const data = await response.json();
      setCategoria(data);
      setFilteredCategoria(data);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <Stack spacing={3}>
      <ToastProvider >
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Lista de Categorias Productos</Typography>
        </Stack>
        <div>
          <Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained" onClick={handleOpenModal}>
            Agregar Categoria
          </Button>
        </div>
      </Stack>
      <AddCategoriaModal open={openModal} onClose={handleCloseModal} reloadTable={reloadTable} notify={notify}/>
      <CategoriasFilters onFilterChange={setFilterText} filterText={filterText} />
      <CategoriasTable
        count={categoria.length}
        page={page}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        onDeleteProducto={handleDeleteCategoria}
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

function applyPagination(rows: Categoria[], page: number, rowsPerPage: number): Categoria[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}
