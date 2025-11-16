const express = require('express');
const contentType = require('content-type');
const Fragment = require('../model/fragment');
const basicAuth = require('../auth/basic-auth');
const cognitoAuth = require('../auth/cognito');
const convertFragment = require('../middleware/convert');

const router = express.Router();

// -----------------------------------------------------------------------------
// Choose authentication strategy (basic for dev/tests, cognito for production)
// -----------------------------------------------------------------------------
const authStrategy = process.env.AUTH_STRATEGY === 'bearer' ? cognitoAuth : basicAuth;
router.use(authStrategy.authenticate());

// -----------------------------------------------------------------------------
// Helper: Raw body parser for supported content types
// -----------------------------------------------------------------------------
const rawBody = () =>
  express.raw({
    inflate: true,
    limit: '5mb',
    type: ['text/*', 'application/json'], // Accept these content types
  });

// -----------------------------------------------------------------------------
// POST /v1/fragments → create a new fragment
// -----------------------------------------------------------------------------
router.post('/fragments', express.json(), rawBody(), async (req, res, next) => {
  try {
    const contentTypeHeader = req.get('Content-Type');
    if (!contentTypeHeader) {
      return res.status(415).json({ error: 'Content-Type header required' });
    }

    const { type } = contentType.parse(contentTypeHeader);
    if (!Fragment.isSupportedType(type)) {
      return res.status(415).json({ error: 'Unsupported Media Type' });
    }

    // Get the raw data from either JSON middleware or raw body middleware
    const data = type === 'application/json' ? Buffer.from(JSON.stringify(req.body)) : req.body;
    if (!Buffer.isBuffer(data)) {
      return res.status(415).json({ error: 'Unsupported Media Type' });
    }

    const fragment = await Fragment.create(req.user.ownerId, type, data);

    const base = process.env.API_URL || `http://${req.headers.host}`;
    res
      .status(201)
      .set('Location', `${base}/v1/fragments/${fragment.id}`)
      .json(fragment);
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------------------------------------------
// GET /v1/fragments?expand=1 → list fragments for the authenticated user
// -----------------------------------------------------------------------------
router.get('/fragments', async (req, res, next) => {
  try {
    const expand = req.query.expand === '1';
    const fragments = await Fragment.byUser(req.user.ownerId, expand);
    res.status(200).json({ fragments });
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------------------------------------------
// GET /v1/fragments/:id.:ext → convert fragment to another format (e.g. .md → .html)
// -----------------------------------------------------------------------------
router.get('/fragments/:id.:ext', async (req, res, next) => {
  try {
    const fragment = await Fragment.byId(req.user.ownerId, req.params.id);
    if (!fragment) {
      return res.status(404).json({ error: 'Fragment not found' });
    }

    const data = await fragment.getData();
    const { convertedData, contentType: convertedType } = convertFragment(fragment, data, req.params.ext);

    res.type(convertedType).send(convertedData);
  } catch (err) {
    next(err);
  }
});


// -----------------------------------------------------------------------------
// GET /v1/fragments/:id → return raw fragment data
// -----------------------------------------------------------------------------
// router.get('/fragments/:id', async (req, res, next) => {
//   try {
//     const fragment = await Fragment.byId(req.user.ownerId, req.params.id);
//     if (!fragment) {
//       return res.status(404).json({ error: 'Fragment not found' });
//     }

//     // Check if client accepts json
//     const wantsJson = req.accepts('application/json');
//     if (wantsJson) {
//       return res.json(fragment);
//     }

//     // Otherwise send raw data
//     const data = await fragment.getData();
//     res.type(fragment.mimeType).send(data);
//   } catch (err) {
//     next(err);
//   }
// });
router.get('/fragments/:id', async (req, res, next) => {
  try {
    const fragment = await Fragment.byId(req.user.ownerId, req.params.id);
    if (!fragment) {
      return res.status(404).json({ error: 'Fragment not found' });
    }

    // Always return the actual fragment content
    const data = await fragment.getData();
    res.setHeader('Content-Type', fragment.mimeType);
    res.status(200).send(data);
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------------------------------------------
// GET /v1/fragments/:id/info → return fragment metadata only
// -----------------------------------------------------------------------------
router.get('/fragments/:id/info', async (req, res, next) => {
  try {
    const fragment = await Fragment.byId(req.user.ownerId, req.params.id);
    if (!fragment) {
      return res.status(404).json({ error: 'Fragment not found' });
    }

    console.log('🔍 Returning fragment info for ID:', req);
    res.json(fragment);
  } catch (err) {
    next(err);
  }
});


// -----------------------------------------------------------------------------
// GET /v1/fragments/:id/data → explicitly return raw fragment data
// -----------------------------------------------------------------------------
router.get('/fragments/:id/data', async (req, res, next) => {
  try {
    const fragment = await Fragment.byId(req.user.ownerId, req.params.id);
    if (!fragment) {
      return res.status(404).json({ error: 'Fragment not found' });
    }

    const data = await fragment.getData();
    res.setHeader('Content-Type', fragment.mimeType);
    res.send(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
