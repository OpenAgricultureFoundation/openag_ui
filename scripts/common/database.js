// Effect/action wrappers for common PouchDb operations

import {Effects, Task} from 'reflex';
import * as Result from '../common/result';
import {compose} from '../lang/functional';
import reject from 'lodash/reject';
import map from 'lodash/map';

export const Get = id => ({
  type: 'Get',
  id
});

export const Got = result => ({
  type: 'Got',
  result
});

export const get = (db, id) =>
  Effects.perform(new Task(succeed => {
    db
      .get(id)
      .then(
        Result.ok,
        Result.error
      )
      .then(succeed);
  }));

export const Put = value => ({
  type: 'Put',
  value
})

// Apologies for the silly name
export const Putted = result => ({
  type: 'Putted',
  result
});

export const put = (db, doc) =>
  Effects.perform(new Task(succeed => {
    db
      .put(doc)
      .then(Result.ok, Result.error)
      .then(succeed);
  }));

// Request a restore from database.
export const Restore = {
  type: 'Restore'
};

export const Restored = result => ({
  type: 'Restored',
  result
});

// Mapping functions to just get the docs from an allDocs response.
export const readDocFromRow = row => row.doc;
export const isDesignDoc = doc => doc._id.indexOf('_design/') !== -1;
export const readAllDocs = database =>
  reject(map(database.rows, readDocFromRow), isDesignDoc);

// Request in-memory restore from DB
// Returns an effect.
export const restore = db =>
  Effects.perform(new Task(succeed => {
    db
      .allDocs({
        include_docs: true,
        // Filter out design documents
        // (this assumes our documents do not have uppercased IDs)
        // See http://stackoverflow.com/questions/25728903/pouchdb-exclude-design-documents-when-using-autogenerated-uuid.
        startkey: 'design_\uffff'
      })
      .then(
        compose(Result.ok, readAllDocs),
        Result.error
      )
      .then(succeed);
  }));

// Sync actions and effects
// See https://pouchdb.com/api.html#sync
// https://pouchdb.com/api.html#replication

// Request up-directional sync
export const Push = {
  type: 'Push'
};

export const Pushed = result => ({
  type: 'Pushed',
  result
});

export const push = (db, replica) =>
  Effects.perform(new Task(succeed => {
    // Pouch will throw an error from xhr if there is no internet connection.
    // @TODO find out why Pouch isn't catching these 404s within the promise.
    try {
      db
        .replicate.to(replica)
        .then(
          Result.ok,
          Result.error
        )
        .then(succeed);
    }
    catch (error) {
      succeed(Result.error(error));
    }
  }));

// Request down-directional sync
export const Pull = {
  type: 'Pull'
};

export const Pulled = result => ({
  type: 'Pulled',
  result
});

export const pull = (db, replica) =>
  Effects.perform(new Task(succeed => {
    db
      .replicate.from(replica)
      .then(
        Result.ok,
        Result.error
      )
      .then(succeed);
  }));

// Request bi-directional sync
export const Sync = {
  type: 'Sync'
};

export const Synced = result => ({
  type: 'Synced',
  result
});

export const sync = (db, replica) =>
  Effects.perform(new Task(succeed => {
    db
      .sync(replica)
      .then(
        Result.ok,
        Result.error
      )
      .then(succeed);
  }));
