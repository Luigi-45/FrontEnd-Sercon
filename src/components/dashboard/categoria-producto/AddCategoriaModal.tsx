'use client';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { Modal, TextField, Button, Typography, Stack, Select, MenuItem, InputLabel, Alert, AlertTitle } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DateTime } from 'luxon';
import { SelectChangeEvent } from '@mui/material';

const CATEGORIA_SAVE_API_BASE_URL = "http://localhost:8084/api/categoria-producto/save";

export default function AddCategoriaModal({ open, onClose, reloadTable, notify }: { open: boolean, onClose: () => void, reloadTable: () => void, notify: () => void }) {
    const initialFormData = {
        nombre: '',
        descripcion: '',
    };

    const [formData, setFormData] = useState(initialFormData);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async () => {
        try {
            const response = await fetch(CATEGORIA_SAVE_API_BASE_URL, {
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
            console.error('Error al agregar categoria:');
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '3rem' }}>
                <Typography variant="h6" gutterBottom>
                    Agregar Categoria
                </Typography>
                <form>
                    <Stack spacing={2}>
                        <TextField
                            name="nombre"
                            label="Nombre"
                            variant="outlined"
                            value={formData.nombre}
                            onChange={handleChange}
                        />
                        <TextField
                            name="descripcion"
                            label="Descripcion"
                            variant="outlined"
                            value={formData.descripcion}
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