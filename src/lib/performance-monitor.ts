// Simple performance monitoring utility
class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  private isEnabled = false;

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  enable() {
    this.isEnabled = true;
    console.log('Performance monitoring enabled');
  }

  disable() {
    this.isEnabled = false;
    console.log('Performance monitoring disabled');
  }

  startTimer(label: string): () => void {
    if (!this.isEnabled) return () => {};
    
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      if (!this.metrics.has(label)) {
        this.metrics.set(label, []);
      }
      this.metrics.get(label)!.push(duration);
      
      // Log if duration is concerning (>100ms)
      if (duration > 100) {
        console.warn(`Performance warning: ${label} took ${duration.toFixed(2)}ms`);
      }
    };
  }

  getMetrics(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const result: Record<string, { avg: number; min: number; max: number; count: number }> = {};
    
    for (const [label, values] of this.metrics.entries()) {
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);
      
      result[label] = {
        avg: Math.round(avg * 100) / 100,
        min: Math.round(min * 100) / 100,
        max: Math.round(max * 100) / 100,
        count: values.length
      };
    }
    
    return result;
  }

  logMetrics() {
    if (!this.isEnabled) return;
    
    const metrics = this.getMetrics();
    console.log('Performance Metrics:', metrics);
  }

  clear() {
    this.metrics.clear();
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

// Enable in development mode
if (import.meta.env.DEV) {
  performanceMonitor.enable();
} 