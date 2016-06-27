/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/*
Create ordered hashmaps that are ordered by key and have an order field,
allowing you to read out ordered arrays.
*/

// Build an index object from an array.
// Returns a new index object.
export const indexWith = (array, readKey) => {
  const index = {};
  for (let object of array) {
    // Derive key using `readKey`, then use it to assign value.
    index[readKey(object)] = object;
  }
  return index;
}

export const toArray = (object, compare) => {
  const array = [];
  for (let key of Object.keys(object)) {
    array.push(object[key]);
  }
  array.sort(compare);
  return array;
}

// Set a value at key on index, returning new index.
const enter = (index, key, value) => {
  const next = Object.assign({}, index);
  next[key] = value;
  return next;
}

// Insert value in index, but only if it doesn't already exist in index.
export const insertNew = (index, value, readKey) => {
  const key = readKey(value);
  return !index[key] ? enter(index, key, value) : index;
}

export const insertMany = (index, array, readKey) =>
  Object.assign({}, index, indexWith(array, readKey));