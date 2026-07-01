import {
  createDecisionTraceEntry,
  normalizeAgentRequest,
  type AgentRequest,
  type AgentRequestInput,
  type AgentResponse,
  type CouncilFlowStage,
  type DecisionOutcome,
  type DecisionTraceEntry,
} from "@/lib/ai/steelmind-os/protocol";
import {
  buildGuardianTraceEntry,
  evaluateGuardianPolicies,
  type GuardianDecision,
} from "@/lib/ai/steelmind-os/core/guardian-policy";
import type { SteelMemoryRepository } from "@/lib/ai/steelmind-os/core/steel-memory.repository";
import type { AgentRegistry, CouncilRuntimeAgent } from "@/lib/ai/steelmind-os/core/agent-registry";
import type { EventBus, SteelmindEvent } from "@/lib/ai/steelmind-os/core/event-bus";

export interface SpecialistAgentExecutionResult {
  status: DecisionOutcome;
  summary: string;
  actions?: AgentResponse["actions"];
  payload?: Record<string, unknown>;
  rationale?: string;
  confidence?: number;
}

export interface CouncilOrchestratorOptions {
  guardian?: (request: AgentRequest) => GuardianDecision;
  now?: () => string;
  idGenerator?: () => string;
}

function inferFlowStage(response: AgentResponse): CouncilFlowStage {
  const map: Partial<Record<AgentResponse["responder"], CouncilFlowStage>> = {
    architect: "architect",
    engineering: "engineering",
    qa: "qa",
    guardian: "guardian",
  };

  return map[response.responder] ?? "merge";
}

export class CouncilOrchestrator {
  constructor(
    private readonly registry: AgentRegistry,
    private readonly memory: SteelMemoryRepository,
    private readonly eventBus: EventBus,
    private readonly options: CouncilOrchestratorOptions = {},
  ) {}

  async route(input: AgentRequestInput): Promise<AgentResponse> {
    const now = this.options.now ?? (() => new Date().toISOString());
    const idGenerator = this.options.idGenerator ?? (() => crypto.randomUUID());
    const request = normalizeAgentRequest(input, { now, idGenerator });

    const start = Date.now();
    await this.publishAndPersistEvent({
      type: "request.intake",
      source: "runtime",
      requestId: request.requestId,
      correlationId: request.correlationId,
      payload: {
        capability: request.capability,
        target: request.target,
      },
    });

    const guardianDecision =
      this.options.guardian?.(request) ?? evaluateGuardianPolicies(request, { now });

    const baseEntries: DecisionTraceEntry[] = [
      createDecisionTraceEntry({
        decidedBy: "orchestrator",
        decidedAt: now(),
        outcome: "approved",
        rationale: "Orchestrator normalized request and started AI Council workflow.",
        references: request.context.references,
        confidence: 0.92,
      }),
      buildGuardianTraceEntry(guardianDecision),
    ];

    await this.publishAndPersistEvent({
      type: "guardian.checked",
      source: "guardian",
      requestId: request.requestId,
      correlationId: request.correlationId,
      status: guardianDecision.allowed ? "approved" : "refused",
      payload: {
        violations: guardianDecision.violations.map((item) => item.code),
      },
    });

    if (!guardianDecision.allowed) {
      const response = this.buildRefusalResponse(request, guardianDecision, baseEntries, now, idGenerator);
      await this.persistDecisionLifecycle(request, response, Date.now() - start);
      return response;
    }

    const specialist = this.registry.resolveByRequest(request);
    if (!specialist) {
      const response = this.buildNoSpecialistResponse(request, baseEntries, now, idGenerator);
      await this.persistDecisionLifecycle(request, response, Date.now() - start);
      return response;
    }

    await this.publishAndPersistEvent({
      type: "route.resolved",
      source: "orchestrator",
      requestId: request.requestId,
      correlationId: request.correlationId,
      payload: {
        specialist: specialist.id,
      },
    });

    const executionStart = Date.now();
    const specialistResult = await specialist.execute(request);
    const durationMs = Date.now() - executionStart;

    this.registry.recordExecution(specialist.id, {
      status: specialistResult.status,
      durationMs,
      at: now(),
    });

    const specialistTrace = createDecisionTraceEntry({
      decidedBy: specialist.id,
      decidedAt: now(),
      outcome: specialistResult.status,
      rationale:
        specialistResult.rationale ??
        `Specialist ${specialist.id} processed capability ${request.capability}.`,
      references: request.context.references,
      confidence: specialistResult.confidence ?? request.context.decision.minimumConfidence,
    });

    const entries = [...baseEntries, specialistTrace];
    const response: AgentResponse = {
      requestId: request.requestId,
      responder: specialist.id,
      status: specialistResult.status,
      summary: specialistResult.summary,
      actions: specialistResult.actions ?? request.actions,
      payload: specialistResult.payload,
      executionContext: request.context.execution,
      decisionContext: request.context.decision,
      createdAt: now(),
      decisionTrace: {
        traceId: idGenerator(),
        entries,
        finalDecision: {
          outcome: specialistResult.status,
          decidedBy: specialist.id,
          rationale: specialistTrace.rationale,
          confidence: specialistTrace.confidence,
        },
        assembledAt: now(),
      },
    };

    await this.publishAndPersistEvent({
      type: "agent.executed",
      source: specialist.id,
      requestId: request.requestId,
      correlationId: request.correlationId,
      status: specialistResult.status,
      durationMs,
      payload: {
        summary: specialistResult.summary,
      },
    });

    await this.persistDecisionLifecycle(request, response, Date.now() - start);
    return response;
  }

  private buildRefusalResponse(
    request: AgentRequest,
    guardianDecision: GuardianDecision,
    entries: DecisionTraceEntry[],
    now: () => string,
    idGenerator: () => string,
  ): AgentResponse {
    const refusalReason = guardianDecision.violations.map((item) => item.code).join(", ");
    return {
      requestId: request.requestId,
      responder: "guardian",
      status: "refused",
      summary: "Guardian refused request due to Constitution/policy violations.",
      refusalReason,
      actions: [],
      executionContext: request.context.execution,
      decisionContext: request.context.decision,
      createdAt: now(),
      decisionTrace: {
        traceId: idGenerator(),
        entries,
        finalDecision: {
          outcome: "refused",
          decidedBy: "guardian",
          rationale: "Guardian authority overrides routing when policy violations are found.",
          confidence: guardianDecision.confidence,
        },
        assembledAt: now(),
      },
    };
  }

  private buildNoSpecialistResponse(
    request: AgentRequest,
    entries: DecisionTraceEntry[],
    now: () => string,
    idGenerator: () => string,
  ): AgentResponse {
    const routingEntry = createDecisionTraceEntry({
      decidedBy: "orchestrator",
      decidedAt: now(),
      outcome: "needs_input",
      rationale:
        "No specialist agent matched requested target/capability. Council needs clarification.",
      references: request.context.references,
      confidence: 0.84,
    });

    const finalEntries = [...entries, routingEntry];
    return {
      requestId: request.requestId,
      responder: "orchestrator",
      status: "needs_input",
      summary: "No specialist could handle this request yet.",
      actions: [],
      executionContext: request.context.execution,
      decisionContext: request.context.decision,
      createdAt: now(),
      decisionTrace: {
        traceId: idGenerator(),
        entries: finalEntries,
        finalDecision: {
          outcome: "needs_input",
          decidedBy: "orchestrator",
          rationale: routingEntry.rationale,
          confidence: routingEntry.confidence,
        },
        assembledAt: now(),
      },
    };
  }

  private async persistDecisionLifecycle(
    request: AgentRequest,
    response: AgentResponse,
    durationMs: number,
  ) {
    await this.memory.saveDecision({
      request,
      response,
      flowStage: inferFlowStage(response),
      tags: ["foundation-v1"],
    });

    await this.memory.saveExecution({
      requestId: request.requestId,
      correlationId: request.correlationId,
      responder: response.responder,
      capability: request.capability,
      status: response.status,
      confidence: response.decisionTrace.finalDecision.confidence,
      durationMs,
      timestamp: response.createdAt,
    });

    await this.publishAndPersistEvent({
      type: response.status === "refused" ? "decision.blocked" : "decision.completed",
      source: response.responder,
      requestId: request.requestId,
      correlationId: request.correlationId,
      status: response.status,
      durationMs,
      payload: {
        summary: response.summary,
      },
    });
  }

  private async publishAndPersistEvent(
    event: Omit<SteelmindEvent, "id" | "timestamp">,
  ): Promise<void> {
    const emitted = this.eventBus.publish(event);
    await this.memory.saveEvent({
      requestId: emitted.requestId,
      correlationId: emitted.correlationId,
      type: emitted.type,
      source: emitted.source,
      status: emitted.status,
      timestamp: emitted.timestamp,
      payload: emitted.payload,
    });
  }
}

export type { CouncilRuntimeAgent as SpecialistAgent };
