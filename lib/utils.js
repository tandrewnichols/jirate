exports.coerce = (val) => {
  if (['true', true].includes(val)) {
    return true;
  }

  if (['false', false].includes(val)) {
    return false;
  }

  if (!isNaN(val)) {
    return Number(val);
  }

  return val;
};
