'use client';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { Modal, TextField, Button, Typography, Stack, Select, MenuItem, InputLabel, Alert, AlertTitle } from '@mui/material';
import { z, ZodError } from 'zod';

const ALMACEN_SAVE_API_BASE_URL = "http://35.198.40.220:8085/api/almacen/save";

const AlmacenSchema = z.object({
    nombre_almacen: z.string().min(3).max(20).refine(value => /^[a-zA-Z]+$/.test(value), {
        message: 'El nombre debe contener solo letras'
    }),
    responsable: z.string().min(1).max(30).refine(value => /^[a-zA-Z]+$/.test(value), {
        message: 'El nombre del responable debe contener solo letras'
    }),
    ciudad: z.string().min(1).max(20).refine(value => /^[a-zA-Z]+$/.test(value), {
        message: 'La ciudad debe contener solo letras'
    }),
    direccion: z.string().min(1).max(20),
    num_telefonico: z.string().regex(/^\d{9}$/,{
        message:"Formato incorrecto"
    }),
    email_contacto: z.string().email({
        message: "Correo Invalido"
    })
});

export default function AddAlmacenModal({ open, onClose, reloadTable, notify }: { open: boolean, onClose: () => void, reloadTable: () => void, notify: () => void }) {
    const initialFormData = {
        nombre_almacen: '',
        responsable: '',
        ciudad: "",
        direccion: "",
        num_telefonico: 0,
        email_contacto: "",
    };

    const [formData, setFormData] = useState(initialFormData);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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

    const handleSubmit = async () => {
        try {
            const validatedData = AlmacenSchema.parse(formData);

            const response = await fetch(ALMACEN_SAVE_API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                reloadTable();
                notify();
                setFormData(initialFormData);
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
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '3rem' }}>
                <Typography variant="h6" gutterBottom>
                    Agregar Almacen
                </Typography>
                <form>
                    <Stack spacing={2}>
                        <TextField
                            name="nombre_almacen"
                            label="Nombre"
                            variant="outlined"
                            helperText={formErrors.nombre_almacen || ""}
                            value={formData.nombre_almacen}
                            onChange={handleChange}
                        />
                        <TextField
                            name="responsable"
                            label="responsable"
                            variant="outlined"
                            helperText={formErrors.responsable || ""}
                            value={formData.responsable}
                            onChange={handleChange}
                        />
                        <TextField
                            name="ciudad"
                            label="ciudad"
                            variant="outlined"
                            helperText={formErrors.ciudad || ""}
                            value={formData.ciudad}
                            onChange={handleChange}
                        />
                        <TextField
                            name="direccion"
                            label="direccion"
                            variant="outlined"
                            helperText={formErrors.direccion || ""}
                            value={formData.direccion}
                            onChange={handleChange}
                        />
                        <TextField
                            name="num_telefonico"
                            label="Telefono"
                            variant="outlined"
                            helperText={formErrors.num_telefonico || ""}
                            value={formData.num_telefonico}
                            onChange={handleChange}
                        />
                        <TextField
                            name="email_contacto"
                            label="email"
                            variant="outlined"
                            helperText={formErrors.email_contacto || ""}
                            value={formData.email_contacto}
                            onChange={handleChange}
                        />
                        <Stack direction="row" spacing={2}>
                            <Button variant="contained" onClick={handleSubmit}>
                                Agregar
                            </Button>
                            <Button variant="contained" onClick={onClose}>
                                Cancelar
                            </Button>
                        </Stack>
                    </Stack>
                </form>
            </div>
        </Modal>
    );
}