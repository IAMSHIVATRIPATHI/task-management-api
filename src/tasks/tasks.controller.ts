import { Controller, Get, Post, Body, Param, Delete, Patch, UseGuards, ValidationPipe, ParseIntPipe, UsePipes } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TasksService } from './tasks.service';
import { CreateTaskDto, TaskStatus, UpdateTaskStatusDto } from './dto/create-task.dto';
import { User } from '../users/entities/user.entity';
import { GetUser } from '../auth/get-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('tasks')
@UseGuards(AuthGuard('jwt'))
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tasks for the logged-in user' })
  getTasks(@GetUser() user: User) {
    return this.tasksService.getTasks(user);
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get a task by ID' })
  getTaskById(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.tasksService.getTaskById(id, user);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @UsePipes(ValidationPipe)
  createTask(@Body() createTaskDto: CreateTaskDto, @GetUser() user: User) {
    return this.tasksService.createTask(createTaskDto, user);
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Delete a task' })
  deleteTask(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.tasksService.deleteTask(id, user);
  }

  @Patch('/:id/status')
  @ApiOperation({ summary: 'Update task status' })
  updateTaskStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateTaskStatusDto: UpdateTaskStatusDto,
    @GetUser() user: User,
  ) {
    const { status } = updateTaskStatusDto;
    return this.tasksService.updateTaskStatus(id, status, user);
  }
}
