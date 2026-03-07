// Performance monitoring utilities

/**
 * Performance metrics for database operations.
 */
export interface PerformanceMetrics {
	operation: string;
	duration: number;
	timestamp: Date;
	success: boolean;
	error?: string;
	metadata?: Record<string, unknown>;
}

/**
 * Performance monitoring and metrics collection for template operations.
 */
export class PerformanceMonitor {
	private metrics: PerformanceMetrics[] = [];
	private readonly maxMetrics = 1000; // Keep last 1000 metrics
	private readonly slowQueryThreshold = 100; // Log queries slower than 100ms

	/**
	 * Start timing an operation.
	 * @param operation The operation name.
	 * @param metadata Optional metadata for the operation.
	 * @returns A function to end the timing.
	 */
	startTiming(operation: string, metadata?: Record<string, unknown>): () => void {
		const startTime = Date.now();

		return () => {
			const duration = Date.now() - startTime;
			this.recordMetric({
				operation,
				duration,
				timestamp: new Date(),
				success: true,
				metadata
			});

			// Log slow queries
			if (duration > this.slowQueryThreshold) {
				console.warn(
					`[PerformanceMonitor] Slow operation: ${operation} took ${duration}ms`,
					metadata
				);
			}
		};
	}

	/**
	 * Record a failed operation.
	 * @param operation The operation name.
	 * @param error The error that occurred.
	 * @param duration The operation duration.
	 * @param metadata Optional metadata.
	 */
	recordError(
		operation: string,
		error: string,
		duration: number,
		metadata?: Record<string, unknown>
	): void {
		this.recordMetric({
			operation,
			duration,
			timestamp: new Date(),
			success: false,
			error,
			metadata
		});

		console.error(`[PerformanceMonitor] Failed operation: ${operation} (${duration}ms)`, {
			error,
			metadata
		});
	}

	/**
	 * Get performance statistics for a specific operation.
	 * @param operation The operation name to analyze.
	 * @returns Performance statistics.
	 */
	getOperationStats(operation: string): {
		count: number;
		successRate: number;
		avgDuration: number;
		minDuration: number;
		maxDuration: number;
		p95Duration: number;
		slowQueries: number;
	} {
		const operationMetrics = this.metrics.filter((m) => m.operation === operation);

		if (operationMetrics.length === 0) {
			return {
				count: 0,
				successRate: 0,
				avgDuration: 0,
				minDuration: 0,
				maxDuration: 0,
				p95Duration: 0,
				slowQueries: 0
			};
		}

		const durations = operationMetrics.map((m) => m.duration).sort((a, b) => a - b);
		const successCount = operationMetrics.filter((m) => m.success).length;
		const slowQueries = operationMetrics.filter((m) => m.duration > this.slowQueryThreshold).length;

		return {
			count: operationMetrics.length,
			successRate: (successCount / operationMetrics.length) * 100,
			avgDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
			minDuration: durations[0],
			maxDuration: durations[durations.length - 1],
			p95Duration: durations[Math.floor(durations.length * 0.95)],
			slowQueries
		};
	}

	/**
	 * Get overall performance summary.
	 * @returns Overall performance metrics.
	 */
	getOverallStats(): {
		totalOperations: number;
		overallSuccessRate: number;
		avgDuration: number;
		operationBreakdown: Record<string, ReturnType<PerformanceMonitor['getOperationStats']>>;
		recentErrors: PerformanceMetrics[];
	} {
		const totalOperations = this.metrics.length;
		const successCount = this.metrics.filter((m) => m.success).length;
		const durations = this.metrics.map((m) => m.duration);

		// Get unique operations
		const operations = [...new Set(this.metrics.map((m) => m.operation))];
		const operationBreakdown: Record<
			string,
			ReturnType<PerformanceMonitor['getOperationStats']>
		> = {};

		for (const operation of operations) {
			operationBreakdown[operation] = this.getOperationStats(operation);
		}

		// Get recent errors (last 10)
		const recentErrors = this.metrics
			.filter((m) => !m.success)
			.slice(-10)
			.reverse();

		return {
			totalOperations,
			overallSuccessRate: totalOperations > 0 ? (successCount / totalOperations) * 100 : 0,
			avgDuration:
				durations.length > 0 ? durations.reduce((sum, d) => sum + d, 0) / durations.length : 0,
			operationBreakdown,
			recentErrors
		};
	}

	/**
	 * Clear old metrics to prevent memory leaks.
	 */
	cleanup(): void {
		if (this.metrics.length > this.maxMetrics) {
			this.metrics = this.metrics.slice(-this.maxMetrics);
		}
	}

	/**
	 * Reset all metrics (useful for testing).
	 */
	resetStats(): void {
		this.metrics = [];
	}

	/**
	 * Get metrics for the last N minutes.
	 * @param minutes Number of minutes to look back.
	 * @returns Metrics from the specified time window.
	 */
	getRecentMetrics(minutes: number = 5): PerformanceMetrics[] {
		const cutoff = new Date(Date.now() - minutes * 60 * 1000);
		return this.metrics.filter((m) => m.timestamp >= cutoff);
	}

	/**
	 * Export metrics for external monitoring systems.
	 * @returns Formatted metrics for export.
	 */
	exportMetrics(): {
		timestamp: string;
		metrics: {
			template_operations_total: number;
			template_operations_success_rate: number;
			template_operations_avg_duration_ms: number;
			template_cache_hit_rate?: number;
			template_slow_queries_total: number;
		};
		operations: Record<
			string,
			{
				count: number;
				success_rate: number;
				avg_duration_ms: number;
				p95_duration_ms: number;
			}
		>;
	} {
		const stats = this.getOverallStats();
		const operations: Record<
			string,
			{
				count: number;
				success_rate: number;
				avg_duration_ms: number;
				p95_duration_ms: number;
			}
		> = {};

		for (const [operation, opStats] of Object.entries(stats.operationBreakdown)) {
			operations[operation] = {
				count: opStats.count,
				success_rate: opStats.successRate,
				avg_duration_ms: opStats.avgDuration,
				p95_duration_ms: opStats.p95Duration
			};
		}

		return {
			timestamp: new Date().toISOString(),
			metrics: {
				template_operations_total: stats.totalOperations,
				template_operations_success_rate: stats.overallSuccessRate,
				template_operations_avg_duration_ms: stats.avgDuration,
				template_slow_queries_total: this.metrics.filter(
					(m) => m.duration > this.slowQueryThreshold
				).length
			},
			operations
		};
	}

	/**
	 * Record a metric.
	 * @param metric The metric to record.
	 */
	private recordMetric(metric: PerformanceMetrics): void {
		this.metrics.push(metric);

		// Cleanup old metrics periodically
		if (this.metrics.length % 100 === 0) {
			this.cleanup();
		}
	}
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Note: Decorator functionality removed due to TypeScript compatibility issues
// Use manual timing with performanceMonitor.startTiming() instead
