import { Router, Response } from 'express';
import { PrismaClient, ProjectStatus } from '@prisma/client';
import { authenticate, AuthRequest } from '../middlewares/authenticate';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, status } = req.query;
    
    const projects = await prisma.project.findMany({
      where: {
        ownerId: req.userId,
        ...(name ? { name: { contains: name as string, mode: 'insensitive' } } : {}),
        ...(status ? { status: status as ProjectStatus } : {}),
      },
      include: {
        _count: {
          select: { tasks: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id as string },
      include: { tasks: true }
    });
    
    if (!project || project.ownerId !== req.userId) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, status, startDate, endDate } = req.body;
    
    if (!name) {
      res.status(400).json({ message: 'Name is required' });
      return;
    }
    
    const project = await prisma.project.create({
      data: {
        name,
        description,
        status: status || ProjectStatus.NOT_STARTED,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        ownerId: req.userId!,
      }
    });
    
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, status, startDate, endDate } = req.body;
    
    const existingProject = await prisma.project.findUnique({
      where: { id: req.params.id as string }
    });
    
    if (!existingProject || existingProject.ownerId !== req.userId) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }
    
    const project = await prisma.project.update({
      where: { id: req.params.id as string },
      data: {
        name: name !== undefined ? name : existingProject.name,
        description: description !== undefined ? description : existingProject.description,
        status: status !== undefined ? status : existingProject.status,
        startDate: startDate !== undefined ? (startDate ? new Date(startDate) : null) : existingProject.startDate,
        endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : existingProject.endDate,
      }
    });
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const existingProject = await prisma.project.findUnique({
      where: { id: req.params.id as string }
    });
    
    if (!existingProject || existingProject.ownerId !== req.userId) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }
    
    await prisma.project.delete({
      where: { id: req.params.id as string }
    });
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
