'use client';
import * as React from 'react';
import type { Metadata } from 'next';
import Grid from '@mui/material/Unstable_Grid2';
import { config } from '@/config';
import { Budget } from '@/components/dashboard/overview/budget';
import { TotalCustomers } from '@/components/dashboard/overview/total-customers';
import { TasksProgress } from '@/components/dashboard/overview/tasks-progress';
import { TotalProfit } from '@/components/dashboard/overview/total-profit';
import { Sales } from '@/components/dashboard/overview/sales';
import { Traffic } from '@/components/dashboard/overview/traffic';

const MOVIMIENTO_API_BASE_URL = "http://localhost:8085/api/movimiento";

interface Movimiento {
  id: number;
  tipo_mov: number;
  tipo_Item: number;
  nombre: string;
  cantidad: number;
  fecha: string;
  precio: number;
}

interface MovimientoPorMes {
  [month: number]: number;
}

interface SumaNegativos {
  tipoItem1: number;
  tipoItem2: number;
  total: number;
}

async function fetchMovimientos(): Promise<Movimiento[]> {
  const response = await fetch(MOVIMIENTO_API_BASE_URL);
  if (!response.ok) {
    throw new Error(`Error fetching data: ${response.status}`);
  }
  return response.json();
}

function sumarValoresNegativos(movimientos: Movimiento[]): SumaNegativos {
  let sumaNegativosTipo1 = 0;
  let sumaNegativosTipo2 = 0;
  let total = 0;

  movimientos.forEach(movimiento => {
    if (movimiento.cantidad < 0) {
      if (movimiento.tipo_Item === 2) {
        sumaNegativosTipo2 += movimiento.cantidad*movimiento.precio;
      }
    }else{
      if(movimiento.tipo_Item === 1){
        sumaNegativosTipo1 += movimiento.cantidad*movimiento.precio;
      }
    }
  });

  total= -sumaNegativosTipo2 - sumaNegativosTipo1;

  return { tipoItem1: sumaNegativosTipo1, tipoItem2: sumaNegativosTipo2, total: total };
}

function groupByMonth(movimientos: Movimiento[]): MovimientoPorMes {
  const movimientosPorMes: MovimientoPorMes = {};

  movimientos.forEach(movimiento => {
    const month = new Date(movimiento.fecha).getMonth() + 1;
    if (movimiento.cantidad < 0) {
      if (movimiento.tipo_Item === 2) {
        movimientosPorMes[month] = (movimientosPorMes[month] || 0) + (-movimiento.cantidad * movimiento.precio);
      }
    } else {
      if (movimiento.tipo_Item === 1) {
        movimientosPorMes[month] = (movimientosPorMes[month] || 0) + (-movimiento.cantidad * movimiento.precio);
      }
    }
  });

  return movimientosPorMes;
}

export default function Page(): React.JSX.Element {
  const [sumasNegativos, setSumasNegativos] = React.useState<SumaNegativos | null>(null);
  const [movimientosPorMes, setMovimientosPorMes] = React.useState<MovimientoPorMes | null>(null);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const movimientos = await fetchMovimientos();
        const sumas = sumarValoresNegativos(movimientos);
        setSumasNegativos(sumas);
        const movimientosAgrupados = groupByMonth(movimientos);
        setMovimientosPorMes(movimientosAgrupados);
      } catch (error) {
        console.error(error);
      }
    }

    fetchData();
  }, []);

  const tipoItem1 = sumasNegativos?.tipoItem1 ?? 0;
  const tipoItem2 = sumasNegativos?.tipoItem2 ?? 0;

const chart1 = (tipoItem1 * 100) / (-tipoItem2 + tipoItem1);
const chart2 = (-tipoItem2 * 100) / (-tipoItem2 + tipoItem1);

  const value = sumasNegativos?.total ? Number((sumasNegativos.total / 3).toFixed(2)) : 0;

  return (
    <Grid container spacing={3}>
      <Grid lg={3} sm={6} xs={12}>
        <Budget diff={35} trend="up" sx={{ height: '100%' }} value={`S/ ${sumasNegativos ? -sumasNegativos.tipoItem2 : 'Cargando'}`} />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <TotalCustomers diff={7} trend="down" sx={{ height: '100%' }} value={`S/ ${sumasNegativos ? sumasNegativos.tipoItem1 : 'Cargando'}`} />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <TasksProgress sx={{ height: '100%' }} value={value} />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <TotalProfit sx={{ height: '100%' }} value={`S/ ${sumasNegativos ? sumasNegativos.total.toFixed(2) : 'Cargando'}`}/>
      </Grid>
      <Grid lg={8} xs={12}>
        <Sales
          chartSeries={[
            { name: 'Año Actual', data: Object.values(movimientosPorMes ?? {}).map(monthValue => monthValue.toFixed(2)) },
            { name: 'Año Pasado', data: [12, 11, 4, 6, 2, 9, 9, 10, 11, 12, 13, 13] },
          ]}
          sx={{ height: '100%' }}
        />
      </Grid>
      <Grid lg={4} md={6} xs={12}>
        <Traffic chartSeries={[Number(chart2.toFixed(2)), Number(chart1.toFixed(2))]} labels={['Ingreso', 'Salida']} sx={{ height: '100%' }} />
      </Grid>
    </Grid>
  );
}
