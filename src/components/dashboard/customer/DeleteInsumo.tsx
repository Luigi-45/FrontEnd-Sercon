'use client';
import * as React from 'react';
import { useState, useEffect } from 'react';
import Grid from "@mui/material/Grid"
import Modal from '@mui/material/Modal';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import FormHelperText from '@mui/material/FormHelperText';
import { Insumo } from "./customers-table";
import { Stack, TextField, Select, MenuItem } from "@mui/material";
import { DateTime } from 'luxon';
import { SelectChangeEvent, FormControl, InputLabel, Autocomplete } from '@mui/material';
import { z, ZodError } from 'zod';
import notifyD from "@/app/dashboard/customers/page";


const ALMACEN_API_BASE_URL = "http://localhost:8085/api/almacen";
const PROVEEDOR_API_BASE_URL = "http://localhost:8085/api/proveedores";
const INSUMO_CATEGORIA_API_BASE_URL = "http://localhost:8083/api/categoria-insumo";

const InsumoSchema = z.object({
    nombre: z.string().min(3).max(20).refine(value => /^[a-zA-Z]+$/.test(value), {
        message: 'El nombre debe contener solo letras'
    }),
    descripcion: z.string().min(1).max(50),
    costo_de_compra: z.number().min(0),
    unidad_medida: z.string().min(1).max(4),
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

export async function handleDeleteInsumo(id: number, reloadTable: () => void, notifyD: () => void) {
    const INSUMO_DELETE_API_BASE_URL = "http://localhost:8083/api/insumo/delete/" + id;
    try {
        const response = await fetch(INSUMO_DELETE_API_BASE_URL, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            console.log(`Insumo con ID ${id} eliminado exitosamente`);
            notifyD();
            reloadTable();
        } else {
            console.error(`Error al eliminar insumo con ID ${id}:`, response);
        }
    } catch (error) {
        console.error(`Error al eliminar insumo con ID ${id}:`, error);
    }
}


export interface EditModalProps {
    isOpen: boolean;
    onClose: () => void;
    insumo: Insumo | null;
    reloadTable: () => void;
    notifyA: () => void;
}

export const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, insumo, reloadTable, notifyA }: { isOpen: boolean, onClose: () => void, insumo: Insumo | null, reloadTable: () => void, notifyA: () => void }) => {
    const [almacenes, setAlmacenes] = useState<Almacen[]>([]);
    const [proveedores, setProveedores] = useState<Proveedor[]>([]);
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


    const handleSave = async (id: number) => {
        try {
            const formattedData = {
                ...formData,
                fecha_adquisicion: formData.fecha_adquisicion.toISODate()
            };

            const formattedValidate = {
                ...formattedData,
                fecha_adquisicion: new Date(formattedData.fecha_adquisicion),
                costo_de_compra: parseFloat(formattedData.costo_de_compra),
                stock: parseFloat(formattedData.stock)
            };

            const validatedData = InsumoSchema.parse(formattedValidate);

            const response = await fetch("http://localhost:8083/api/insumo/update/" + id, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formattedData),
            });

            if (response.ok) {
                console.log('Insumo actualizado exitosamente');
                notifyA();
                reloadTable();
                onClose();
            } else {
                console.error('Error al actualizar el insumo:', response.statusText);
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
        costo_de_compra: "",
        unidad_medida: '',
        fecha_adquisicion: DateTime.local(),
        stock: "",
        almacen_id: 1,
        proveedor_id: 1,
        categoria_insumo_id: 1,
    };

    const [formData, setFormData] = useState(initialFormData);

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

    useEffect(() => {
        if (insumo) {
            const fechaAdquisicion = DateTime.fromISO(insumo.fecha_adquisicion);
            setFormData({
                id: insumo.id,
                nombre: insumo.nombre,
                descripcion: insumo.descripcion,
                costo_de_compra: insumo.costo_de_compra.toString(),
                unidad_medida: insumo.unidad_medida,
                fecha_adquisicion: fechaAdquisicion as DateTime<true>,
                stock: insumo.stock.toString(),
                almacen_id: insumo.almacen_id,
                proveedor_id: insumo.proveedor_id,
                categoria_insumo_id: insumo.categoria_insumo_id,
            });
            console.log(insumo.fecha_adquisicion)
        } else {
            setFormData(initialFormData);
        }
    }, [insumo]);

    return (
        <Modal open={isOpen} onClose={onClose} >
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '1rem', borderRadius: '18px' }}>
                <Typography variant="h6" gutterBottom>
                    Editar Insumo
                </Typography>
                <form>
                    <Grid container spacing={2}>
                        {/* Primera fila */}
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
                                name="costo_de_compra"
                                label="Costo"
                                variant="outlined"
                                helperText={formErrors.costo_de_compra || ""}
                                value={formData.costo_de_compra}
                                onChange={handleChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
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
                            <FormControl fullWidth>
                                <LocalizationProvider dateAdapter={AdapterLuxon} >
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