
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./db');
const keysRoutes = require('./routes/keys');
const demoRoutes = require('./routes/demo');
const { requireApiKey } = require('./middleware/auth');
const { rateLimitByApiKey } = require('./middleware/rateLimit');
const { requestLogger } = require('./middleware/requestLogger');
const logsRoutes = require('./routes/logs');
const swaggerUi = require('swagger-ui-express');
const openapiSpec = require('./openapi.json');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(requestLogger);
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

app.use((req, res, next) => {
  req.db = db;
  next();
});

app.get('/', (req, res) => {
  res.json({
    message: 'M-14 Public API',
    version: 'v1',
    endpoints: {
      exams: '/api/v1/exams',
      enrollments: '/api/v1/enrollments',
      results: '/api/v1/results',
      certificates: '/api/v1/certificates',
      webhooks: '/api/v1/webhooks'
    }
  });
});

const examsRoutes = require('./routes/exams');
const enrollmentsRoutes = require('./routes/enrollments');
const resultsRoutes = require('./routes/results');
const certificatesRoutes = require('./routes/certificates');
const webhooksRoutes = require('./routes/webhooks');

app.use('/api/v1/exams', requireApiKey, rateLimitByApiKey, examsRoutes);
app.use('/api/v1/enrollments', requireApiKey, rateLimitByApiKey, enrollmentsRoutes);
app.use('/api/v1/results', requireApiKey, rateLimitByApiKey, resultsRoutes);
app.use('/api/v1/certificates', requireApiKey, rateLimitByApiKey, certificatesRoutes);
app.use('/api/v1/webhooks', requireApiKey, rateLimitByApiKey, webhooksRoutes);
app.use('/api/v1/logs', requireApiKey, rateLimitByApiKey, logsRoutes);

app.use('/api/keys', keysRoutes);
app.use('/api/demo', requireApiKey, rateLimitByApiKey, demoRoutes);

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});