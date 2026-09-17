import * as migration_20260917_155929_initial from './20260917_155929_initial';

export const migrations = [
  {
    up: migration_20260917_155929_initial.up,
    down: migration_20260917_155929_initial.down,
    name: '20260917_155929_initial'
  },
];
