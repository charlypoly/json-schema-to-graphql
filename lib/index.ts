import {
  GraphQLBoolean,
  GraphQLFieldConfigMap,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLString,
  printType,
} from "graphql";
import {
  JSONSchema6,
  JSONSchema6Definition,
  JSONSchema6TypeName,
} from "json-schema";

import * as assert from "assert";

const schema: JSONSchema6 = {
  $schema: "http://json-schema.org/draft-06/schema#",
  $ref: "#/definitions/Product",
  definitions: {
    Product: {
      type: "object",
      additionalProperties: false,
      properties: {
        collection_ids: {
          type: "array",
          items: {
            type: "null",
          },
        },
        collections: {
          type: "array",
          items: {
            type: "null",
          },
        },
        title: {
          type: "string",
        },
        salePrice: {
          type: "integer",
        },
        objectID: {
          type: "string",
        },
        shipping: {
          type: "string",
        },
      },
      required: [
        "collection_ids",
        "collections",
        "objectID",
        "salePrice",
        "title",
      ],
      title: "Product",
    },
  },
};

const JSC_ARRAY = Symbol("JSC_ARRAY");

const typesMap: {
  [k in JSONSchema6TypeName]: GraphQLOutputType | typeof JSC_ARRAY | null;
} = {
  any: null,
  array: JSC_ARRAY,
  boolean: GraphQLBoolean,
  integer: GraphQLInt,
  null: null,
  number: GraphQLInt,
  object: null,
  string: GraphQLString,
};

export function convert(input: JSONSchema6): string {
  assert.strictEqual(
    input.type,
    undefined,
    "This version only supports $ref JSON Schema document"
  );
  assert.notStrictEqual(
    input.$ref,
    undefined,
    "This version only supports $ref JSON Schema document"
  );

  assert.strictEqual(
    Object.keys(input.definitions || {}).length,
    1,
    "This version only supports 1 definition"
  );

  const typeName = Object.keys(input.definitions || {})[0];

  const typeDefinition: JSONSchema6 = input.definitions![
    typeName
  ] as JSONSchema6;

  assert.strictEqual(
    typeDefinition.type,
    "object",
    `Provided "${typeName}" defintion should be an object`
  );

  const fields: GraphQLFieldConfigMap<any, any> = {};

  for (const [key, property] of Object.entries(
    typeDefinition.properties || {}
  )) {
    if (typeof property !== "boolean" && property.type) {
      const propType = Array.isArray(property.type)
        ? property.type[0]
        : property.type;
      const gqlType = typesMap[propType];
      // TODO: handle array, non-nullable and references
      if (gqlType === JSC_ARRAY) {
        const itemType = Array.isArray((property.items as JSONSchema6).type)
          ? ((property.items as JSONSchema6).type![0] as JSONSchema6TypeName)
          : ((property.items as JSONSchema6).type! as JSONSchema6TypeName);

        const gqlItemType = typesMap[itemType];
        if (gqlItemType && gqlItemType != JSC_ARRAY) {
          fields[key] = {
            type: new GraphQLList(gqlItemType),
          };
        }
      } else if (gqlType) {
        fields[key] = {
          type: gqlType,
        };
      }
    }
  }

  return printType(
    new GraphQLObjectType({
      name: typeName,
      fields,
    })
  );
}

console.log(convert(schema));
