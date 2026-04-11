const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      message: 'Duplicate entry. This record already exists.',
      error: err.message
    });
  }

  if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(400).json({
      message: 'Cannot delete this record as it is referenced by other records.',
      error: err.message
    });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      message: 'Referenced record does not exist.',
      error: err.message
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation error',
      error: err.message
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      message: 'Invalid ID format',
      error: err.message
    });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
};

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = {
  errorHandler,
  notFound
};
