import type { Icon } from '@phosphor-icons/react/dist/lib/types';
import { ChartPie as ChartPieIcon } from '@phosphor-icons/react/dist/ssr/ChartPie';
import { GearSix as GearSixIcon } from '@phosphor-icons/react/dist/ssr/GearSix';
import { PlugsConnected as PlugsConnectedIcon } from '@phosphor-icons/react/dist/ssr/PlugsConnected';
import { User as UserIcon } from '@phosphor-icons/react/dist/ssr/User';
import { Users as UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';
import { XSquare } from '@phosphor-icons/react/dist/ssr/XSquare';
import { BoxArrowUp as BoxArrowUpIcon} from '@phosphor-icons/react';
import { Circuitry as CircuitryIcon} from '@phosphor-icons/react';
import { Coffee as coffeIcon} from '@phosphor-icons/react';
import { House as HouseIcon} from '@phosphor-icons/react';
import { ToteSimple as ToteSimpleIcon} from '@phosphor-icons/react';

export const navIcons = {
  'chart-pie': ChartPieIcon,
  'gear-six': GearSixIcon,
  'plugs-connected': PlugsConnectedIcon,
  'x-square': XSquare,
  'box': BoxArrowUpIcon,
  'circuity': CircuitryIcon,
  'coffe': coffeIcon,
  'house': HouseIcon,
  'tote': ToteSimpleIcon,
  user: UserIcon,
  users: UsersIcon,
} as Record<string, Icon>;
