import * as migration_20260814_175153 from './20260814_175153';
import * as migration_20260816_124500_add_media_prefix from './20260816_124500_add_media_prefix';
import * as migration_20260817_170729_add_author_avatar from './20260817_170729_add_author_avatar';
import * as migration_20260817_223118_add_media_purpose_and_image_only from './20260817_223118_add_media_purpose_and_image_only';
import * as migration_20260820_120000_add_performance_indexes from './20260820_120000_add_performance_indexes';
import * as migration_20260820_191101_add_team_profile_fields from './20260820_191101_add_team_profile_fields';
import * as migration_20260820_203523_add_admin_roles_and_audit_logs from './20260820_203523_add_admin_roles_and_audit_logs';
import * as migration_20260820_204210_add_private_analytics from './20260820_204210_add_private_analytics';
import * as migration_20260820_205339_add_login_audit_events from './20260820_205339_add_login_audit_events';

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
    name: '20260817_223118_add_media_purpose_and_image_only',
  },
  {
    up: migration_20260820_120000_add_performance_indexes.up,
    down: migration_20260820_120000_add_performance_indexes.down,
    name: '20260820_120000_add_performance_indexes',
  },
  {
    up: migration_20260820_191101_add_team_profile_fields.up,
    down: migration_20260820_191101_add_team_profile_fields.down,
    name: '20260820_191101_add_team_profile_fields',
  },
  {
    up: migration_20260820_203523_add_admin_roles_and_audit_logs.up,
    down: migration_20260820_203523_add_admin_roles_and_audit_logs.down,
    name: '20260820_203523_add_admin_roles_and_audit_logs',
  },
  {
    up: migration_20260820_204210_add_private_analytics.up,
    down: migration_20260820_204210_add_private_analytics.down,
    name: '20260820_204210_add_private_analytics',
  },
  {
    up: migration_20260820_205339_add_login_audit_events.up,
    down: migration_20260820_205339_add_login_audit_events.down,
    name: '20260820_205339_add_login_audit_events'
  },
];
