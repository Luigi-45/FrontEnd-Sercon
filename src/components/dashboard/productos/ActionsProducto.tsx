'use client';
import * as React from 'react';
import { useState, useEffect } from 'react';
import Modal from '@mui/material/Modal';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import FormHelperText from '@mui/material/FormHelperText';
import { Producto } from "@/components/dashboard/productos/productos-table";
import { Limite } from "@/components/dashboard/productos/productos-table";
import { Stack, TextField, Select, MenuItem, InputLabel } from "@mui/material";
import { DateTime } from 'luxon';
import { z, ZodError } from 'zod';
import { SelectChangeEvent, Grid, FormControl } from '@mui/material';


const ALMACEN_API_BASE_URL = "http://localhost:8085/api/almacen";
const PRODUCTO_CATEGORIA_API_BASE_URL = "http://localhost:8084/api/categoria-producto";

const ProductoSchema = z.object({
    nombre: z.string().min(3).max(20).refine(value => /^[a-zA-Z]+$/.test(value), {
        message: 'El nombre debe contener solo letras'
    }),
    descripcion: z.string().min(1).max(50),
    precio_de_venta: z.number().min(0),
    fecha_produccion: z.date(),
    stock: z.number().refine(value => {
        if (typeof value !== 'number' || isNaN(value)) {
            throw new Error('Stock debe ser un número');
        }
        return true;
    }).refine(value => value >= 0 , {
        message: 'Stock debe ser un número mayor a 0'
    }),
    almacen_id: z.number().min(1),
    categoria_producto_id: z.number().min(1),
});

interface Almacen {
    id: number;
    nombre_almacen: string;
    responsable: string;
    ciudad: string;
    direccion: string;
    num_telefonico: number;
    email_contacto: string;
}
interface Categoria {
    id: number;
    nombre: string;
    descripcion: string;
}

export async function handleDeleteProducto(id: number, reloadTable: () => void, notifyD: () => void) {
    const PRODUCTO_DELETE_API_BASE_URL = "http://localhost:8084/api/producto/delete/" + id;
    try {
        const response = await fetch(PRODUCTO_DELETE_API_BASE_URL, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            console.log(`Producto con ID ${id} eliminado exitosamente`);
            notifyD();
            reloadTable();
        } else {
            console.error(`Error al eliminar producto con ID ${id}:`, response);
        }
    } catch (error) {
        console.error(`Error al eliminar producto con ID ${id}:`, error);
    }
}


export interface EditModalProps {
    isOpen: boolean;
    onClose: () => void;
    producto: Producto | null;
    reloadTable: () => void;
    notifyA: () => void;
}

export const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, producto ,reloadTable, notifyA }: { isOpen: boolean, onClose: () => void, producto: Producto | null,  reloadTable: () => void, notifyA: () => void }) => {
    const [almacenes, setAlmacenes] = useState<Almacen[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    

    useEffect(() => {
        const fetchAlmacenes = async () => {
            try {
                const response = await fetch(ALMACEN_API_BASE_URL);
                const data = await response.json();
                setAlmacenes(data);
            } catch (error) {
                console.log(error);
            }
        };
        fetchAlmacenes();
    }, []);

    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const response = await fetch(PRODUCTO_CATEGORIA_API_BASE_URL);
                const data = await response.json();
                setCategorias(data);
            } catch (error) {
                console.log(error);
            }
        };
        fetchCategorias();
    }, []);


    const handleSave = async (id: number) => {
        try {
            const formattedData = {
                ...formData,
                fecha_produccion: formData.fecha_produccion.toISODate()
            };

            const formattedValidate = {
                ...formattedData,
                fecha_produccion: new Date(formattedData.fecha_produccion),
                precio_de_venta: parseFloat(formattedData.precio_de_venta),
                stock: parseFloat(formattedData.stock)
            };

            const validatedData = ProductoSchema.parse(formattedValidate);

            const response = await fetch("http://localhost:8084/api/producto/update/" + id, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formattedData),
            });

            if (response.ok) {
                console.log('Producto actualizado exitosamente');
                notifyA();
                reloadTable();
                onClose();
            } else {
                console.log(formattedData)
                console.error('Error al actualizar el producto:', response.statusText);
            }
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

    const initialFormData = {
        id: 0,
        nombre: '',
        descripcion: '',
        precio_de_venta: "",
        fecha_produccion: DateTime.local(),
        stock: "",
        almacen_id: 1,
        categoria_producto_id: 1,
    };

    const initialLimite = {
        id: 0,
        productoId: 0,
        nombre: "",
        stock: 0,
        limite_stockout: 0,
        limite_sobreabastecimiento: 0,
        efectivo_aproximado: 0,
    };

    const [formData, setFormData] = useState(initialFormData);
    const [limiteData, setLimiteData] = useState(initialLimite);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
        setFormErrors((prevErrors) => ({
            ...prevErrors,
            [name]: '',
        }));
    };

    const handleDateChange = (date: DateTime | null) => {
        setFormData(prevData => ({ ...prevData, fecha_produccion: date ? date : DateTime.local() }));
    };

    const handleSelectChange = (e: SelectChangeEvent<number>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleChangeLimite = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLimiteData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    useEffect(() => {
        if (producto) {
            const fechaProduccion = DateTime.fromISO(producto.fecha_produccion);
            setFormData({
                id: producto.id,
                nombre: producto.nombre,
                descripcion: producto.descripcion,
                precio_de_venta: producto.precio_de_venta.toString(),
                fecha_produccion: fechaProduccion as DateTime<true>,
                stock: producto.stock.toString(),
                almacen_id: producto.almacen_id,
                categoria_producto_id: producto.categoria_producto_id,
            });
        } else {
            setFormData(initialFormData);
        }
    }, [producto]);


    return (
        <Modal open={isOpen} onClose={onClose}>
    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '1rem', borderRadius: '18px' }}>
        <Typography variant="h6" gutterBottom>
            Editar producto
        </Typography>
        <form>
            <Grid container spacing={2}>
                
                <Grid item xs={12} sm={6}>
                    <TextField
                        name="nombre"
                        label="Nombre"
                        variant="outlined"
                        helperText={formErrors.nombre || ""}
                        value={formData.nombre}
                        onChange={handleChange}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        name="descripcion"
                        label="Descripcion"
                        variant="outlined"
                        helperText={formErrors.descripcion || ""}
                        value={formData.descripcion}
                        onChange={handleChange}
                        fullWidth
                    />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                    <TextField
                        name="precio_de_venta"
                        label="Precio de Venta"
                        variant="outlined"
                        helperText={formErrors.precio_de_venta || ""}
                        value={formData.precio_de_venta}
                        onChange={handleChange}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <TextField
                        name="stock"
                        label="Stock"
                        variant="outlined"
                        helperText={formErrors.stock || ""}
                        value={formData.stock}
                        onChange={handleChange}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                    <LocalizationProvider dateAdapter={AdapterLuxon}>
                        <DatePicker
                            name="fecha_produccion"
                            label="Fecha de Produccion"
                            value={formData.fecha_produccion}
                            onChange={handleDateChange}
                            format="dd/MM/yyyy"
                        />
                    </LocalizationProvider>
                    <FormHelperText>{formErrors.fecha_produccion || ""}</FormHelperText>
                    </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                    <InputLabel id="almacen-select-label">Almacenes</InputLabel>
                    <Select
                        name='almacen_id'
                        label="Almacenes"
                        value={formData.almacen_id}
                        onChange={handleSelectChange}
                        fullWidth
                    >
                        {almacenes.map((lista) => (
                            <MenuItem key={lista.id} value={lista.id}>{lista.nombre_almacen}</MenuItem>
                        ))}
                    </Select>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <InputLabel id="categoria-select-label">Categorias</InputLabel>
                    <Select
                        name='categoria_producto_id'
                        label="Categorias"
                        value={formData.categoria_producto_id}
                        onChange={handleSelectChange}
                        fullWidth
                    >
                        {categorias.map((lista) => (
                            <MenuItem key={lista.id} value={lista.id}>{lista.nombre}</MenuItem>
                        ))}
                    </Select>
                </Grid>
            </Grid>
            <Stack direction="row" spacing={2} justifyContent="flex-end" style={{ marginTop: '1rem' }}>
                <Button variant="contained" onClick={() => handleSave(formData.id)}>
                    Actualizar
                </Button>
                <Button variant="contained" onClick={onClose}>
                    Cancelar
                </Button>
            </Stack>
        </form>
    </div>
</Modal>

    );
};