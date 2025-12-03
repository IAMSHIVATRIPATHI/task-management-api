import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { User } from '../users/entities/user.entity';
import { TaskStatus } from './dto/create-task.dto';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

const mockUser: User = {
  id: 1,
  username: 'Test User',
  password: 'password',
  tasks: [],
};

const mockTaskRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

describe('TasksService', () => {
  let service: TasksService;
  let repository: Repository<Task>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useFactory: mockTaskRepository,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    repository = module.get<Repository<Task>>(getRepositoryToken(Task));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTasks', () => {
    it('should return an array of tasks', async () => {
      const mockTasks: Task[] = [
        {
          id: 1,
          title: 'Test',
          description: 'Test Desc',
          status: TaskStatus.OPEN,
          user: mockUser,
        },
      ];
      (repository.find as jest.Mock).mockResolvedValue(mockTasks);

      const result = await service.getTasks(mockUser);
      expect(result).toEqual(mockTasks);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.find).toHaveBeenCalledWith({
        where: { user: { id: mockUser.id } },
      });
    });
  });

  describe('getTaskById', () => {
    it('should return a task', async () => {
      const mockTask: Task = {
        id: 1,
        title: 'Test',
        description: 'Test Desc',
        status: TaskStatus.OPEN,
        user: mockUser,
      };
      (repository.findOne as jest.Mock).mockResolvedValue(mockTask);

      const result = await service.getTaskById(1, mockUser);
      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException if task not found', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.getTaskById(1, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createTask', () => {
    it('should create and return a task', async () => {
      const createTaskDto = { title: 'Test', description: 'Desc' };
      const mockTask = {
        id: 1,
        ...createTaskDto,
        status: TaskStatus.OPEN,
        user: mockUser,
      };

      (repository.create as jest.Mock).mockReturnValue(mockTask);
      (repository.save as jest.Mock).mockResolvedValue(mockTask);

      const result = await service.createTask(createTaskDto, mockUser);
      expect(result).toEqual(
        expect.objectContaining({
          title: 'Test',
          description: 'Desc',
          status: TaskStatus.OPEN,
        }),
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.create).toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      (repository.delete as jest.Mock).mockResolvedValue({ affected: 1 });
      await service.deleteTask(1, mockUser);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.delete).toHaveBeenCalledWith({
        id: 1,
        user: { id: mockUser.id },
      });
    });

    it('should throw NotFoundException if task not found', async () => {
      (repository.delete as jest.Mock).mockResolvedValue({ affected: 0 });
      await expect(service.deleteTask(1, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateTaskStatus', () => {
    it('should update task status', async () => {
      const mockTask = {
        id: 1,
        title: 'Test',
        description: 'Desc',
        status: TaskStatus.OPEN,
        user: mockUser,
      };
      (repository.findOne as jest.Mock).mockResolvedValue(mockTask);
      (repository.save as jest.Mock).mockResolvedValue({
        ...mockTask,
        status: TaskStatus.DONE,
      });

      const result = await service.updateTaskStatus(
        1,
        TaskStatus.DONE,
        mockUser,
      );
      expect(result.status).toEqual(TaskStatus.DONE);
    });
  });
});
