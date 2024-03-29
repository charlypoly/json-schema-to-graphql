# JSON Schema to GraphQL

## Install

```bash
npm install @wittydeveloper/json-schema-to-graphql
```

## Usage

```ts
import { convert } from '@wittydeveloper/json-schema-2-graphql'

const schema: JSONSchema6 = {
  $schema: 'http://json-schema.org/draft-06/schema#',
  $ref: '#/definitions/Product',
  definitions: {
    Product: {
      type: 'object',
      additionalProperties: false,
      properties: {
        collection_ids: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
        collections: {
          type: 'array',
          items: {
            type: 'null',
          },
        },
        title: {
          type: 'string',
        },
        salePrice: {
          type: 'integer',
        },
        objectID: {
          type: 'string',
        },
        shipping: {
          type: 'string',
        },
      },
      required: ['collection_ids', 'collections', 'objectID', 'salePrice', 'title'],
      title: 'Product',
    },
  },
}

const result = convert(schema, {
  fallbackTypes: {
    'collections[]': 'string',
  },
})
// =>
// type Product {
//  collection_ids: [String!]!
//  collections: [String!]!
//  title: String!
//  salePrice: Int!
//  objectID: String!
//  shipping: String
// }
```
