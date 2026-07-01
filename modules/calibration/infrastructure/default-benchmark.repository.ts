import { InMemoryBenchmarkRepository } from "@/modules/calibration/infrastructure/in-memory-benchmark.repository";
import { SupabaseBenchmarkRepository } from "@/modules/calibration/infrastructure/supabase-benchmark.repository";
import { getSupabaseInfraClient } from "@/lib/persistence/supabase-client";
import type { BenchmarkRepository } from "@/modules/calibration/repository/benchmark.repository";

export function getDefaultBenchmarkRepository(): BenchmarkRepository {
  if (!getSupabaseInfraClient()) {
    return new InMemoryBenchmarkRepository();
  }
  return new SupabaseBenchmarkRepository();
}
