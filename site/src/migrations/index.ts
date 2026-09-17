import * as migration_20260917_155929_initial from './20260917_155929_initial';
import * as migration_20260917_200714_mega_menu from './20260917_200714_mega_menu';

export const migrations = [
  {
    up: migration_20260917_155929_initial.up,
    down: migration_20260917_155929_initial.down,
    name: '20260917_155929_initial',
  },
  {
    up: migration_20260917_200714_mega_menu.up,
    down: migration_20260917_200714_mega_menu.down,
    name: '20260917_200714_mega_menu'
  },
];
