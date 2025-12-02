import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  describe('Auth', () => {
    const randomSuffix = Math.random().toString(36).substring(7);
    const uniqueUser = `user_${randomSuffix}`;

    it('/auth/signup (POST) - success', async () => {
        return request(app.getHttpServer())
            .post('/auth/signup')
            .send({ username: uniqueUser, password: 'password123' })
            .expect(201);
    });

    it('/auth/signup (POST) - duplicate user', async () => {
        // First create user if not exists (in case tests run in isolation)
        // But since we use uniqueUser, we can rely on previous test or create a new one.
        // Let's create another unique user for this test specifically.
        const dupUser = `dup_${randomSuffix}`;
        await request(app.getHttpServer())
            .post('/auth/signup')
            .send({ username: dupUser, password: 'password123' })
            .expect(201);

        return request(app.getHttpServer())
            .post('/auth/signup')
            .send({ username: dupUser, password: 'password123' })
            .expect(409);
    });

    it('/auth/signin (POST) - success', async () => {
        const signinUser = `signin_${randomSuffix}`;
        await request(app.getHttpServer())
            .post('/auth/signup')
            .send({ username: signinUser, password: 'password123' })
            .expect(201);

        const response = await request(app.getHttpServer())
            .post('/auth/signin')
            .send({ username: signinUser, password: 'password123' })
            .expect(201);
        
        expect(response.body.accessToken).toBeDefined();
    });

    it('/auth/signin (POST) - fail', async () => {
         return request(app.getHttpServer())
            .post('/auth/signin')
            .send({ username: 'wronguser', password: 'password123' })
            .expect(401);
    });
  });

  describe('Tasks', () => {
      let accessToken;
      const randomSuffix = Math.random().toString(36).substring(7);

      beforeAll(async () => {
           // We need a fresh app instance or just use the beforeEach one if we nest properly.
           // To keep it simple, I'll rely on tests running in order or unique users.
      });

      it('should allow CRUD operations for authenticated user', async () => {
          // 1. Sign up and Login
          const username = `taskuser_${randomSuffix}`;
          await request(app.getHttpServer())
            .post('/auth/signup')
            .send({ username, password: 'password123' });
          
          const loginRes = await request(app.getHttpServer())
            .post('/auth/signin')
            .send({ username, password: 'password123' });
          
          accessToken = loginRes.body.accessToken;

          // 2. Create Task
          const createRes = await request(app.getHttpServer())
            .post('/tasks')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ title: 'My Task', description: 'Description' })
            .expect(201);
          
          const taskId = createRes.body.id;
          expect(createRes.body.title).toBe('My Task');
          expect(createRes.body.status).toBe('OPEN');

          // 3. Get Tasks
          const getRes = await request(app.getHttpServer())
            .get('/tasks')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);
          
          expect(getRes.body.length).toBeGreaterThan(0);
          expect(getRes.body[0].title).toBe('My Task');

          // 4. Update Task Status
          const updateRes = await request(app.getHttpServer())
            .patch(`/tasks/${taskId}/status`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ status: 'DONE' })
            .expect(200);
          
          expect(updateRes.body.status).toBe('DONE');

          // 5. Delete Task
          await request(app.getHttpServer())
            .delete(`/tasks/${taskId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

          // 6. Verify Deletion
          await request(app.getHttpServer())
            .get(`/tasks/${taskId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(404);
      });

      it('should fail for unauthenticated user', async () => {
          await request(app.getHttpServer())
            .get('/tasks')
            .expect(401);
      });
  });
});
