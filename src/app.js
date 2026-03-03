const express = require('express');
const cors = require('cors');

const cookieParser = require('cookie-parser');
const httpStatus = require('http-status');

const morgan = require('./config/morgan');
const routes = require('./routes');
const adminRoutes = require('./routes/admin/index');
const ApiError = require('./utils/ApiError');
const { errorConverter, errorHandler } = require('./middlewares/error');

const app = express();

/* -------------------- Logger -------------------- */
// if (process.env.NODE_ENV !== 'development') {

// }
app.use(morgan.successHandler);
app.use(morgan.errorHandler);

/* -------------------- Core Middlewares -------------------- */

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());



// /* -------------------- CORS -------------------- */
// app.use(cors());

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);



/* -------------------- Routes -------------------- */
app.use('/api/v1', routes);
app.use('/api/v1/admin',adminRoutes)

/* -------------------- 404 Handler -------------------- */
app.use((req, res, next) => {
  next(new ApiError(httpStatus.status.NOT_FOUND, 'Route not found'));
});

/* -------------------- Error Handling -------------------- */
app.use(errorConverter);
app.use(errorHandler);

module.exports = app;
