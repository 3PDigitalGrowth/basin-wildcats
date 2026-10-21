import * as migration_20260917_155929_initial from './20260917_155929_initial';
import * as migration_20260917_200714_mega_menu from './20260917_200714_mega_menu';
import * as migration_20261021_214457_committee_feedback_oct from './20261021_214457_committee_feedback_oct';

export const migrations = [
  {
    up: migration_20260917_155929_initial.up,
    down: migration_20260917_155929_initial.down,
    name: '20260917_155929_initial',
  },
  {
    up: migration_20260917_200714_mega_menu.up,
    down: migration_20260917_200714_mega_menu.down,
    name: '20260917_200714_mega_menu',
  },
  {
    up: migration_20261021_214457_committee_feedback_oct.up,
    down: migration_20261021_214457_committee_feedback_oct.down,
    name: '20261021_214457_committee_feedback_oct'
  },
];
