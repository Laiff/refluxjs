<<<<<<< HEAD
/**
 * Created by laiff on 28.10.14.
 */
module.exports = function (store, definition) {
    for (var name in definition) {
        var property = definition[name];

        if (typeof property !== 'function' || !definition.hasOwnProperty(name)) {
            continue;
        }

        store[name] = property.bind(store);
    }

    return store;
=======
module.exports = function(store, definition) {
  for (var name in definition) {
    var property = definition[name];

    if (typeof property !== 'function' || !definition.hasOwnProperty(name)) {
      continue;
    }

    store[name] = property.bind(store);
  }

  return store;
>>>>>>> spoike/master
};
