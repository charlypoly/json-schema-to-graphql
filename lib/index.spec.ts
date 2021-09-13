import { JSONSchema6 } from 'json-schema'
import { convert } from '.'

describe('convert()', () => {
  describe('with unsupported input', () => {
    describe('with multiple definitions', () => {
      it('throws an error', () => {
        const schema: JSONSchema6 = {
          $schema: 'http://json-schema.org/draft-06/schema#',
          $ref: '#/definitions/Product',
          definitions: {
            Product: {
              type: 'object',
              additionalProperties: false,
              properties: {
                title: {
                  type: 'string',
                },
              },
              required: ['title'],
              title: 'Product',
            },
            Collection: {
              type: 'object',
              additionalProperties: false,
              properties: {
                title: {
                  type: 'string',
                },
              },
              required: ['title'],
              title: 'Product',
            },
          },
        }

        expect(() => {
          convert(schema)
        }).toThrow('This version only supports 1 definition')
      })
    })

    describe('with a root `type`', () => {
      describe('with multiple definitions', () => {
        it('throws an error', () => {
          const schema: JSONSchema6 = {
            type: 'object',
            additionalProperties: false,
            properties: {
              title: {
                type: 'string',
              },
            },
            required: ['title'],
            title: 'Product',
          }

          expect(() => {
            convert(schema)
          }).toThrow('This version only supports $ref JSON Schema document')
        })
      })
    })

    describe('with a missing root `$ref`', () => {
      describe('with multiple definitions', () => {
        it('throws an error', () => {
          const schema: JSONSchema6 = {
            $schema: 'http://json-schema.org/draft-06/schema#',
            definitions: {
              Product: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  title: {
                    type: 'string',
                  },
                },
                required: ['title'],
                title: 'Product',
              },
              Collection: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  title: {
                    type: 'string',
                  },
                },
                required: ['title'],
                title: 'Product',
              },
            },
          }

          expect(() => {
            convert(schema)
          }).toThrow('This version only supports $ref JSON Schema document')
        })
      })
    })

    describe('with a empty document ', () => {
      describe('with multiple definitions', () => {
        it('throws an error', () => {
          const schema: JSONSchema6 = {}

          expect(() => {
            convert(schema)
          }).toThrow('This version only supports $ref JSON Schema document')
        })
      })
    })
  })

  describe('with valid input', () => {
    describe('with default options', () => {
      it('generates the proper and valid GQL document', () => {
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

        expect(result).toEqual(`type Product {
  collection_ids: [String!]!
  collections: [String!]!
  title: String!
  salePrice: Int!
  objectID: String!
  shipping: String
}`)
      })
    })

    describe('with `fallbackTypes` options', () => {
      it('generates the proper and valid GQL document', () => {
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

        expect(result).toEqual(`type Product {
  collection_ids: [String!]!
  collections: [String!]!
  title: String!
  salePrice: Int!
  objectID: String!
  shipping: String
}`)
      })
    })

    describe('with `arraysNullable = true` options', () => {
      it('generates the proper and valid GQL document', () => {
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
          arraysNullable: true,
        })

        expect(result).toEqual(`type Product {
  collection_ids: [String]!
  title: String!
  salePrice: Int!
  objectID: String!
  shipping: String
}`)
      })
    })

    describe('with schema having union types', () => {
      it('generates the proper and valid GQL document', () => {
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
                  type: ['string', 'number'],
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

        expect(result).toEqual(`type Product {
  collection_ids: [String!]!
  collections: [String!]!
  salePrice: Int!
  objectID: String!
  shipping: String
}`)
      })
    })

    describe('with schema having array with multiple types', () => {
      it('generates the proper and valid GQL document', () => {
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
                  items: [{ type: 'string' }, { type: 'number' }],
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

        expect(result).toEqual(`type Product {
  collections: [String!]!
  title: String!
  salePrice: Int!
  objectID: String!
  shipping: String
}`)
      })
    })

    describe('with schema having a property without type (ref)', () => {
      it('generates the proper and valid GQL document', () => {
        const schema: JSONSchema6 = {
          $schema: 'http://json-schema.org/draft-06/schema#',
          $ref: '#/definitions/Product',
          definitions: {
            Product: {
              type: 'object',
              additionalProperties: false,
              properties: {
                collection_ids: {
                  $ref: 'unsupported',
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

        expect(result).toEqual(`type Product {
  collections: [String!]!
  title: String!
  salePrice: Int!
  objectID: String!
  shipping: String
}`)
      })
    })
  })
})
