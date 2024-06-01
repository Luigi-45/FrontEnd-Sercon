'use client';
import * as React from 'react';
import { useState, useEffect } from "react";
import { Modal, Box, Typography, TextField, Button, Alert, AlertTitle, Stack } from "@mui/material";
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { Upload as UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
import { Producto } from '@/components/dashboard/productos/productos-table';
import AddProductoModal from '@/components/dashboard/productos/AddProductoModal';
import { config } from '@/config';
import { handleDeleteProducto } from "@/components/dashboard/productos/ActionsProducto";
import { ProductosFilters } from '@/components/dashboard/productos/productos-filters';
import { ProductosTable } from "@/components/dashboard/productos/productos-table";
import ToastProvider from "../../../components/alerts/ToastProvider";
import { toast } from 'react-toastify';
import { z, ZodError } from 'zod';

const PRODUCTO_API_BASE_URL = "http://localhost:8084/api/producto";

const notify = () => toast.success("Se agregó correctamente");
const notifyD = () => toast.error("Se eliminó correctamente");
const notifyA = () => toast.success("Se actualizó correctamente");


interface NombreModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (nombre: string) => void;
}

const NombreModal: React.FC<NombreModalProps> = ({ open, onClose, onSubmit }) => {
  const [nombre, setNombre] = useState<string>('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const NombreSchema = z.object({
    nombre: z.string().max(20).refine(value => /^[a-zA-Z]+$/.test(value), {
        message: 'El nombre debe contener solo letras sin espcacios en blanco'
    }),
  });

  const handleSubmit = () => {
    try {
      const validatedData = NombreSchema.parse({nombre});
      onSubmit(nombre);
      onClose();
    } catch (error) {
      if (error instanceof ZodError) {
        console.error('Error de validación:', error.errors);
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
            if (err.path) {
                switch (err.code) {
                    case 'too_small':
                        fieldErrors[err.path.join('.')] = 'El valor es demasiado pequeño.';
                        break;
                    case 'too_big':
                        fieldErrors[err.path.join('.')] = 'El valor es demasiado grande.';
                        break;
                    case 'invalid_type':
                        fieldErrors[err.path.join('.')] = 'El tipo de dato es inválido.';
                        break;
                    // Agrega más casos según sea necesario para otras validaciones
                    default:
                        fieldErrors[err.path.join('.')] = err.message;
                        break;
                }
            }
        });
        setFormErrors(fieldErrors);
    } else {
        console.error('Error inesperado:', error);
    }
    }
    
  };

  const handleNombreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setNombre(value);
    setFormErrors({});
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box
        sx={{
          position: 'absolute' as 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography id="modal-title" variant="h6" component="h2">
          Ingresar Nombre
        </Typography>
        <TextField
          fullWidth
          id="nombre"
          label="Nombre"
          variant="outlined"
          helperText={formErrors.nombre || ""}
          value={nombre}
          onChange={handleNombreChange}
          margin="normal"
        />
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Enviar
        </Button>
      </Box>
    </Modal>
  );
};

interface FechaModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (fechaInicio: Date, fechaFin: Date) => void;
}

const FechaModal: React.FC<FechaModalProps> = ({ open, onClose, onSubmit }) => {
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
  const [fechaFin, setFechaFin] = useState<Date | null>(null);

  const handleSubmit = () => {
    if (fechaInicio && fechaFin) {
      onSubmit(fechaInicio, fechaFin);
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box
        sx={{
          position: 'absolute' as 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography id="modal-title" variant="h6" component="h2">
          Seleccionar Fechas
        </Typography>
        <TextField
          fullWidth
          id="fecha-inicio-input"
          label="Fecha de Inicio"
          type="date"
          variant="outlined"
          value={fechaInicio ? fechaInicio.toISOString().split('T')[0] : ''}
          onChange={(e) => setFechaInicio(new Date(e.target.value))}
          margin="normal"
          InputLabelProps={{
            shrink: true,
          }}
        />
        <TextField
          fullWidth
          id="fecha-fin-input"
          label="Fecha de Fin"
          type="date"
          variant="outlined"
          value={fechaFin ? fechaFin.toISOString().split('T')[0] : ''}
          onChange={(e) => setFechaFin(new Date(e.target.value))}
          margin="normal"
          InputLabelProps={{
            shrink: true,
          }}
        />
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Enviar
        </Button>
      </Box>
    </Modal>
  );
};

export default function Page(): React.JSX.Element {
  const [producto, setProducto] = useState([]);
  const [filteredProducto, setFilteredProducto] = useState<Producto[]>([]);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [filterText, setFilterText] = useState<string>('');
  const [openModal, setOpenModal] = useState(false);
  const [openNombreModal, setOpenNombreModal] = useState(false);
  const [openFechaModal, setOpenFechaModal] = useState<boolean>(false);
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(PRODUCTO_API_BASE_URL);
        const data = await response.json();
        setProducto(data);
        setFilteredProducto(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const filteredData = producto.filter((item: Producto) =>
      item.nombre.toLowerCase().includes(filterText.toLowerCase())
    );
    setFilteredProducto(filteredData);
  }, [filterText, producto]);

  const paginatedProductos = applyPagination(filteredProducto, page, rowsPerPage);

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  async function reloadTable() {
    try {
      const response = await fetch(PRODUCTO_API_BASE_URL);
      const data = await response.json();
      setProducto(data);
      setFilteredProducto(data);
    } catch (error) {
      console.log(error);
    }
  }

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:8084/api/report/general', {
        method: 'GET',
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Reporte-General-Productos';
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        console.error('Error al obtener el archivo:', response);
      }
    } catch (error) {
      console.error('Error de red:', error);
    }
  };

  const handleButtonClick = () => {
    fetchData();
  };

  const fetchDataSO = async () => {
    try {
      const response = await fetch('http://localhost:8084/api/report/stockout', {
        method: 'GET',
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Reporte-Stockout-Productos';
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        console.error('Error al obtener el archivo:', response);
      }
    } catch (error) {
      console.error('Error de red:', error);
    }
  };

  const handleButtonSOClick = () => {
    fetchDataSO();
  };

  const fetchDataSA = async () => {
    try {
      const response = await fetch('http://localhost:8084/api/report/sobreabastecimiento', {
        method: 'GET',
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Reporte-Sobreabastecimiento-Productos';
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        console.error('Error al obtener el archivo:', response);
      }
    } catch (error) {
      console.error('Error de red:', error);
    }
  };

  const handleButtonSAClick = () => {
    fetchDataSA();
  };

  const fetchDataRotacion = async () => {
    try {
      const response = await fetch('http://localhost:8084/api/report/movimiento', {
        method: 'GET',
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Reporte-Rotacion';
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        console.error('Error al obtener el archivo:', response);
      }
    } catch (error) {
      console.error('Error de red:', error);
    }
  };

  const handleButtonRotacionClick = () => {
    fetchDataRotacion();
  };

  const fetchDataNombre = async (nombre: string): Promise<void> => {
    try {
      const response = await fetch(`http://localhost:8084/api/report/nombre?nombre=${encodeURIComponent(nombre)}`, {
        method: 'GET',
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Reporte por Nombre';
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        console.error('Error al obtener el archivo:', response);
      }
    } catch (error) {
      
    }
  };

  const handleButtonNombreClick = () => {
    setOpenNombreModal(true);
  };

  const handleCloseNombreClick = () => {
    setOpenNombreModal(false);
  };

  const handleNombreSubmit = (nombre: string) => {
    fetchDataNombre(nombre);
  };

  const handleFechaSubmit = (fechaInicio: Date, fechaFin: Date) => {
    fetchDataFecha(fechaInicio,fechaFin);
  };

  const fetchDataFecha = async (fechaInicio: Date, fechaFin: Date) => {
    try {
      const url = new URL('http://localhost:8084/api/report/fecha');
      url.searchParams.append('fechaInicio', fechaInicio.toISOString());
      url.searchParams.append('fechaFin', fechaFin.toISOString());
  
      const response = await fetch(url.toString(), {
        method: 'GET',
      });
  
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Reporte por Fecha';
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        console.error('Error al obtener el archivo:', response);
      }
    } catch (error) {
      console.error('Error de red:', error);
    }
  };
  

  const handleButtonFechaClick = () => {
    setOpenFechaModal(true);
  };

  return (
    <Stack spacing={3}>
      <ToastProvider>
        <Stack direction="row" spacing={3}>
          <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
            <Typography variant="h4">Lista de Productos</Typography>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Button color="inherit" startIcon={<UploadIcon fontSize="var(--icon-fontSize-md)" />} onClick={handleButtonClick}>
                Estado General
              </Button>
              <Button color="inherit" startIcon={<UploadIcon fontSize="var(--icon-fontSize-md)" />} onClick={handleButtonNombreClick}>
                Estado por Nombre
              </Button>
              <Button color="inherit" startIcon={<UploadIcon fontSize="var(--icon-fontSize-md)" />} onClick={handleButtonFechaClick}>
                Estado por Fecha
              </Button>
              <Button color="inherit" startIcon={<UploadIcon fontSize="var(--icon-fontSize-md)" />} onClick={handleButtonSOClick}>
                Alertas Stockout
              </Button>
              <Button color="inherit" startIcon={<UploadIcon fontSize="var(--icon-fontSize-md)" />} onClick={handleButtonSAClick}>
                Alertas Sobreabastecimiento
              </Button>
              <Button color="inherit" startIcon={<UploadIcon fontSize="var(--icon-fontSize-md)" />} onClick={handleButtonRotacionClick}>
                Rotación
              </Button>
            </Stack>
          </Stack>
          <div>
            <Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained" onClick={handleOpenModal}>
              Agregar Producto
            </Button>
          </div>
        </Stack>
        <AddProductoModal open={openModal} onClose={handleCloseModal} reloadTable={reloadTable} notify={notify} />
        <ProductosFilters onFilterChange={setFilterText} filterText={filterText} />
        <ProductosTable
          count={producto.length}
          page={page}
          onPageChange={setPage}
          onRowsPerPageChange={setRowsPerPage}
          onDeleteProducto={handleDeleteProducto}
          rows={paginatedProductos}
          rowsPerPage={rowsPerPage}
          reloadTable={reloadTable}
          notifyD={notifyD}
          notifyA={notifyA}
        />
        <NombreModal open={openNombreModal} onClose={handleCloseNombreClick} onSubmit={handleNombreSubmit}  />
        <FechaModal open={openFechaModal} onClose={() => setOpenFechaModal(false)} onSubmit={handleFechaSubmit} />
      </ToastProvider>
    </Stack>
  );
}

function applyPagination(rows: Producto[], page: number, rowsPerPage: number): Producto[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}
