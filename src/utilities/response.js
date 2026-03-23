let success = (message, results) => {
  return {
    message,
    error: false,
    count: results?.length ? results.length : null,
    data: results,
  };
};

const error = (message, data) => {
  return {
    message,
    error: true,
    data: data || {},
  };
};

export { success, error };
