'use client';
import * as React from 'react';
import { useState, useEffect } from 'react';
import Modal from '@mui/material/Modal';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Categoria } from "@/components/dashboard/categoria-insumo/categorias-table";
import { Stack, TextField, Select, MenuItem } from "@mui/material";
import { DateTime } from 'luxon';
import { SelectChangeEvent } from '@mui/material';

export async function handleDeleteCategoria(id: number, reloadTable: () => void, notifyD: () => void) {
    const CATEGORIA_DELETE_API_BASE_URL = "http://localhost:8083/api/categoria-insumo/delete/" + id;
    try {
        const response = await fetch(CATEGORIA_DELETE_API_BASE_URL, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            console.log(`Categoria con ID ${id} eliminado exitosamente`);
            notifyD();
            reloadTable();
        } else {
            console.error(`Error al eliminar categoria con ID ${id}:`, response);
        }
    } catch (error) {
        console.error(`Error al eliminar categoria con ID ${id}:`, error);
    }
}


export interface EditModalProps {
    isOpen: boolean;
    onClose: () => void;
    categoria: Categoria | null;
    reloadTable: () => void;
    notifyA: () => void;
}

export const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose,categoria, reloadTable, notifyA }: { isOpen: boolean, onClose: () => void, categoria: Categoria | null, reloadTable: () => void, notifyA: () => void }) => {

    const handleSave = async (id: number) => {
        try {
            const response = await fetch("http://localhost:8083/api/categoria-insumo/update/"+id, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                console.log('Categoria actualizada exitosamente');
                reloadTable();
                notifyA();
                onClose();
            } else {
                console.error('Error al actualizar la categoria:', response.statusText);
            }
        } catch (error) {
            console.error('Error al actualizar la categoria:', error);
        }
    };

    const initialFormData = {
        id: 0,
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

    useEffect(() => {
        if (categoria) {
            setFormData({
                id: categoria.id,
                nombre: categoria.nombre,
                descripcion: categoria.descripcion,
            });
        } else {
            setFormData(initialFormData);
        }
    }, [categoria]);

    return (
        <Modal open={isOpen} onClose={onClose}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '3rem' }}>
                <Typography variant="h6" gutterBottom>
                    Editar categoria
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
                            label="descripcion"
                            variant="outlined"
                            value={formData.descripcion}
                            onChange={handleChange}
                        />
                        <Stack direction="row" spacing={2}>
                            <Button variant="contained" onClick={() => handleSave(formData.id)}>
                                Actualizar
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
};