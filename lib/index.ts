import {
  GraphQLBoolean,
  GraphQLFieldConfigMap,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLString,
  printType,
} from 'graphql'
import { JSONSchema6, JSONSchema6TypeName } from 'json-schema'

import * as assert from 'assert'

function visitSchema(
  schema: JSONSchema6,
  visitProperty: (path: string, definition: JSONSchema6, required: boolean) => void,
  requiredFields: string[],
  namespace?: string
) {
  for (const [key, property] of Object.entries(schema.properties || {})) {
    const value = property as JSONSchema6
    const pathKey = namespace ? `${namespace}.${key}` : key
    if (value.type === 'object') {
      visitSchema(value, visitProperty, value.required || [], pathKey)
    } else {
      visitProperty(pathKey, value, requiredFields.includes(key))
    }
  }
}

const JSC_ARRAY = Symbol('JSC_ARRAY')

type JSONSchema6TypeNameSupportedInGQL = Exclude<JSONSchema6TypeName, 'any' | 'null' | 'object'>

const isInputTypeSupportedinGQL = (
  type: JSONSchema6TypeName
): type is JSONSchema6TypeNameSupportedInGQL => !['null', 'any', 'object'].includes(type)

const typesMap: {
  [k in JSONSchema6TypeNameSupportedInGQL]: GraphQLOutputType | typeof JSC_ARRAY | null
} = {
  array: JSC_ARRAY,
  boolean: GraphQLBoolean,
  integer: GraphQLInt,
  number: GraphQLInt,
  string: GraphQLString,
}

function propertyToGQLType(
  property: JSONSchema6,
  key: string,
  options: ConvertOptions
): GraphQLOutputType | undefined {
  if (Array.isArray(property.type)) {
    console.warn(
      `skipping prop "${key}", union types are not supported for now (requires references support)`
    )
  } else {
    const propType = property.type
    if (!propType) {
      console.warn(`skipping prop "${key}", type is missing`)
    } else {
      const gqlType = isInputTypeSupportedinGQL(propType)
        ? typesMap[propType]
        : options.fallbackTypes &&
          options.fallbackTypes[key] &&
          typesMap[options.fallbackTypes[key]]

      if (!gqlType) {
        console.warn(
          `skipping prop "${key}", ${propType} is not supported in GQL (provide a "fallbackTypes" to avoid skipping)`
        )
        return
      } else if (gqlType === JSC_ARRAY) {
        const items = property.items
        const gqlItemType = propertyToGQLType(
          {
            type: Array.isArray(items)
              ? (items
                  .map((i) => (i as JSONSchema6).type)
                  .filter((t) => !!t) as JSONSchema6TypeName[])
              : (items as JSONSchema6).type,
          },
          `${key}[]`,
          options
        )
        if (gqlItemType) {
          return new GraphQLList(
            options.arraysNullable ? gqlItemType : new GraphQLNonNull(gqlItemType)
          )
        }
      } else {
        return gqlType
      }
    }
  }
}

interface FallbackTypesMap {
  [k: string]: JSONSchema6TypeNameSupportedInGQL
}
interface ConvertOptions {
  fallbackTypes?: FallbackTypesMap
  arraysNullable?: boolean
}

export function convert(
  input: JSONSchema6,
  options: ConvertOptions = {
    arraysNullable: false,
    fallbackTypes: {},
  }
): string {
  assert.strictEqual(input.type, undefined, 'This version only supports $ref JSON Schema document')
  assert.notStrictEqual(
    input.$ref,
    undefined,
    'This version only supports $ref JSON Schema document'
  )

  assert.strictEqual(
    Object.keys(input.definitions || {}).length,
    1,
    'This version only supports 1 definition'
  )

  const typeName = Object.keys(input.definitions || {})[0]

  const typeDefinition: JSONSchema6 = input.definitions![typeName] as JSONSchema6

  assert.strictEqual(
    typeDefinition.type,
    'object',
    `Provided "${typeName}" defintion should be an object`
  )

  const fields: GraphQLFieldConfigMap<any, any> = {}

  visitSchema(
    typeDefinition,
    (key, property, required) => {
      if (property.type) {
        const gqlType = propertyToGQLType(property, key, options)
        if (gqlType) {
          fields[key] = {
            type: required ? new GraphQLNonNull(gqlType) : gqlType,
          }
        }
      }
    },
    typeDefinition.required || []
  )

  return printType(
    new GraphQLObjectType({
      name: typeName,
      fields,
    })
  )
}
