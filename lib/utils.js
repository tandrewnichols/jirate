exports.coerce = (val) => {
  if (val === 'true') {
    return true;
  }

  if (val === 'false') {
    return false;
  }

  if (!isNaN(val)) {
    return Number(val);
  }

  return val;
};
