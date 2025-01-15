const errorHandler = (err, req, res, next) => {
  // Log the error for server-side tracking
  console.error('Error Middleware:', {
    message: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path,
    body: req.body
  });

  
  const statusCode = err.statusCode || 500;


  const errorResponse = {
    status: 'error',
    statusCode,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  //validation errors specifically
  if (err.message === 'Validation Failed' && err.errors) {
    errorResponse.status = 'validation_error';
    errorResponse.errors = err.errors.fields;
    errorResponse.message = 'Validation Failed';
  }

  // Mongoose Validation Errors
  if (err.name === 'ValidationError') {
    errorResponse.status = 'validation_error';
    errorResponse.errors = Object.keys(err.errors).reduce((acc, key) => {
      acc[key] = [err.errors[key].message];
      return acc;
    }, {});
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    errorResponse.status = 'duplicate_error';
    errorResponse.message = `Duplicate key error: ${Object.keys(err.keyValue)} already exists`;
    errorResponse.errors = {
      duplicateFields: Object.keys(err.keyValue)
    };
    errorResponse.statusCode = 409;
  }


  res.status(errorResponse.statusCode).json(errorResponse);
};

module.exports = errorHandler;