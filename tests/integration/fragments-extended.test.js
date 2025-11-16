const request = require('supertest');
const app = require('../../src/app');

describe('POST /v1/fragments', () => {
    test('should accept text/markdown content', async () => {
        const res = await request(app)
            .post('/v1/fragments')
            .auth('admin', 'password')
            .set('Content-Type', 'text/markdown')
            .send('# Markdown Test');

        expect(res.statusCode).toBe(201);
        expect(res.body.type).toBe('text/markdown');
    });

    test('should accept application/json content', async () => {
        const res = await request(app)
            .post('/v1/fragments')
            .auth('admin', 'password')
            .set('Content-Type', 'application/json')
            .send(JSON.stringify({ test: 'data' }));

        expect(res.statusCode).toBe(201);
        expect(res.body.type).toBe('application/json');
    });
});

describe('GET /v1/fragments with expand', () => {
    test('should return full metadata when expand=1', async () => {
        // First create a fragment
        const createRes = await request(app)
            .post('/v1/fragments')
            .auth('admin', 'password')
            .set('Content-Type', 'text/plain')
            .send('test data');

        const res = await request(app)
            .get('/v1/fragments?expand=1')
            .auth('admin', 'password');

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.fragments)).toBe(true);
        expect(res.body.fragments[0]).toHaveProperty('id');
        expect(res.body.fragments[0]).toHaveProperty('type');
        expect(res.body.fragments[0]).toHaveProperty('size');
    });
});

describe('GET /v1/fragments/:id/info', () => {
    test('should return fragment metadata', async () => {
        // First create a fragment
        const createRes = await request(app)
            .post('/v1/fragments')
            .auth('admin', 'password')
            .set('Content-Type', 'text/plain')
            .send('test data');

        const fragmentId = createRes.body.id;

        const res = await request(app)
            .get(`/v1/fragments/${fragmentId}/info`)
            .auth('admin', 'password');

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('id', fragmentId);
        expect(res.body).toHaveProperty('type', 'text/plain');
        expect(res.body).toHaveProperty('size');
    });
});

describe('GET /v1/fragments/:id.ext conversion', () => {
    test('should convert markdown to HTML', async () => {
        // First create a markdown fragment
        const createRes = await request(app)
            .post('/v1/fragments')
            .auth('admin', 'password')
            .set('Content-Type', 'text/markdown')
            .send('# Test Heading');

        const fragmentId = createRes.body.id;

        const res = await request(app)
            .get(`/v1/fragments/${fragmentId}.html`)
            .auth('admin', 'password');

        expect(res.statusCode).toBe(200);
        expect(res.headers['content-type']).toContain('text/html');
        expect(res.text).toContain('<h1>Test Heading</h1>');
    });

    test('should convert JSON to plain text', async () => {
        // First create a JSON fragment
        const createRes = await request(app)
            .post('/v1/fragments')
            .auth('admin', 'password')
            .set('Content-Type', 'application/json')
            .send(JSON.stringify({ test: 'data' }));

        const fragmentId = createRes.body.id;

        const res = await request(app)
            .get(`/v1/fragments/${fragmentId}.txt`)
            .auth('admin', 'password');

        expect(res.statusCode).toBe(200);
        expect(res.headers['content-type']).toContain('text/plain');
        expect(res.text).toContain('"test": "data"');
    });
});