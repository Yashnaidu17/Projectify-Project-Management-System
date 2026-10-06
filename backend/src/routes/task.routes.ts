import { Router, Response } from 'express';
import { PrismaClient, TaskStatus, TaskPriority } from '@prisma/client';
import { authenticate, AuthRequest } from '../middlewares/authenticate';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, status, priority, projectId } = req.query;
    
    // Ensure the user owns the tasks they are querying (by checking project ownerId)
    const tasks = await prisma.task.findMany({
      where: {
        project: { ownerId: req.userId },
        ...(projectId ? { projectId: projectId as string } : {}),
        ...(name ? { name: { contains: name as string, mode: 'insensitive' } } : {}),
        ...(status ? { status: status as TaskStatus } : {}),
        ...(priority ? { priority: priority as TaskPriority } : {}),
      },
      include: {
        project: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id as string },
      include: { project: true }
    });
    
    if (!task || task.project.ownerId !== req.userId) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, priority, status, dueDate, projectId } = req.body;
    
    if (!name || !projectId) {
      res.status(400).json({ message: 'Name and projectId are required' });
      return;
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project || project.ownerId !== req.userId) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }
    
    const task = await prisma.task.create({
      data: {
        name,
        description,
        priority: priority || TaskPriority.MEDIUM,
        status: status || TaskStatus.PENDING,
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
      }
    });
    
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, priority, status, dueDate } = req.body;
    
    const existingTask = await prisma.task.findUnique({
      where: { id: req.params.id as string },
      include: { project: true }
    });
    
    if (!existingTask || existingTask.project.ownerId !== req.userId) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    
    const task = await prisma.task.update({
      where: { id: req.params.id as string },
      data: {
        name: name !== undefined ? name : existingTask.name,
        description: description !== undefined ? description : existingTask.description,
        priority: priority !== undefined ? priority : existingTask.priority,
        status: status !== undefined ? status : existingTask.status,
        dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : existingTask.dueDate,
      }
    });
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const existingTask = await prisma.task.findUnique({
      where: { id: req.params.id as string },
      include: { project: true }
    });
    
    if (!existingTask || existingTask.project.ownerId !== req.userId) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    
    await prisma.task.delete({
      where: { id: req.params.id as string }
    });
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
