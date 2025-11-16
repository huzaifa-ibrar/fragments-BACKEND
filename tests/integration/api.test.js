const request = require('supertest');
const { app, server } = require('../../src/server');

describe('Integration: server additional tests', () => {
  let fragmentId;

  // POST /v1/fragments with wrong auth
  test('POST /v1/fragments fails with wrong basic auth', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Authorization', 'Basic ' + Buffer.from('wrong:credentials').toString('base64'))
      .set('Content-Type', 'text/plain')
      .send('test');
    expect(res.status).toBe(401);
  });

  // POST with unsupported content type
  test('POST /v1/fragments fails with unsupported content-type', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Authorization', 'Basic ' + Buffer.from('admin:password').toString('base64'))
      .set('Content-Type', 'application/octet-stream')
      .send(Buffer.from('test'));
    expect(res.status).toBe(415);
  });

  // POST valid fragment to use in further tests
  test('POST /v1/fragments (text/plain) works', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Authorization', 'Basic ' + Buffer.from('admin:password').toString('base64'))
      .set('Content-Type', 'text/plain')
      .send('integration body');
    expect(res.status).toBe(201);
    fragmentId = res.body.id;
    expect(fragmentId).toBeDefined();
  });

  // GET fragment metadata
  test('GET /v1/fragments/:id returns metadata', async () => {
    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}`)
      .set('Authorization', 'Basic ' + Buffer.from('admin:password').toString('base64'));
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(fragmentId);
    expect(res.body.type).toBe('text/plain');
  });

  // GET fragment raw data
  test('GET /v1/fragments/:id/data returns raw data', async () => {
    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}/data`)
      .set('Authorization', 'Basic ' + Buffer.from('admin:password').toString('base64'));
    expect(res.status).toBe(200);
    expect(res.text).toBe('integration body');
    expect(res.headers['content-type']).toBe('text/plain');
  });

  afterAll((done) => {
    server.close(done);
  });
});
