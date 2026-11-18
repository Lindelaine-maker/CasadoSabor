import { Router } from 'express';
import { prisma } from '../prisma.js';
import { dishSchema } from '../validators.js';
import { requireAdmin } from '../auth.js';
const router = Router();
router.put('/:id', requireAdmin, async (req,res) => {
  const data = dishSchema.parse(req.body);
  const dish = await prisma.dish.update({where:{id:req.params.id},data});
  res.json(dish);
});
router.delete('/:id', requireAdmin, async (req,res) => {
  await prisma.dish.delete({where:{id:req.params.id}});
  res.status(204).send();
});
export default router;
