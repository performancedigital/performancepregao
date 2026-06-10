-- AlterTable: adiciona prazo de encerramento de proposta (define "oportunidade aberta")
ALTER TABLE "Bidding" ADD COLUMN "closingDate" TIMESTAMP(3);

-- CreateIndex: acelera o filtro de licitacoes ativas
CREATE INDEX "Bidding_status_closingDate_idx" ON "Bidding"("status", "closingDate");
CREATE INDEX "Bidding_status_openingDate_idx" ON "Bidding"("status", "openingDate");
