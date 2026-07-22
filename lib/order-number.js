'use strict';

// Customer-facing order number — cosmetic prefix over the internal sequential
// id so a customer's receipt doesn't read as a raw count of total orders ever
// placed. Admin views keep using the raw id directly (useful for lookups).
function formatOrderNumber(id) {
  return `EHW-${String(id).padStart(6, '0')}`;
}

module.exports = { formatOrderNumber };
