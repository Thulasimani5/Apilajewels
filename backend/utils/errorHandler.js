const formatError = (err) => {
  // Check for Mongoose/MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    const val = err.keyValue ? err.keyValue[field] : '';
    let fieldLabel = field;
    if (field === 'jewelId') fieldLabel = 'Jewel ID';
    else if (field === 'email') fieldLabel = 'Email';
    else if (field === 'phone') fieldLabel = 'Phone';
    else if (field === 'name') fieldLabel = 'Name';
    
    return `The ${fieldLabel || 'field'} '${val}' is already in use. Please use a unique value.`;
  }

  // Check for Mongoose validation error
  if (err.name === 'ValidationError') {
    return Object.values(err.errors).map(val => val.message).join(', ');
  }

  // Check for Mongoose cast error (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    return `Resource not found with id of ${err.value}`;
  }

  return err.message || 'Server Error';
};

module.exports = { formatError };
