#!/usr/bin/env node
/**
 * Aksaventra CBT Concurrent User Capacity Benchmark (Developer QA / Staging Only)
 *
 * Measures throughput (req/s), status distribution, and p50/p95/p99 latency
 * against a local or staging instance.
 *
 * Usage:
 *   node scripts/benchmark-concurrent.mjs
 *   BASE_URL=http://127.0.0.1:3000 CONCURRENCY=100 DURATION_SEC=15 node scripts/benchmark-concurrent.mjs
 */

const BASE_URL = (process.env.BASE_URL || "http://127.0.0.1:3000").replace(
  /\/+$/,
  "",
);
const TARGET_PATH = process.env.TARGET_PATH || "/api/health";
const CONCURRENCY = Math.min(
  500,
  Math.max(1, Number.parseInt(process.env.CONCURRENCY || "50", 10) || 50),
);
const DURATION_SEC = Math.min(
  120,
  Math.max(3, Number.parseInt(process.env.DURATION_SEC || "10", 10) || 10),
);
const REQUEST_TIMEOUT_MS = Math.max(
  1000,
  Number.parseInt(process.env.REQUEST_TIMEOUT_MS || "10000", 10) || 10000,
);

const targetUrl = `${BASE_URL}${TARGET_PATH.startsWith("/") ? TARGET_PATH : `/${TARGET_PATH}`}`;

const latencies = [];
const statusCounts = new Map();
let networkErrors = 0;
let totalRequests = 0;

function percentile(sorted, p) {
  if (sorted.length === 0) return 0;
  const idx = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil((p / 100) * sorted.length) - 1),
  );
  return sorted[idx];
}

async function runWorker(endTimeMs) {
  while (Date.now() < endTimeMs) {
    const started = performance.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch(targetUrl, {
        method: "GET",
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      await res.arrayBuffer();
      const elapsedMs = performance.now() - started;
      latencies.push(elapsedMs);
      totalRequests += 1;
      statusCounts.set(res.status, (statusCounts.get(res.status) || 0) + 1);
    } catch {
      networkErrors += 1;
      totalRequests += 1;
    } finally {
      clearTimeout(timer);
    }
  }
}

async function main() {
  console.log("=== Aksaventra CBT Concurrent Capacity Benchmark ===");
  console.log(`Target       : ${targetUrl}`);
  console.log(`Concurrency  : ${CONCURRENCY} virtual users`);
  console.log(`Duration     : ${DURATION_SEC}s`);
  console.log("Running...\n");

  const startMs = Date.now();
  const endTimeMs = startMs + DURATION_SEC * 1000;

  await Promise.all(
    Array.from({ length: CONCURRENCY }, () => runWorker(endTimeMs)),
  );

  const actualDurationSec = Math.max(0.001, (Date.now() - startMs) / 1000);
  latencies.sort((a, b) => a - b);

  const rps = totalRequests / actualDurationSec;
  const ok2xx = Array.from(statusCounts.entries())
    .filter(([code]) => code >= 200 && code < 300)
    .reduce((acc, [, count]) => acc + count, 0);
  const errorRate =
    totalRequests > 0 ? ((totalRequests - ok2xx) / totalRequests) * 100 : 0;

  console.log("=== Benchmark Summary ===");
  console.log(`Total Requests : ${totalRequests}`);
  console.log(`Throughput     : ${rps.toFixed(1)} req/s`);
  console.log(`Success (2xx)  : ${ok2xx}`);
  console.log(`Network Errors : ${networkErrors}`);
  console.log(`Error Rate     : ${errorRate.toFixed(2)}%`);
  console.log(`Latency p50    : ${percentile(latencies, 50).toFixed(1)} ms`);
  console.log(`Latency p95    : ${percentile(latencies, 95).toFixed(1)} ms`);
  console.log(`Latency p99    : ${percentile(latencies, 99).toFixed(1)} ms`);
  console.log("Status Codes   :", Object.fromEntries(statusCounts.entries()));
}

main().catch((err) => {
  console.error("Benchmark failed:", err);
  process.exit(1);
});
