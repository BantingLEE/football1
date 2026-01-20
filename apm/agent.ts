import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston';
import { MongoDBInstrumentation } from '@opentelemetry/instrumentation-mongodb';
import { RedisInstrumentation } from '@opentelemetry/instrumentation-redis';
import { IoRedisInstrumentation } from '@opentelemetry/instrumentation-ioredis';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';
import { metrics } from '@opentelemetry/api';
import { MeterProvider } from '@opentelemetry/sdk-metrics';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';

export function initAPM(serviceName: string) {
  const resource = Resource.default().merge(
    new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
      [SemanticResourceAttributes.SERVICE_VERSION]: process.env.SERVICE_VERSION || '1.0.0',
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
    })
  );

  const provider = new NodeTracerProvider({ resource });
  const exporter = process.env.JAEGER_ENDPOINT
    ? new JaegerExporter({ endpoint: process.env.JAEGER_ENDPOINT })
    : new ConsoleSpanExporter();

  provider.addSpanProcessor(new BatchSpanProcessor(exporter));
  provider.register();

  registerInstrumentations({
    tracerProvider: provider,
    instrumentations: [
      new HttpInstrumentation(),
      new ExpressInstrumentation(),
      new MongoDBInstrumentation(),
      new RedisInstrumentation(),
      new IoRedisInstrumentation(),
    ],
  });

  if (process.env.ENABLE_PROMETHEUS === 'true') {
    const prometheusPort = parseInt(process.env.PROMETHEUS_PORT || '9464', 10);
    const metricExporter = new PrometheusExporter({ port: prometheusPort });

    const meterProvider = new MeterProvider({ resource });
    metrics.setGlobalMeterProvider(meterProvider);

    metricExporter.startServer().then(() => {
      console.log(`Prometheus metrics server started on port ${prometheusPort}`);
    });
  }

  console.log(`APM initialized for service: ${serviceName}`);
}

export function initErrorTracking(serviceName: string) {
  if (process.env.DATADOG_API_KEY) {
    console.log('DataDog error tracking would be initialized here');
  }
  if (process.env.SENTRY_DSN) {
    console.log('Sentry error tracking would be initialized here');
  }
}
