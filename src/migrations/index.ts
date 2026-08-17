import * as migration_20260814_175153 from './20260814_175153';
import * as migration_20260816_124500_add_media_prefix from './20260816_124500_add_media_prefix';

export const migrations = [
  {
    up: migration_20260814_175153.up,
    down: migration_20260814_175153.down,
    name: '20260814_175153'
  },
  {
    up: migration_20260816_124500_add_media_prefix.up,
    down: migration_20260816_124500_add_media_prefix.down,
    name: '20260816_124500_add_media_prefix'
  },
];
