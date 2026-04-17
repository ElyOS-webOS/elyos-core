/**
 * AI Provider Repository
 *
 * Adatbázis-alapú AI provider kezelés
 */

import { eq, and } from 'drizzle-orm';
import db from '../index';
import {
	aiProviders,
	aiProviderConfigs,
	type AiProvider,
	type AiProviderConfig,
	type AiProviderInsert,
	type AiProviderConfigInsert
} from '@racona/database/schemas';

export interface ProviderWithConfigs extends AiProvider {
	configs: AiProviderConfig[];
}

export interface ProviderConfigMap {
	[key: string]: string;
}

/**
 * Összes engedélyezett provider lekérése konfigurációkkal
 */
export async function getEnabledProviders(): Promise<ProviderWithConfigs[]> {
	const providers = await db
		.select()
		.from(aiProviders)
		.where(eq(aiProviders.isEnabled, true))
		.orderBy(aiProviders.isRecommended, aiProviders.displayName);

	const providersWithConfigs: ProviderWithConfigs[] = [];

	for (const provider of providers) {
		const configs = await db
			.select()
			.from(aiProviderConfigs)
			.where(eq(aiProviderConfigs.providerId, provider.id));

		providersWithConfigs.push({
			...provider,
			configs
		});
	}

	return providersWithConfigs;
}

/**
 * Egy provider konfigurációjának lekérése kulcs-érték párokban
 */
export async function getProviderConfigMap(providerName: string): Promise<ProviderConfigMap> {
	const provider = await db
		.select()
		.from(aiProviders)
		.where(and(eq(aiProviders.name, providerName), eq(aiProviders.isEnabled, true)))
		.limit(1);

	if (!provider[0]) {
		throw new Error(`Provider not found or disabled: ${providerName}`);
	}

	const configs = await db
		.select()
		.from(aiProviderConfigs)
		.where(eq(aiProviderConfigs.providerId, provider[0].id));

	const configMap: ProviderConfigMap = {};
	for (const config of configs) {
		configMap[config.configKey] = config.configValue;
	}

	return configMap;
}

/**
 * Provider név alapján provider adatok lekérése
 */
export async function getProviderByName(providerName: string): Promise<AiProvider | null> {
	const providers = await db
		.select()
		.from(aiProviders)
		.where(and(eq(aiProviders.name, providerName), eq(aiProviders.isEnabled, true)))
		.limit(1);

	return providers[0] || null;
}

/**
 * Új provider létrehozása
 */
export async function createProvider(data: AiProviderInsert): Promise<AiProvider> {
	const [provider] = await db.insert(aiProviders).values(data).returning();

	return provider;
}

/**
 * Provider konfiguráció hozzáadása
 */
export async function addProviderConfig(data: AiProviderConfigInsert): Promise<AiProviderConfig> {
	const [config] = await db.insert(aiProviderConfigs).values(data).returning();

	return config;
}

/**
 * Provider konfiguráció frissítése
 */
export async function updateProviderConfig(
	providerId: number,
	configKey: string,
	configValue: string
): Promise<void> {
	await db
		.update(aiProviderConfigs)
		.set({ configValue })
		.where(
			and(eq(aiProviderConfigs.providerId, providerId), eq(aiProviderConfigs.configKey, configKey))
		);
}

export const aiProviderRepository = {
	getEnabledProviders,
	getProviderConfigMap,
	getProviderByName,
	createProvider,
	addProviderConfig,
	updateProviderConfig
};
