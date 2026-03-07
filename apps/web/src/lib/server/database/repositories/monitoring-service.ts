import { performanceMonitor } from './performance-monitor';
import { getDatabaseTemplateRepository } from './email-template-repository-factory';
import { client as dbClient } from '../index';

/**
 * Service for monitoring database and template performance.
 */
export class MonitoringService {
	private repository = getDatabaseTemplateRepository();

	/**
	 * Get comprehensive system health and performance metrics.
	 * @returns Complete system metrics.
	 */
	async getSystemMetrics(): Promise<{
		timestamp: string;
		database: {
			connectionPool: {
				totalConnections: number;
				idleConnections: number;
				waitingClients: number;
			};
			performance: ReturnType<typeof performanceMonitor.getOverallStats>;
		};
		cache: ReturnType<MonitoringService['repository']['getCacheMetrics']>;
		templates: {
			totalActive: number;
			lastUpdated?: Date;
		};
		system: {
			uptime: number;
			memoryUsage: NodeJS.MemoryUsage;
		};
	}> {
		// Get database connection pool stats
		const poolStats = {
			totalConnections: dbClient.totalCount,
			idleConnections: dbClient.idleCount,
			waitingClients: dbClient.waitingCount
		};

		// Get template count
		let totalActive = 0;
		let lastUpdated: Date | undefined;

		try {
			const templates = await this.repository.getAllActiveTemplates();
			totalActive = templates.length;
			lastUpdated = templates.reduce(
				(latest, template) => {
					const templateUpdated = template.updatedAt ? new Date(template.updatedAt) : null;
					if (!templateUpdated) return latest;
					return !latest || templateUpdated > latest ? templateUpdated : latest;
				},
				undefined as Date | undefined
			);
		} catch (error) {
			console.warn('[MonitoringService] Failed to get template stats:', error);
		}

		return {
			timestamp: new Date().toISOString(),
			database: {
				connectionPool: poolStats,
				performance: performanceMonitor.getOverallStats()
			},
			cache: this.repository.getCacheMetrics(),
			templates: {
				totalActive,
				lastUpdated
			},
			system: {
				uptime: process.uptime(),
				memoryUsage: process.memoryUsage()
			}
		};
	}

	/**
	 * Get performance metrics in Prometheus format.
	 * @returns Metrics in Prometheus format.
	 */
	async getPrometheusMetrics(): Promise<string> {
		const metrics = await this.getSystemMetrics();
		const lines: string[] = [];

		// Database metrics
		lines.push('# HELP template_db_connections_total Total database connections');
		lines.push('# TYPE template_db_connections_total gauge');
		lines.push(`template_db_connections_total ${metrics.database.connectionPool.totalConnections}`);

		lines.push('# HELP template_db_connections_idle Idle database connections');
		lines.push('# TYPE template_db_connections_idle gauge');
		lines.push(`template_db_connections_idle ${metrics.database.connectionPool.idleConnections}`);

		lines.push('# HELP template_db_connections_waiting Waiting database clients');
		lines.push('# TYPE template_db_connections_waiting gauge');
		lines.push(`template_db_connections_waiting ${metrics.database.connectionPool.waitingClients}`);

		// Performance metrics
		lines.push('# HELP template_operations_total Total template operations');
		lines.push('# TYPE template_operations_total counter');
		lines.push(`template_operations_total ${metrics.database.performance.totalOperations}`);

		lines.push('# HELP template_operations_success_rate Template operation success rate');
		lines.push('# TYPE template_operations_success_rate gauge');
		lines.push(
			`template_operations_success_rate ${metrics.database.performance.overallSuccessRate}`
		);

		lines.push(
			'# HELP template_operations_avg_duration_ms Average operation duration in milliseconds'
		);
		lines.push('# TYPE template_operations_avg_duration_ms gauge');
		lines.push(`template_operations_avg_duration_ms ${metrics.database.performance.avgDuration}`);

		// Cache metrics
		if (metrics.cache.enabled && metrics.cache.stats) {
			lines.push('# HELP template_cache_hit_rate Cache hit rate percentage');
			lines.push('# TYPE template_cache_hit_rate gauge');
			lines.push(`template_cache_hit_rate ${metrics.cache.stats.hitRate}`);

			lines.push('# HELP template_cache_size Current cache size');
			lines.push('# TYPE template_cache_size gauge');
			lines.push(`template_cache_size ${metrics.cache.stats.size}`);

			lines.push('# HELP template_cache_hits_total Total cache hits');
			lines.push('# TYPE template_cache_hits_total counter');
			lines.push(`template_cache_hits_total ${metrics.cache.stats.hits}`);

			lines.push('# HELP template_cache_misses_total Total cache misses');
			lines.push('# TYPE template_cache_misses_total counter');
			lines.push(`template_cache_misses_total ${metrics.cache.stats.misses}`);
		}

		// Template metrics
		lines.push('# HELP template_active_total Total active templates');
		lines.push('# TYPE template_active_total gauge');
		lines.push(`template_active_total ${metrics.templates.totalActive}`);

		// System metrics
		lines.push('# HELP template_system_uptime_seconds System uptime in seconds');
		lines.push('# TYPE template_system_uptime_seconds gauge');
		lines.push(`template_system_uptime_seconds ${metrics.system.uptime}`);

		lines.push('# HELP template_system_memory_used_bytes Memory usage in bytes');
		lines.push('# TYPE template_system_memory_used_bytes gauge');
		lines.push(`template_system_memory_used_bytes ${metrics.system.memoryUsage.rss}`);

		return lines.join('\n') + '\n';
	}

	/**
	 * Get health check status.
	 * @returns Health check result.
	 */
	async getHealthCheck(): Promise<{
		status: 'healthy' | 'degraded' | 'unhealthy';
		checks: {
			database: { status: 'pass' | 'fail'; message?: string };
			cache: { status: 'pass' | 'fail'; message?: string };
			templates: { status: 'pass' | 'fail'; message?: string };
		};
		timestamp: string;
	}> {
		const checks = {
			database: { status: 'pass' as 'pass' | 'fail', message: undefined as string | undefined },
			cache: { status: 'pass' as 'pass' | 'fail', message: undefined as string | undefined },
			templates: { status: 'pass' as 'pass' | 'fail', message: undefined as string | undefined }
		};

		// Check database connectivity
		try {
			await dbClient.query('SELECT 1');
		} catch (error) {
			checks.database.status = 'fail';
			checks.database.message =
				error instanceof Error ? error.message : 'Database connection failed';
		}

		// Check cache functionality
		try {
			const cacheMetrics = this.repository.getCacheMetrics();
			if (cacheMetrics.enabled && cacheMetrics.stats) {
				// Check if cache hit rate is reasonable (> 10% if there have been requests)
				const totalRequests = cacheMetrics.stats.hits + cacheMetrics.stats.misses;
				if (totalRequests > 100 && cacheMetrics.stats.hitRate < 10) {
					checks.cache.status = 'fail';
					checks.cache.message = `Low cache hit rate: ${cacheMetrics.stats.hitRate}%`;
				}
			}
		} catch (error) {
			checks.cache.status = 'fail';
			checks.cache.message = error instanceof Error ? error.message : 'Cache check failed';
		}

		// Check template availability
		try {
			const templates = await this.repository.getAllActiveTemplates();
			if (templates.length === 0) {
				checks.templates.status = 'fail';
				checks.templates.message = 'No active templates found';
			}
		} catch (error) {
			checks.templates.status = 'fail';
			checks.templates.message = error instanceof Error ? error.message : 'Template check failed';
		}

		// Determine overall status
		const failedChecks = Object.values(checks).filter((check) => check.status === 'fail').length;
		let status: 'healthy' | 'degraded' | 'unhealthy';

		if (failedChecks === 0) {
			status = 'healthy';
		} else if (failedChecks === 1) {
			status = 'degraded';
		} else {
			status = 'unhealthy';
		}

		return {
			status,
			checks,
			timestamp: new Date().toISOString()
		};
	}

	/**
	 * Get recent performance trends.
	 * @param minutes Number of minutes to analyze.
	 * @returns Performance trend data.
	 */
	getPerformanceTrends(minutes: number = 15): {
		timeWindow: string;
		metrics: ReturnType<typeof performanceMonitor.getRecentMetrics>;
		summary: {
			totalOperations: number;
			avgDuration: number;
			errorRate: number;
			slowQueries: number;
		};
	} {
		const recentMetrics = performanceMonitor.getRecentMetrics(minutes);

		const totalOperations = recentMetrics.length;
		const avgDuration =
			totalOperations > 0
				? recentMetrics.reduce((sum, m) => sum + m.duration, 0) / totalOperations
				: 0;
		const errors = recentMetrics.filter((m) => !m.success).length;
		const errorRate = totalOperations > 0 ? (errors / totalOperations) * 100 : 0;
		const slowQueries = recentMetrics.filter((m) => m.duration > 100).length;

		return {
			timeWindow: `${minutes} minutes`,
			metrics: recentMetrics,
			summary: {
				totalOperations,
				avgDuration: Math.round(avgDuration * 100) / 100,
				errorRate: Math.round(errorRate * 100) / 100,
				slowQueries
			}
		};
	}

	/**
	 * Trigger cache warm-up manually.
	 * @returns Warm-up result.
	 */
	async warmUpCache(): Promise<{
		success: boolean;
		message: string;
		duration?: number;
	}> {
		const startTime = Date.now();

		try {
			await this.repository.warmUpCache();
			const duration = Date.now() - startTime;

			return {
				success: true,
				message: `Cache warmed up successfully in ${duration}ms`,
				duration
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : 'Cache warm-up failed'
			};
		}
	}
}

// Singleton instance
export const monitoringService = new MonitoringService();
