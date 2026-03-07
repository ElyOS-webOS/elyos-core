import {
	serial,
	varchar,
	text,
	jsonb,
	timestamp,
	boolean,
	unique,
	index,
	integer
} from 'drizzle-orm/pg-core';
import { platformSchema as schema } from '../schema';

export const themePresets = schema.table(
	'theme_presets',
	{
		id: serial('id').primaryKey(),
		locale: varchar('locale', { length: 10 }).notNull().default('hu'),
		name: text('name').notNull(),
		description: text('description'),
		settings: jsonb('settings')
			.$type<{
				theme: {
					mode: 'light' | 'dark' | 'auto';
					modeTaskbarStartMenu: 'light' | 'dark' | 'auto';
					colorPrimaryHue: string;
					colorPrimaryLightness?: string;
					colorPrimaryChroma?: string;
					fontSize: 'small' | 'medium' | 'large';
				};
				desktop?: {
					backgroundType?: 'image' | 'video' | 'color';
					backgroundValue?: string;
				};
			}>()
			.notNull(),
		isDefault: boolean('is_default').default(false),
		sortOrder: integer('sort_order').notNull().default(0),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
	},
	(table) => [
		index('theme_presets_locale_idx').on(table.locale),
		unique('theme_presets_locale_name_unique').on(table.locale, table.name)
	]
);
