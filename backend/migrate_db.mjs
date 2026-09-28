import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const companies = await prisma.company.findMany();
  for (const company of companies) {
    const stagesCount = await prisma.pipelineStage.count({ where: { companyId: company.id } });
    if (stagesCount === 0) {
      console.log('Creando etapas para', company.name);
      const stage1 = await prisma.pipelineStage.create({ data: { name: 'Nuevo Prospecto', color: 'blue', order: 0, companyId: company.id } });
      const stage2 = await prisma.pipelineStage.create({ data: { name: 'Contactado', color: 'yellow', order: 1, companyId: company.id } });
      const stage3 = await prisma.pipelineStage.create({ data: { name: 'Propuesta', color: 'orange', order: 2, companyId: company.id } });
      const stage4 = await prisma.pipelineStage.create({ data: { name: 'Ganado', color: 'green', order: 3, companyId: company.id } });
      const stage5 = await prisma.pipelineStage.create({ data: { name: 'Perdido', color: 'red', order: 4, companyId: company.id } });
      
      await prisma.client.updateMany({ where: { companyId: company.id, estado_lead: 'lead_nuevo' }, data: { estado_lead: stage1.id } });
      await prisma.client.updateMany({ where: { companyId: company.id, estado_lead: 'en_contacto' }, data: { estado_lead: stage2.id } });
      await prisma.client.updateMany({ where: { companyId: company.id, estado_lead: 'propuesta' }, data: { estado_lead: stage3.id } });
      await prisma.client.updateMany({ where: { companyId: company.id, estado_lead: 'ganado' }, data: { estado_lead: stage4.id } });
      await prisma.client.updateMany({ where: { companyId: company.id, estado_lead: 'perdido' }, data: { estado_lead: stage5.id } });
    }
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
