import * as migration_20260814_175153 from './20260814_175153';
import * as migration_20260816_124500_add_media_prefix from './20260816_124500_add_media_prefix';
import * as migration_20260817_170729_add_author_avatar from './20260817_170729_add_author_avatar';
import * as migration_20260817_223118_add_media_purpose_and_image_only from './20260817_223118_add_media_purpose_and_image_only';

export const migrations = [
  {
    up: migration_20260814_175153.up,
    down: migration_20260814_175153.down,
    name: '20260814_175153',
  },
  {
    up: migration_20260816_124500_add_media_prefix.up,
    down: migration_20260816_124500_add_media_prefix.down,
    name: '20260816_124500_add_media_prefix',
  },
  {
    up: migration_20260817_170729_add_author_avatar.up,
    down: migration_20260817_170729_add_author_avatar.down,
    name: '20260817_170729_add_author_avatar',
  },
  {
    up: migration_20260817_223118_add_media_purpose_and_image_only.up,
    down: migration_20260817_223118_add_media_purpose_and_image_only.down,
    name: '20260817_223118_add_media_purpose_and_image_only'
  },
];
