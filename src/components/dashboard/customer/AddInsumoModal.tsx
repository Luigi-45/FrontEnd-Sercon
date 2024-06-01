'use client';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { Modal, TextField, Button, Typography, Stack, Select, MenuItem, InputLabel, Alert, AlertTitle, Grid } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DateTime } from 'luxon';
import { SelectChangeEvent, FormControl, Autocomplete } from '@mui/material';
import FormHelperText from '@mui/material/FormHelperText';
import { ToastContainer, toast } from 'react-toastify';
import { z, ZodError } from 'zod';
import 'react-toastify/dist/ReactToastify.css';

const INSUMO_SAVE_API_BASE_URL = "http://localhost:8083/api/insumo/save";
const ALMACEN_API_BASE_URL = "http://localhost:8085/api/almacen";
const PROVEEDOR_API_BASE_URL = "http://localhost:8085/api/proveedores";
const INSUMO_CATEGORIA_API_BASE_URL = "http://localhost:8083/api/categoria-insumo";
const LIMITE_INSUMO_SAVE_API_BASE_URL = "http://localhost:8083/api/limite-insumo/save";

const InsumoSchema = z.object({
    nombre: z.string().min(3).max(20).refine(value => /^[a-zA-Z]+$/.test(value), {
        message: 'El nombre debe contener solo letras'
    }),
    descripcion: z.string().min(1).max(50),
    costo_de_compra: z.number().min(0),
    unidad_medida: z.string().min(1).max(4).refine(value => /^\d+$/.test(value), {
        message: 'La unidad de medida debe contener solo letras'
    }),
    fecha_adquisicion: z.date(),
    stock: z.number().refine(value => {
        if (typeof value !== 'number' || isNaN(value)) {
            throw new Error('Stock debe ser un número');
        }
        return true;
    }).refine(value => value >= 0 && value <= 100, {
        message: 'Stock debe ser un número entre 0 y 100'
    }),
    almacen_id: z.number().min(1),
    proveedor_id: z.number().min(1),
    categoria_insumo_id: z.number().min(1),
    limite_stockout: z.number().refine(value => {
        if (typeof value !== 'number' || isNaN(value)) {
            throw new Error('Limite debe ser un número');
        }
        return true;
    }).refine(value => value > 0, {
        message: 'Limite debe ser un número mayor a 0'
    }),
    limite_sobreabastecimiento: z.number().refine(value => {
        if (typeof value !== 'number' || isNaN(value)) {
            throw new Error('Limite debe ser un número');
        }
        return true;
    }).refine(value => value > 0, {
        message: 'Limite debe ser un número mayor a 0'
    })
});

export default function AddInsumoModal({ open, onClose, reloadTable, notify }: { open: boolean, onClose: () => void, reloadTable: () => void, notify: () => void }) {

    const initialFormData = {
        nombre: '',
        descripcion: '',
        costo_de_compra: "",
        unidad_medida: '',
        fecha_adquisicion: DateTime.local(),
        stock: "",
        almacen_id: 1,
        proveedor_id: 1,
        categoria_insumo_id: 1,
    };

    const initialLimite = {
        insumoId: 0,
        nombre: "",
        stock: 0,
        limite_stockout: "",
        limite_sobreabastecimiento: "",
        costo: 0,
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
    interface Proveedor {
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
    interface Categoria {
        id: number;
        nombre: string;
        descripcion: string;
    }

    const [almacenes, setAlmacenes] = useState<Almacen[]>([]);
    const [proveedores, setProveedores] = useState<Proveedor[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);

    const unidadesMedida = [
        { key: 1, value: "M", label: "Metros (m)" },
        { key: 2, value: "CM", label: "Centímetros (cm)" },
        { key: 3, value: "IN", label: "Pulgadas (in)" },
        { key: 4, value: "KG", label: "Kilogramos (kg)" },
        { key: 5, value: "G", label: "Gramos (g)" },
        { key: 6, value: "LB", label: "Libras (lb)" },
        { key: 7, value: "M2", label: "Metros cuadrados (m²)" },
        { key: 8, value: "CM2", label: "Centímetros cuadrados (cm²)" },
        { key: 9, value: "L", label: "Litros (L)" },
        { key: 10, value: "ML", label: "Mililitros (ml)" },
        { key: 11, value: "TEX", label: "Tex" },
        { key: 12, value: "DEN", label: "Denier (den)" },
        { key: 13, value: "GSM", label: "Gramos por metro cuadrado (GSM)" },
        { key: 14, value: "H", label: "Horas (h)" },
        { key: 15, value: "MIN", label: "Minutos (min)" },
        { key: 16, value: "NUM_HILOS", label: "Número de hilos" },
        { key: 17, value: "SPI", label: "Puntadas por pulgada (SPI)" },
        { key: 18, value: "PIEZAS", label: "Piezas" },
        { key: 19, value: "DOCENAS", label: "Docenas" },
    ];

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
        const fetchProveedores = async () => {
            try {
                const response = await fetch(PROVEEDOR_API_BASE_URL);
                const data = await response.json();
                setProveedores(data);
            } catch (error) {
                console.log(error);
            }
        };
        fetchProveedores();
    }, []);

    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const response = await fetch(INSUMO_CATEGORIA_API_BASE_URL);
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
        setFormData(prevData => ({ ...prevData, fecha_adquisicion: date ? date : DateTime.local() }));
    };

    const handleSelectChange = (e: SelectChangeEvent<number | string>) => {
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

    const handleAutocompleteChange = (event: React.ChangeEvent<{}>, newValue: { key: number; value: string; label: string; } | null) => {
        if (newValue) {
            handleSelectChange({
                target: { name: 'unidad_medida', value: newValue.value }
            } as SelectChangeEvent<string>);
        }
    };
    

    const handleSubmit = async () => {
        try {
            const formattedData = {
                ...formData,
                nombre: formData.nombre.trim(),
                fecha_adquisicion: formData.fecha_adquisicion.toISODate()
            };

            const formattedValidate = {
                ...formattedData,
                fecha_adquisicion: new Date(formattedData.fecha_adquisicion),
                costo_de_compra: parseFloat(formattedData.costo_de_compra),
                stock: parseFloat(formattedData.stock)
            };

            const initialFormDataWithLimite = {
                ...formattedValidate,
                limite_stockout: parseFloat(limiteData.limite_stockout),
                limite_sobreabastecimiento: parseFloat(limiteData.limite_sobreabastecimiento),
            };


            const validatedData = InsumoSchema.parse(initialFormDataWithLimite);

            const response = await fetch(INSUMO_SAVE_API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formattedData),
            });

            if (response.ok) {
                const data = await response.json();
                limiteData.insumoId = data.id;
                const formattedLimite = {
                    ...limiteData,
                    stock: data.stock,
                    nombre: data.nombre,
                    costo: data.costo_de_compra * data.stock,
                };
                const responseL = await fetch(LIMITE_INSUMO_SAVE_API_BASE_URL, {
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
            console.error('Error al agregar insumo:');
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
                    Agregar Insumo
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
                                name="costo_de_compra"
                                label="Costo"
                                variant="outlined"
                                helperText={formErrors.costo_de_compra || ""}
                                value={formData.costo_de_compra}
                                onChange={handleChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Autocomplete
                            options={unidadesMedida}
                            getOptionLabel={(option) => option.label}
                            value={unidadesMedida.find(option => option.value === formData.unidad_medida) || null}
                            onChange={handleAutocompleteChange}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Unidad de Medida"
                                    error={!!formErrors.unidad_medida}
                                    helperText={formErrors.unidad_medida}
                                    fullWidth
                                />
                            )}
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
                        <Grid item xs={12} sm={4}>
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
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth>
                                <LocalizationProvider dateAdapter={AdapterLuxon}>
                                    <DatePicker
                                        name="fecha_adquisicion"
                                        label="Fecha"
                                        value={formData.fecha_adquisicion}
                                        onChange={handleDateChange}
                                        format="dd/MM/yyyy"
                                    />
                                </LocalizationProvider>
                                <FormHelperText>{formErrors.fecha_adquisicion || ""}</FormHelperText>
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
                            <InputLabel id="proveedor-select-label">Proveedores</InputLabel>
                            <Select
                                name='proveedor_id'
                                label="Seleccione una opcion"
                                value={formData.proveedor_id}
                                onChange={handleSelectChange}
                                fullWidth
                            >
                                {proveedores.map((lista) => (
                                    <MenuItem key={lista.id} value={lista.id}>{lista.nombre_empresa}</MenuItem>
                                ))}
                            </Select>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <InputLabel id="categoria-select-label">Categorias</InputLabel>
                            <Select
                                name='categoria_insumo_id'
                                label="Seleccione una opcion"
                                value={formData.categoria_insumo_id}
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
