import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const pratos = await prisma.category.upsert({ where:{name:'Pratos feitos'}, update:{}, create:{name:'Pratos feitos'} });
  const bebidas = await prisma.category.upsert({ where:{name:'Bebidas'}, update:{}, create:{name:'Bebidas'} });
  const sobremesas = await prisma.category.upsert({ where:{name:'Sobremesas'}, update:{}, create:{name:'Sobremesas'} });
  const examples = [
    {name:'Frango grelhado',description:'Arroz, feijão, salada fresca e frango grelhado.',price:'22.90',categoryId:pratos.id},
    {name:'Carne de panela',description:'Carne macia ao molho caseiro, arroz, feijão e legumes.',price:'25.90',categoryId:pratos.id},
    {name:'Suco natural',description:'Suco preparado com frutas da estação.',price:'7.00',categoryId:bebidas.id},
    {name:'Pudim de leite',description:'Pudim artesanal com calda de caramelo.',price:'8.50',categoryId:sobremesas.id}
  ];
  for (const item of examples) {
    const exists = await prisma.dish.findFirst({where:{name:item.name,categoryId:item.categoryId}});
    if (!exists) await prisma.dish.create({data:item});
  }
}
main().then(()=>console.log('Dados iniciais criados.')).catch(e=>{console.error(e);process.exit(1)}).finally(()=>prisma.$disconnect());
