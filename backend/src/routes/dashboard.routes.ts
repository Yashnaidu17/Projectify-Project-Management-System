import { Router, Response } from 'express';
import { PrismaClient, TaskStatus, ProjectStatus } from '@prisma/client';
import { authenticate, AuthRequest } from '../middlewares/authenticate';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    const [
      totalProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      projectsInProgress
    ] = await Promise.all([
      prisma.project.count({ where: { ownerId: userId } }),
      prisma.task.count({ where: { project: { ownerId: userId } } }),
      prisma.task.count({ where: { project: { ownerId: userId }, status: TaskStatus.COMPLETED } }),
      prisma.task.count({ where: { project: { ownerId: userId }, status: TaskStatus.PENDING } }),
      prisma.project.count({ where: { ownerId: userId, status: ProjectStatus.IN_PROGRESS } }),
    ]);

    res.json({
      totalProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      projectsInProgress,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
