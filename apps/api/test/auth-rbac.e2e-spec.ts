import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';

describe('Auth & RBAC Security (e2e)', () => {
  let app: INestApplication;
  let priyaCookie: string;
  let rohitCookie: string;
  let adminCookie: string;
  let rohitBookId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.use(cookieParser('bookleaf-cookie-secret-key-default'));
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();

    // Log in as Author Priya
    const priyaLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'priya.sharma@email.com', password: 'Author@123' })
      .expect(200);
    priyaCookie = priyaLogin.headers['set-cookie'][0];

    // Log in as Author Rohit
    const rohitLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'rohit.kapoor@email.com', password: 'Author@123' })
      .expect(200);
    rohitCookie = rohitLogin.headers['set-cookie'][0];

    // Log in as Admin
    const adminLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'admin@bookleaf.test', password: 'Admin@123' })
      .expect(200);
    adminCookie = adminLogin.headers['set-cookie'][0];

    // Get a book belonging to Rohit
    const rohitBooks = await request(app.getHttpServer())
      .get('/api/v1/authors/me/books')
      .set('Cookie', rohitCookie)
      .expect(200);
    rohitBookId = rohitBooks.body.books[0].id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('Unauthenticated requests are rejected with 401 and uniform error envelope', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/tickets')
      .expect(401);

    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('Author A cannot access Author B book (returns 404, not 403, preventing resource enumeration)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/authors/me/books/${rohitBookId}`)
      .set('Cookie', priyaCookie)
      .expect(404);

    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('BOOK_NOT_FOUND');
  });

  it('Author cannot access Admin endpoints (returns 403 FORBIDDEN)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/admin/tickets')
      .set('Cookie', priyaCookie)
      .expect(403);

    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('Admin can access Admin queue successfully', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/admin/tickets')
      .set('Cookie', adminCookie)
      .expect(200);

    expect(res.body.data).toBeDefined();
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toBeDefined();
  });
});
