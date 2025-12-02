import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { User } from '../users/entities/user.entity';
import { TaskStatus } from './dto/create-task.dto';
import { NotFoundException } from '@nestjs/common';

const mockUser: User = { id: 1, username: 'Test User', password: 'password', tasks: [] };

describe('TasksService', () => {
  let service: TasksService;
  let mockRepository;

  beforeEach(async () => {
    mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTasks', () => {
    it('should return an array of tasks', async () => {
      const mockTasks = [{ id: 1, title: 'Test', description: 'Test Desc', status: TaskStatus.OPEN }];
      mockRepository.find.mockResolvedValue(mockTasks);

      const result = await service.getTasks(mockUser);
      expect(result).toEqual(mockTasks);
      expect(mockRepository.find).toHaveBeenCalledWith({ where: { user: { id: mockUser.id } } });
    });
  });

  describe('getTaskById', () => {
    it('should return a task', async () => {
      const mockTask = { id: 1, title: 'Test', description: 'Test Desc', status: TaskStatus.OPEN };
      mockRepository.findOne.mockResolvedValue(mockTask);

      const result = await service.getTaskById(1, mockUser);
      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException if task not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.getTaskById(1, mockUser)).rejects.toThrow(NotFoundException);
    });
  });

  describe('createTask', () => {
    it('should create and return a task', async () => {
      const createTaskDto = { title: 'Test', description: 'Desc' };
      const mockTask = { id: 1, ...createTaskDto, status: TaskStatus.OPEN, user: mockUser };
      
      mockRepository.create.mockReturnValue(mockTask);
      mockRepository.save.mockResolvedValue(mockTask);

      const result = await service.createTask(createTaskDto, mockUser);
      expect(result).toEqual(expect.objectContaining({
          title: 'Test',
          description: 'Desc',
          status: TaskStatus.OPEN,
      }));
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });
      await service.deleteTask(1, mockUser);
      expect(mockRepository.delete).toHaveBeenCalledWith({ id: 1, user: { id: mockUser.id } });
    });

    it('should throw NotFoundException if task not found', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 0 });
      await expect(service.deleteTask(1, mockUser)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateTaskStatus', () => {
      it('should update task status', async () => {
          const mockTask = { id: 1, title: 'Test', description: 'Desc', status: TaskStatus.OPEN, user: mockUser };
          mockRepository.findOne.mockResolvedValue(mockTask);
          mockRepository.save.mockResolvedValue({ ...mockTask, status: TaskStatus.DONE });

          const result = await service.updateTaskStatus(1, TaskStatus.DONE, mockUser);
          expect(result.status).toEqual(TaskStatus.DONE);
      });
  });
});
