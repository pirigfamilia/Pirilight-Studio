import { describe, expect, it } from "vitest";

import { buildMockData, TEST_TODAY } from "@/lib/mock";
import { BUSINESS_IDS } from "@/lib/mock/businesses";
import { DEAL_IDS } from "@/lib/mock/deals";
import type { Deal, Project } from "@/types";

import {
  computeDealFollowUp,
  deriveBusinessOverallStatus,
  deriveResponsibleUserId,
  getBusinessOverview,
  getBusinessSummaries,
  getCommercialPipeline,
  pickOpenDeal,
} from "./business-overview";

const audit = { createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" };

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: "proj-1",
    businessId: "biz-1",
    dealId: null,
    type: "website",
    name: "Projeto",
    status: "in_progress",
    waitingReason: null,
    startDate: "2026-01-01",
    launchDate: null,
    ...audit,
    ...overrides,
  };
}

function makeDeal(overrides: Partial<Deal> = {}): Deal {
  return {
    id: "deal-1",
    businessId: "biz-1",
    title: "Oportunidade",
    stage: "contacted",
    value: 500,
    responsibleUserId: "bino",
    nextAction: "Ligar",
    nextActionDate: "2026-03-30",
    lastInteractionDate: "2026-03-25",
    expectedCloseDate: null,
    ...audit,
    ...overrides,
  };
}

describe("deriveBusinessOverallStatus", () => {
  it("um bloqueio pesa mais do que qualquer outro estado", () => {
    expect(
      deriveBusinessOverallStatus([
        makeProject({ status: "in_progress" }),
        makeProject({ id: "p2", status: "blocked" }),
      ]),
    ).toBe("blocked");
  });

  it("à espera do cliente pesa mais do que em progresso", () => {
    expect(
      deriveBusinessOverallStatus([
        makeProject({ status: "in_progress" }),
        makeProject({ id: "p2", status: "waiting_on_client" }),
      ]),
    ).toBe("waiting_on_client");
  });

  it("tudo concluído dá 'done'", () => {
    expect(deriveBusinessOverallStatus([makeProject({ status: "done" })])).toBe("done");
  });

  it("sem projetos dá 'none'", () => {
    expect(deriveBusinessOverallStatus([])).toBe("none");
  });
});

describe("deriveResponsibleUserId / pickOpenDeal", () => {
  it("escolhe o deal atualizado mais recentemente", () => {
    const deals = [
      makeDeal({ id: "d1", responsibleUserId: "sny", updatedAt: "2026-01-01T00:00:00.000Z" }),
      makeDeal({ id: "d2", responsibleUserId: "bino", updatedAt: "2026-03-01T00:00:00.000Z" }),
    ];
    expect(deriveResponsibleUserId(deals)).toBe("bino");
  });

  it("sem deals devolve null", () => {
    expect(deriveResponsibleUserId([])).toBeNull();
  });

  it("pickOpenDeal ignora deals fechados", () => {
    const deals = [
      makeDeal({ id: "d1", stage: "won", updatedAt: "2026-03-05T00:00:00.000Z" }),
      makeDeal({ id: "d2", stage: "negotiating", updatedAt: "2026-01-01T00:00:00.000Z" }),
    ];
    expect(pickOpenDeal(deals)?.id).toBe("d2");
  });

  it("sem deals abertos devolve null mesmo havendo deals fechados", () => {
    expect(pickOpenDeal([makeDeal({ stage: "lost" })])).toBeNull();
  });
});

describe("computeDealFollowUp", () => {
  const TODAY = "2026-03-29";

  it("deal fechado nunca tem urgência", () => {
    expect(computeDealFollowUp(makeDeal({ stage: "won", nextActionDate: "2026-01-01" }), TODAY)).toEqual(
      { urgency: null, daysDelta: null },
    );
  });

  it("mostra sempre o daysDelta quando há data, mesmo fora da janela de 7 dias", () => {
    const result = computeDealFollowUp(makeDeal({ nextActionDate: "2026-04-18" }), TODAY); // +20
    expect(result.urgency).toBeNull();
    expect(result.daysDelta).toBe(20);
  });

  it("dentro da janela devolve a urgência real", () => {
    expect(computeDealFollowUp(makeDeal({ nextActionDate: "2026-03-29" }), TODAY).urgency).toBe(
      "due_today",
    );
  });

  it("sem próxima ação e sem contacto recente fica stalled", () => {
    const result = computeDealFollowUp(
      makeDeal({ nextAction: null, nextActionDate: null, lastInteractionDate: "2026-03-08" }),
      TODAY,
    );
    expect(result.urgency).toBe("stalled");
  });

  it("sem próxima ação mas com contacto recente não tem urgência", () => {
    const result = computeDealFollowUp(
      makeDeal({ nextAction: null, nextActionDate: null, lastInteractionDate: "2026-03-27" }),
      TODAY,
    );
    expect(result).toEqual({ urgency: null, daysDelta: null });
  });
});

describe("sobre a mock real", () => {
  const data = buildMockData(TEST_TODAY);

  it("getCommercialPipeline inclui todos os deals, incluindo ganhos e perdidos", async () => {
    const cards = await getCommercialPipeline(TEST_TODAY);
    expect(cards).toHaveLength(data.deals.length);
    expect(cards.some((c) => c.deal.stage === "won")).toBe(true);
    expect(cards.some((c) => c.deal.stage === "lost")).toBe(true);
  });

  it("getBusinessSummaries devolve exatamente um resumo por negócio", async () => {
    const summaries = await getBusinessSummaries(data.businesses, TEST_TODAY);
    expect(summaries).toHaveLength(data.businesses.length);
  });

  it("o resumo do Boi na Brasa reflete a espera por fotografias e o pagamento parcial", async () => {
    const [summary] = await getBusinessSummaries(
      data.businesses.filter((b) => b.id === BUSINESS_IDS.boiNaBrasa),
      TEST_TODAY,
    );
    expect(summary).toMatchObject({
      overallStatus: "waiting_on_client",
      hasWebsite: true,
      hasPiriCard: true,
    });
    expect(summary?.paymentSummary.remainingValue).toBeGreaterThan(0);
    expect(summary?.nextRenewal).not.toBeNull();
  });

  it("getBusinessOverview devolve null para um id inexistente", async () => {
    expect(await getBusinessOverview("biz-inexistente", TEST_TODAY)).toBeNull();
  });

  it("getBusinessOverview do Talho do Bairro mostra o projeto bloqueado e o pagamento em atraso", async () => {
    const overview = await getBusinessOverview(BUSINESS_IDS.talho, TEST_TODAY);
    expect(overview).not.toBeNull();
    expect(overview?.overallStatus).toBe("blocked");
    expect(overview?.paymentSummary.hasOverdue).toBe(true);
    expect(overview?.openDeal).toBeNull(); // o único deal do Talho está 'lost'
    expect(overview?.deals.map((d) => d.id)).toContain(DEAL_IDS.talhoLost);
  });

  it("os projetos do overview já vêm com o detalhe (website/piricard) junto", async () => {
    const overview = await getBusinessOverview(BUSINESS_IDS.boiNaBrasa, TEST_TODAY);
    const websiteProject = overview?.projects.find((p) => p.project.type === "website");
    const cardProject = overview?.projects.find((p) => p.project.type === "piricard");

    expect(websiteProject?.website).not.toBeNull();
    expect(websiteProject?.piriCard).toBeNull();
    expect(cardProject?.piriCard).not.toBeNull();
  });
});
