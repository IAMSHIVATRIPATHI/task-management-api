import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TaskStatus } from './dto/create-task.dto';
import { User } from '../users/entities/user.entity';
import { Task } from './entities/task.entity';

const mockUser: User = {
  id: 1,
  username: 'Test User',
  password: 'password',
  tasks: [],
};

// A simple factory for our mock service.
const mockTasksService = {
  getTasks: jest.fn(),
  getTaskById: jest.fn(),
  createTask: jest.fn(),
  deleteTask: jest.fn(),
  updateTaskStatus: jest.fn(),
};

describe('TasksController', () => {
  let controller: TasksController;
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTasks', () => {
    it('should return tasks', async () => {
      const mockTasks: Task[] = [
        {
          id: 1,
          title: 'Test',
          description: 'Desc',
          status: TaskStatus.OPEN,
          user: mockUser,
        },
      ];
      (service.getTasks as jest.Mock).mockResolvedValue(mockTasks);
      const result = await controller.getTasks(mockUser);
      expect(result).toEqual(mockTasks);
    });
  });

  describe('getTaskById', () => {
    it('should return a task', async () => {
      const mockTask: Task = {
        id: 1,
        title: 'Test',
        description: 'Desc',
        status: TaskStatus.OPEN,
        user: mockUser,
      };
      (service.getTaskById as jest.Mock).mockResolvedValue(mockTask);
      const result = await controller.getTaskById(1, mockUser);
      expect(result).toEqual(mockTask);
    });
  });

  describe('createTask', () => {
    it('should create a task', async () => {
      const dto = { title: 'Test', description: 'Desc' };
      const resultTask = { id: 1, ...dto, status: TaskStatus.OPEN };
      (service.createTask as jest.Mock).mockResolvedValue(resultTask as Task);

      const result = await controller.createTask(dto, mockUser);
      expect(result).toEqual(resultTask);
      expect(mockTasksService.createTask).toHaveBeenCalledWith(dto, mockUser);
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      (service.deleteTask as jest.Mock).mockResolvedValue(undefined);
      await controller.deleteTask(1, mockUser);
      expect(mockTasksService.deleteTask).toHaveBeenCalledWith(1, mockUser);
    });
  });

  describe('updateTaskStatus', () => {
    it('should update status', async () => {
      const mockTask = { id: 1, status: TaskStatus.DONE };
      (service.updateTaskStatus as jest.Mock).mockResolvedValue(
        mockTask as Task,
      );

      const result = await controller.updateTaskStatus(
        1,
        { status: TaskStatus.DONE },
        mockUser,
      );
      expect(result).toEqual(mockTask);
      expect(mockTasksService.updateTaskStatus).toHaveBeenCalledWith(
        1,
        TaskStatus.DONE,
        mockUser,
      );
    });
  });
});
