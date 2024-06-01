import * as React from 'react';
import Card from '@mui/material/Card';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';

export interface AlmacenesFiltersProps {
  onFilterChange: (filterText: string) => void; 
  filterText: string;
}

export function AlmacenesFilters({ onFilterChange, filterText }: AlmacenesFiltersProps): React.JSX.Element {
  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange(event.target.value);
  };
  return (
    <Card sx={{ p: 2 }}>
      <OutlinedInput
        value={filterText}
        onChange={handleFilterChange}
        defaultValue=""
        fullWidth
        placeholder="Buscar Almacen"
        startAdornment={
          <InputAdornment position="start">
            <MagnifyingGlassIcon fontSize="var(--icon-fontSize-md)" />
          </InputAdornment>
        }
        sx={{ maxWidth: '500px' }}
      />
    </Card>
  );
}