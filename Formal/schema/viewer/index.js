import JSONSchemaView from 'json-schema-view-js';
import './style.less';
import schema from '../schemas/election_record.schema.json';

const render = (schema) => (new JSONSchemaView(schema, 1)).render();

let element = render(schema);
document.body.appendChild(element);

if (module.hot) {
  module.hot.accept('../schemas/election_record.schema.json', () => {
    document.body.removeChild(element);

    element = render(schema);
    document.body.appendChild(element);
  });
}
