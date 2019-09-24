const JsonRefs = require('json-refs');
const path = require('path');

module.exports = function(content, map, meta) {
  let callback = this.async();
  let dependency = this.dependency;
  let resourcePath = this.resourcePath;
  const schema = JSON.parse(content);

  JsonRefs.resolveRefs(schema, { location: resourcePath })
    .then(res => {
      for (let [_, ref] of Object.entries(res.refs)) {
        if (ref.type != 'relative') continue;
        let refPath = path.join(path.dirname(resourcePath), ref.fqURI);
        dependency(refPath);
      }
      JsonRefs.clearCache();
      callback(null, JSON.stringify(res.resolved), map, meta)
    })
    .catch(callback);

  return;
};
