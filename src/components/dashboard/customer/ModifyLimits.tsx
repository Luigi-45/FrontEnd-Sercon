'use client';
import * as React from 'react';
import { useState, useEffect } from 'react';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Limite } from "@/components/dashboard/customer/customers-table";
import { Stack, TextField, Select, MenuItem } from "@mui/material";
import { z, ZodError } from 'zod';
import { SelectChangeEvent, Grid, FormControl } from '@mui/material';



const LimiteSchema = z.object({
    insumoId: z.number(),
    nombre: z.string(),
    stock: z.number(),
    limite_stockout: z.string().regex(/^\d+$/, {
        message: "Formato incorrecto"
    }),
    limite_sobreabastecimiento: z.string().regex(/^\d+$/, {
        message: "Formato incorrecto"
    }),
    costo: z.number(),
});


export interface OpcionModalProps {
    isOpen: boolean;
    onClose: () => void;
    limite: Limite | null;
    notifyA: () => void;
}

export const OpcionModal: React.FC<OpcionModalProps> = ({ isOpen, onClose, limite, notifyA }: { isOpen: boolean, onClose: () => void, limite: Limite | null, notifyA: () => void }) => {
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});


    const handleSave = async (id: number) => {
        try {

            const formattedValidate = {
                ...formData,
                limite_stockout: formData.limite_stockout,
                limite_sobreabastecimiento: formData.limite_sobreabastecimiento
            };
            const validatedData = LimiteSchema.parse(formattedValidate);
            console.log(id)
            const response = await fetch("http://localhost:8083/api/limite-insumo/update/" + id, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                console.log('Limite actualizado exitosamente');
                notifyA();
                onClose();
            } else {
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
        insumoId: 0,
        nombre: '',
        stock: 0,
        limite_stockout: "",
        limite_sobreabastecimiento: "",
        costo: 0,
    };


    const [formData, setFormData] = useState(initialFormData);

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

    useEffect(() => {
        if (limite) {
            setFormData({
                id: limite.id,
                insumoId: limite.insumoId,
                nombre: limite.nombre,
                stock: limite.stock,
                limite_stockout: limite.limite_stockout.toString(),
                limite_sobreabastecimiento: limite.limite_sobreabastecimiento.toString(),
                costo: limite.costo,
            });
        } else {
            setFormData(initialFormData);
        }
    }, [limite]);


    return (
        <Modal open={isOpen} onClose={onClose}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '1rem', borderRadius: '18px' }}>
                <Typography variant="h6" gutterBottom>
                    Editar Configuracion
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
                                disabled
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="stock"
                                label="Stock"
                                variant="outlined"
                                helperText={formErrors.stock || ""}
                                value={formData.stock}
                                onChange={handleChange}
                                disabled
                                fullWidth
                            />
                        </Grid>
                        {/* Segunda fila */}
                        <Grid item xs={12} sm={4}>
                            <TextField
                                name="limite_stockout"
                                label="Limite Stockout"
                                variant="outlined"
                                helperText={formErrors.limite_stockout || ""}
                                value={formData.limite_stockout}
                                onChange={handleChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                name="limite_sobreabastecimiento"
                                label="Limite Sobreabastecimiento"
                                variant="outlined"
                                helperText={formErrors.limite_sobreabastecimiento || ""}
                                value={formData.limite_sobreabastecimiento}
                                onChange={handleChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                name="costo_aproximado"
                                label="Costo Aproximado"
                                variant="outlined"
                                helperText={formErrors.costo || ""}
                                value={formData.costo}
                                onChange={handleChange}
                                disabled
                                fullWidth
                            />
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