'use client';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { Modal, TextField, Button, Typography, Stack, Select, MenuItem, InputLabel, Alert, AlertTitle } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DateTime } from 'luxon';
import { z, ZodError } from 'zod';
import FormHelperText from '@mui/material/FormHelperText';
import { SelectChangeEvent, Grid, FormControl } from '@mui/material';

const PRODUCTO_SAVE_API_BASE_URL = "http://localhost:8084/api/producto/save";
const ALMACEN_API_BASE_URL = "http://localhost:8085/api/almacen";
const PRODUCTO_CATEGORIA_API_BASE_URL = "http://localhost:8084/api/categoria-producto";
const LIMITE_PRODUCTO_SAVE_API_BASE_URL = "http://localhost:8084/api/limite-producto/save";

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
    }).refine(value => value >= 0 && value <= 100, {
        message: 'Stock debe ser un número entre 0 y 100'
    }),
    almacen_id: z.number().min(1),
    categoria_producto_id: z.number().min(1),
    limite_stockout: z.number().refine(value => {
        if (typeof value !== 'number' || isNaN(value)) {
            throw new Error('Limite debe ser un número');
        }
        return true;
    }).refine(value => value > 0 , {
        message: 'Limite debe ser un número mayor a 0'
    }),
    limite_sobreabastecimiento: z.number().refine(value => {
        if (typeof value !== 'number' || isNaN(value)) {
            throw new Error('Limite debe ser un número');
        }
        return true;
    }).refine(value => value > 0 , {
        message: 'Limite debe ser un número mayor a 0'
    })
});

export default function AddProductoModal({ open, onClose, reloadTable, notify }: { open: boolean, onClose: () => void, reloadTable: () => void, notify: () => void }) {
    const initialFormData = {
        nombre: '',
        descripcion: '',
        precio_de_venta: "",
        fecha_produccion: DateTime.local(),
        stock: "",
        almacen_id: 1,
        categoria_producto_id: 1,
    };

    const initialLimite = {
        productoId: 0,
        nombre: "",
        stock: 0,
        limite_stockout: "",
        limite_sobreabastecimiento: "",
        efectivo_aproximado: 0,
    };

    const [formData, setFormData] = useState(initialFormData);
    const [limiteData, setLimiteData] = useState(initialLimite);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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

    const [almacenes, setAlmacenes] = useState<Almacen[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);

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

    const handleChangeLimite = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLimiteData((prevData) => ({
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

    const handleSubmit = async () => {
        try {
            const formattedData = {
                ...formData,
                nombre: formData.nombre.trim(),
                fecha_produccion: formData.fecha_produccion.toISODate()
            };

            const formattedValidate = {
                ...formattedData,
                fecha_produccion: new Date(formattedData.fecha_produccion),
                precio_de_venta: parseFloat(formattedData.precio_de_venta),
                stock: parseFloat(formattedData.stock)
            };

            const initialFormDataWithLimite = {
                ...formattedValidate,
                limite_stockout: parseFloat(limiteData.limite_stockout),
                limite_sobreabastecimiento: parseFloat(limiteData.limite_sobreabastecimiento),
            };
            

            const validatedData = ProductoSchema.parse(initialFormDataWithLimite);

            const response = await fetch(PRODUCTO_SAVE_API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formattedData),
            });
            if (response.ok) {
                const data = await response.json();
                limiteData.productoId =data.id;
                const formattedLimite = {
                    ...limiteData,
                    stock: data.stock,
                    nombre: data.nombre,
                    efectivo_aproximado: data.precio_de_venta*data.stock,
                };
                const responseL = await fetch(LIMITE_PRODUCTO_SAVE_API_BASE_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formattedLimite),
                });
                reloadTable();
                setFormData(initialFormData);
                notify();
                setLimiteData(initialLimite);
                onClose();
            } else {
                console.error('Error al agregar:', response);
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

    return (
        <Modal open={open} onClose={onClose}>
    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '1rem', borderRadius: '18px' }}>
        <Typography variant="h6" gutterBottom>
            Agregar Producto
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
                {/* Segunda fila */}
                <Grid item xs={12} sm={3}>
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
                <Grid item xs={12} sm={3}>
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
                <Grid item xs={12} sm={3}>
                    <TextField
                        name="limite_stockout"
                        label="Limite Stockout"
                        variant="outlined"
                        helperText={formErrors.limite_stockout || ""}
                        value={limiteData.limite_stockout}
                        onChange={handleChangeLimite}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12} sm={3}>
                    <TextField
                        name="limite_sobreabastecimiento"
                        label="Limite Sobreabastecimiento"
                        variant="outlined"
                        helperText={formErrors.limite_sobreabastecimiento || ""}
                        value={limiteData.limite_sobreabastecimiento}
                        onChange={handleChangeLimite}
                        fullWidth
                    />
                </Grid>
                
                <Grid item xs={12} sm={4} sx={{ marginTop: 3 }}>
                    <FormControl fullWidth>
                    <LocalizationProvider dateAdapter={AdapterLuxon}>
                        <DatePicker
                            name="fecha_produccion"
                            label="Fecha Produccion"
                            value={formData.fecha_produccion}
                            onChange={handleDateChange}
                            format="dd/MM/yyyy"
                        />
                    </LocalizationProvider>
                    <FormHelperText>{formErrors.fecha_produccion || ""}</FormHelperText>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
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
                <Grid item xs={12} sm={4}>
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
                <Button variant="contained" onClick={handleSubmit}>
                    Agregar
                </Button>
                <Button variant="contained" onClick={onClose}>
                    Cancelar
                </Button>
            </Stack>
        </form>
    </div>
</Modal>

    );
}