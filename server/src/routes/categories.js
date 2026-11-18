import { Router } from 'express';
import { prisma } from '../prisma.js';
import { categorySchema, dishSchema } from '../validators.js';
const router = Router();

router.get('/', async (req,res) => {
  const categories = await prisma.category.findMany({ orderBy:{name:'asc'}, include:{_count:{select:{dishes:true}}} });
  res.json(categories);
});
router.post('/', async (req,res) => {
  const data = categorySchema.parse(req.body);
  const category = await prisma.category.create({data});
  res.status(201).json(category);
});
router.get('/:id', async (req,res) => {
  const category = await prisma.category.findUniqueOrThrow({where:{id:req.params.id},include:{dishes:true}});
  res.json(category);
});
router.put('/:id', async (req,res) => {
  const data = categorySchema.parse(req.body);
  const category = await prisma.category.update({where:{id:req.params.id},data});
  res.json(category);
});
router.delete('/:id', async (req,res) => {
  const count = await prisma.dish.count({where:{categoryId:req.params.id}});
  if (count > 0) return res.status(409).json({message:'Não é possível excluir uma categoria que possui pratos cadastrados.'});
  await prisma.category.delete({where:{id:req.params.id}});
  res.status(204).send();
});
router.get('/:categoryId/dishes', async (req,res) => {
  const dishes = await prisma.dish.findMany({where:{categoryId:req.params.categoryId},orderBy:{name:'asc'}});
  res.json(dishes);
});
router.post('/:categoryId/dishes', async (req,res) => {
  const data = dishSchema.parse(req.body);
  await prisma.category.findUniqueOrThrow({where:{id:req.params.categoryId}});
  const dish = await prisma.dish.create({data:{...data,categoryId:req.params.categoryId}});
  res.status(201).json(dish);
});
export default router;
