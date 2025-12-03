import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { TaskStatus } from '../src/tasks/dto/create-task.dto';
import * as http from 'http';

interface AuthResponse {
  accessToken: string;
}

interface TaskResponse {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
}

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let httpServer: http.Server;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    httpServer = app.getHttpServer() as http.Server;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(httpServer).get('/').expect(200).expect('Hello World!');
  });

  describe('Auth', () => {
    const randomSuffix = Math.random().toString(36).substring(7);
    const uniqueUser = `user_${randomSuffix}`;

    it('/auth/signup (POST) - success', async () => {
      return request(httpServer)
        .post('/auth/signup')
        .send({ username: uniqueUser, password: 'password123' })
        .expect(201);
    });

    it('/auth/signup (POST) - duplicate user', async () => {
      // First create user if not exists (in case tests run in isolation)
      // But since we use uniqueUser, we can rely on previous test or create a new one.
      // Let's create another unique user for this test specifically.
      const dupUser = `dup_${randomSuffix}`;
      await request(httpServer)
        .post('/auth/signup')
        .send({ username: dupUser, password: 'password123' })
        .expect(201);

      return request(httpServer)
        .post('/auth/signup')
        .send({ username: dupUser, password: 'password123' })
        .expect(409);
    });

    it('/auth/signin (POST) - success', async () => {
      const signinUser = `signin_${randomSuffix}`;
      await request(httpServer)
        .post('/auth/signup')
        .send({ username: signinUser, password: 'password123' })
        .expect(201);

      const response = await request(httpServer)
        .post('/auth/signin')
        .send({ username: signinUser, password: 'password123' })
        .expect(201);

      expect((response.body as AuthResponse).accessToken).toBeDefined();
    });

    it('/auth/signin (POST) - fail', async () => {
      return request(httpServer)
        .post('/auth/signin')
        .send({ username: 'wronguser', password: 'password123' })
        .expect(401);
    });
  });

  describe('Tasks', () => {
    let accessToken: string;
    const randomSuffix = Math.random().toString(36).substring(7);

    it('should allow CRUD operations for authenticated user', async () => {
      // 1. Sign up and Login
      const username = `taskuser_${randomSuffix}`;
      await request(httpServer)
        .post('/auth/signup')
        .send({ username, password: 'password123' });

      const loginRes = await request(httpServer)
        .post('/auth/signin')
        .send({ username, password: 'password123' });

      accessToken = (loginRes.body as AuthResponse).accessToken;

      // 2. Create Task
      const createRes = await request(httpServer)
        .post('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'My Task', description: 'Description' })
        .expect(201);

      const task = createRes.body as TaskResponse;
      const taskId = task.id;
      expect(task.title).toBe('My Task');
      expect(task.status).toBe('OPEN');

      // 3. Get Tasks
      const getRes = await request(httpServer)
        .get('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const tasks = getRes.body as TaskResponse[];
      expect(tasks.length).toBeGreaterThan(0);
      expect(tasks[0].title).toBe('My Task');

      // 4. Update Task Status
      const updateRes = await request(httpServer)
        .patch(`/tasks/${taskId}/status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'DONE' })
        .expect(200);

      expect((updateRes.body as TaskResponse).status).toBe('DONE');

      // 5. Delete Task
      await request(httpServer)
        .delete(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // 6. Verify Deletion
      await request(httpServer)
        .get(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('should fail for unauthenticated user', async () => {
      await request(httpServer).get('/tasks').expect(401);
    });
  });
});
