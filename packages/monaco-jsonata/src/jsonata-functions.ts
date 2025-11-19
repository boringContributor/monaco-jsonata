export interface JSONataFunction {
  name: string;
  signature: string;
  description: string;
  params: Array<{
    name: string;
    type: string;
    optional?: boolean;
    description: string;
  }>;
  returns: string;
  examples?: string[];
  docsUrl?: string;
}

export const jsonataFunctions: JSONataFunction[] = [
  // String Functions
  {
    name: '$string',
    signature: '$string(arg, prettify?)',
    description: 'Casts the argument to a string. If prettify is true, "prettifies" JSON objects with indentation.',
    params: [
      { name: 'arg', type: 'any', description: 'Value to convert to string' },
      { name: 'prettify', type: 'boolean', optional: true, description: 'Pretty print JSON objects' }
    ],
    returns: 'string',
    examples: ['$string(5) /* "5" */', '$string({"a": 1}, true)'],
    docsUrl: 'https://docs.jsonata.org/string-functions#string'
  },
  {
    name: '$length',
    signature: '$length(str)',
    description: 'Returns the number of characters in the string.',
    params: [
      { name: 'str', type: 'string', description: 'Input string' }
    ],
    returns: 'number',
    examples: ['$length("Hello") /* 5 */'],
    docsUrl: 'https://docs.jsonata.org/string-functions#length'
  },
  {
    name: '$substring',
    signature: '$substring(str, start, length?)',
    description: 'Returns a substring of str starting at start position (zero-indexed) with optional length.',
    params: [
      { name: 'str', type: 'string', description: 'Input string' },
      { name: 'start', type: 'number', description: 'Starting position (0-indexed)' },
      { name: 'length', type: 'number', optional: true, description: 'Length of substring' }
    ],
    returns: 'string',
    examples: ['$substring("Hello World", 6) /* "World" */', '$substring("Hello", 0, 2) /* "He" */'],
    docsUrl: 'https://docs.jsonata.org/string-functions#substring'
  },
  {
    name: '$substringBefore',
    signature: '$substringBefore(str, chars)',
    description: 'Returns the substring before the first occurrence of chars.',
    params: [
      { name: 'str', type: 'string', description: 'Input string' },
      { name: 'chars', type: 'string', description: 'Characters to search for' }
    ],
    returns: 'string',
    examples: ['$substringBefore("hello@example.com", "@") /* "hello" */'],
    docsUrl: 'https://docs.jsonata.org/string-functions#substringbefore'
  },
  {
    name: '$substringAfter',
    signature: '$substringAfter(str, chars)',
    description: 'Returns the substring after the first occurrence of chars.',
    params: [
      { name: 'str', type: 'string', description: 'Input string' },
      { name: 'chars', type: 'string', description: 'Characters to search for' }
    ],
    returns: 'string',
    examples: ['$substringAfter("hello@example.com", "@") /* "example.com" */'],
    docsUrl: 'https://docs.jsonata.org/string-functions#substringafter'
  },
  {
    name: '$uppercase',
    signature: '$uppercase(str)',
    description: 'Converts all characters in str to uppercase.',
    params: [
      { name: 'str', type: 'string', description: 'Input string' }
    ],
    returns: 'string',
    examples: ['$uppercase("hello") /* "HELLO" */'],
    docsUrl: 'https://docs.jsonata.org/string-functions#uppercase'
  },
  {
    name: '$lowercase',
    signature: '$lowercase(str)',
    description: 'Converts all characters in str to lowercase.',
    params: [
      { name: 'str', type: 'string', description: 'Input string' }
    ],
    returns: 'string',
    examples: ['$lowercase("HELLO") /* "hello" */'],
    docsUrl: 'https://docs.jsonata.org/string-functions#lowercase'
  },
  {
    name: '$trim',
    signature: '$trim(str)',
    description: 'Removes leading and trailing whitespace from str.',
    params: [
      { name: 'str', type: 'string', description: 'Input string' }
    ],
    returns: 'string',
    examples: ['$trim("  hello  ") /* "hello" */'],
    docsUrl: 'https://docs.jsonata.org/string-functions#trim'
  },
  {
    name: '$pad',
    signature: '$pad(str, width, char?)',
    description: 'Pads str to width characters, optionally using char (default is space).',
    params: [
      { name: 'str', type: 'string', description: 'Input string' },
      { name: 'width', type: 'number', description: 'Target width' },
      { name: 'char', type: 'string', optional: true, description: 'Padding character (default: space)' }
    ],
    returns: 'string',
    examples: ['$pad("hello", 10) /* "hello     " */', '$pad("5", 3, "0") /* "500" */'],
    docsUrl: 'https://docs.jsonata.org/string-functions#pad'
  },
  {
    name: '$contains',
    signature: '$contains(str, pattern)',
    description: 'Returns true if str contains pattern (string or regex).',
    params: [
      { name: 'str', type: 'string', description: 'Input string' },
      { name: 'pattern', type: 'string | regex', description: 'Pattern to search for' }
    ],
    returns: 'boolean',
    examples: ['$contains("hello world", "world") /* true */'],
    docsUrl: 'https://docs.jsonata.org/string-functions#contains'
  },
  {
    name: '$split',
    signature: '$split(str, separator, limit?)',
    description: 'Splits str into an array of strings using separator.',
    params: [
      { name: 'str', type: 'string', description: 'Input string' },
      { name: 'separator', type: 'string | regex', description: 'Separator pattern' },
      { name: 'limit', type: 'number', optional: true, description: 'Maximum number of splits' }
    ],
    returns: 'array',
    examples: ['$split("a,b,c", ",") /* ["a", "b", "c"] */'],
    docsUrl: 'https://docs.jsonata.org/string-functions#split'
  },
  {
    name: '$join',
    signature: '$join(array, separator?)',
    description: 'Joins an array of strings into a single string with optional separator.',
    params: [
      { name: 'array', type: 'array', description: 'Array of strings' },
      { name: 'separator', type: 'string', optional: true, description: 'Separator string' }
    ],
    returns: 'string',
    examples: ['$join(["a", "b", "c"], ",") /* "a,b,c" */'],
    docsUrl: 'https://docs.jsonata.org/string-functions#join'
  },
  {
    name: '$match',
    signature: '$match(str, pattern, limit?)',
    description: 'Matches str against pattern (regex) and returns an array of match objects.',
    params: [
      { name: 'str', type: 'string', description: 'Input string' },
      { name: 'pattern', type: 'regex', description: 'Regular expression pattern' },
      { name: 'limit', type: 'number', optional: true, description: 'Maximum matches' }
    ],
    returns: 'array',
    examples: ['$match("hello", /l+/)'],
    docsUrl: 'https://docs.jsonata.org/string-functions#match'
  },
  {
    name: '$replace',
    signature: '$replace(str, pattern, replacement, limit?)',
    description: 'Replaces occurrences of pattern in str with replacement.',
    params: [
      { name: 'str', type: 'string', description: 'Input string' },
      { name: 'pattern', type: 'string | regex', description: 'Pattern to replace' },
      { name: 'replacement', type: 'string', description: 'Replacement string' },
      { name: 'limit', type: 'number', optional: true, description: 'Maximum replacements' }
    ],
    returns: 'string',
    examples: ['$replace("hello world", "world", "there") /* "hello there" */'],
    docsUrl: 'https://docs.jsonata.org/string-functions#replace'
  },
  {
    name: '$eval',
    signature: '$eval(expr, context?)',
    description: 'Evaluates a JSONata expression given as a string.',
    params: [
      { name: 'expr', type: 'string', description: 'JSONata expression to evaluate' },
      { name: 'context', type: 'any', optional: true, description: 'Context for evaluation' }
    ],
    returns: 'any',
    examples: ['$eval("[1,2,3]")'],
    docsUrl: 'https://docs.jsonata.org/string-functions#eval'
  },
  {
    name: '$base64encode',
    signature: '$base64encode(str)',
    description: 'Encodes str to base64.',
    params: [
      { name: 'str', type: 'string', description: 'String to encode' }
    ],
    returns: 'string',
    examples: ['$base64encode("hello")'],
    docsUrl: 'https://docs.jsonata.org/string-functions#base64encode'
  },
  {
    name: '$base64decode',
    signature: '$base64decode(str)',
    description: 'Decodes a base64 encoded string.',
    params: [
      { name: 'str', type: 'string', description: 'Base64 string to decode' }
    ],
    returns: 'string',
    examples: ['$base64decode("aGVsbG8=")'],
    docsUrl: 'https://docs.jsonata.org/string-functions#base64decode'
  },
  {
    name: '$encodeUrlComponent',
    signature: '$encodeUrlComponent(str)',
    description: 'Encodes str as a URI component.',
    params: [
      { name: 'str', type: 'string', description: 'String to encode' }
    ],
    returns: 'string',
    examples: ['$encodeUrlComponent("hello world")'],
    docsUrl: 'https://docs.jsonata.org/string-functions#encodeurlcomponent'
  },
  {
    name: '$encodeUrl',
    signature: '$encodeUrl(str)',
    description: 'Encodes str as a complete URI.',
    params: [
      { name: 'str', type: 'string', description: 'String to encode' }
    ],
    returns: 'string',
    examples: ['$encodeUrl("http://example.com/path with spaces")'],
    docsUrl: 'https://docs.jsonata.org/string-functions#encodeurl'
  },
  {
    name: '$decodeUrlComponent',
    signature: '$decodeUrlComponent(str)',
    description: 'Decodes a URI component.',
    params: [
      { name: 'str', type: 'string', description: 'Encoded string to decode' }
    ],
    returns: 'string',
    examples: ['$decodeUrlComponent("hello%20world")'],
    docsUrl: 'https://docs.jsonata.org/string-functions#decodeurlcomponent'
  },
  {
    name: '$decodeUrl',
    signature: '$decodeUrl(str)',
    description: 'Decodes a complete URI.',
    params: [
      { name: 'str', type: 'string', description: 'Encoded URL to decode' }
    ],
    returns: 'string',
    examples: ['$decodeUrl("http%3A%2F%2Fexample.com")'],
    docsUrl: 'https://docs.jsonata.org/string-functions#decodeurl'
  },

  // Numeric Functions
  {
    name: '$number',
    signature: '$number(arg)',
    description: 'Casts the argument to a number.',
    params: [
      { name: 'arg', type: 'any', description: 'Value to convert to number' }
    ],
    returns: 'number',
    examples: ['$number("5") /* 5 */', '$number(true) /* 1 */'],
    docsUrl: 'https://docs.jsonata.org/numeric-functions#number'
  },
  {
    name: '$abs',
    signature: '$abs(number)',
    description: 'Returns the absolute value of number.',
    params: [
      { name: 'number', type: 'number', description: 'Input number' }
    ],
    returns: 'number',
    examples: ['$abs(-5) /* 5 */'],
    docsUrl: 'https://docs.jsonata.org/numeric-functions#abs'
  },
  {
    name: '$floor',
    signature: '$floor(number)',
    description: 'Returns number rounded down to the nearest integer.',
    params: [
      { name: 'number', type: 'number', description: 'Input number' }
    ],
    returns: 'number',
    examples: ['$floor(5.7) /* 5 */'],
    docsUrl: 'https://docs.jsonata.org/numeric-functions#floor'
  },
  {
    name: '$ceil',
    signature: '$ceil(number)',
    description: 'Returns number rounded up to the nearest integer.',
    params: [
      { name: 'number', type: 'number', description: 'Input number' }
    ],
    returns: 'number',
    examples: ['$ceil(5.3) /* 6 */'],
    docsUrl: 'https://docs.jsonata.org/numeric-functions#ceil'
  },
  {
    name: '$round',
    signature: '$round(number, precision?)',
    description: 'Rounds number to precision decimal places (default 0).',
    params: [
      { name: 'number', type: 'number', description: 'Number to round' },
      { name: 'precision', type: 'number', optional: true, description: 'Decimal places (default: 0)' }
    ],
    returns: 'number',
    examples: ['$round(3.14159, 2) /* 3.14 */'],
    docsUrl: 'https://docs.jsonata.org/numeric-functions#round'
  },
  {
    name: '$power',
    signature: '$power(base, exponent)',
    description: 'Returns base raised to the power of exponent.',
    params: [
      { name: 'base', type: 'number', description: 'Base number' },
      { name: 'exponent', type: 'number', description: 'Exponent' }
    ],
    returns: 'number',
    examples: ['$power(2, 3) /* 8 */'],
    docsUrl: 'https://docs.jsonata.org/numeric-functions#power'
  },
  {
    name: '$sqrt',
    signature: '$sqrt(number)',
    description: 'Returns the square root of number.',
    params: [
      { name: 'number', type: 'number', description: 'Input number' }
    ],
    returns: 'number',
    examples: ['$sqrt(16) /* 4 */'],
    docsUrl: 'https://docs.jsonata.org/numeric-functions#sqrt'
  },
  {
    name: '$random',
    signature: '$random()',
    description: 'Returns a random number between 0 (inclusive) and 1 (exclusive).',
    params: [],
    returns: 'number',
    examples: ['$random()'],
    docsUrl: 'https://docs.jsonata.org/numeric-functions#random'
  },
  {
    name: '$formatNumber',
    signature: '$formatNumber(number, picture, options?)',
    description: 'Formats a number using a picture string (decimal format pattern).',
    params: [
      { name: 'number', type: 'number', description: 'Number to format' },
      { name: 'picture', type: 'string', description: 'Format pattern' },
      { name: 'options', type: 'object', optional: true, description: 'Formatting options' }
    ],
    returns: 'string',
    examples: ['$formatNumber(12345.67, "#,###.00") /* "12,345.67" */'],
    docsUrl: 'https://docs.jsonata.org/numeric-functions#formatnumber'
  },
  {
    name: '$formatBase',
    signature: '$formatBase(number, radix?)',
    description: 'Converts number to a string in the specified radix (base).',
    params: [
      { name: 'number', type: 'number', description: 'Number to convert' },
      { name: 'radix', type: 'number', optional: true, description: 'Base (2-36, default: 10)' }
    ],
    returns: 'string',
    examples: ['$formatBase(100, 2) /* "1100100" */', '$formatBase(255, 16) /* "ff" */'],
    docsUrl: 'https://docs.jsonata.org/numeric-functions#formatbase'
  },
  {
    name: '$formatInteger',
    signature: '$formatInteger(number, picture)',
    description: 'Formats an integer using a picture string.',
    params: [
      { name: 'number', type: 'number', description: 'Integer to format' },
      { name: 'picture', type: 'string', description: 'Format pattern (e.g., "1", "i", "I", "w")' }
    ],
    returns: 'string',
    examples: ['$formatInteger(5, "i") /* "v" */', '$formatInteger(2023, "w") /* "two thousand and twenty-three" */'],
    docsUrl: 'https://docs.jsonata.org/numeric-functions#formatinteger'
  },
  {
    name: '$parseInteger',
    signature: '$parseInteger(str, picture)',
    description: 'Parses a string to an integer using a picture string.',
    params: [
      { name: 'str', type: 'string', description: 'String to parse' },
      { name: 'picture', type: 'string', description: 'Format pattern' }
    ],
    returns: 'number',
    examples: ['$parseInteger("twelve", "w") /* 12 */'],
    docsUrl: 'https://docs.jsonata.org/numeric-functions#parseinteger'
  },

  // Aggregation Functions
  {
    name: '$sum',
    signature: '$sum(array)',
    description: 'Returns the sum of all numbers in array.',
    params: [
      { name: 'array', type: 'array', description: 'Array of numbers' }
    ],
    returns: 'number',
    examples: ['$sum([1, 2, 3, 4]) /* 10 */'],
    docsUrl: 'https://docs.jsonata.org/aggregation-functions#sum'
  },
  {
    name: '$max',
    signature: '$max(array)',
    description: 'Returns the maximum value in array.',
    params: [
      { name: 'array', type: 'array', description: 'Array of numbers' }
    ],
    returns: 'number',
    examples: ['$max([1, 5, 3, 9, 2]) /* 9 */'],
    docsUrl: 'https://docs.jsonata.org/aggregation-functions#max'
  },
  {
    name: '$min',
    signature: '$min(array)',
    description: 'Returns the minimum value in array.',
    params: [
      { name: 'array', type: 'array', description: 'Array of numbers' }
    ],
    returns: 'number',
    examples: ['$min([1, 5, 3, 9, 2]) /* 1 */'],
    docsUrl: 'https://docs.jsonata.org/aggregation-functions#min'
  },
  {
    name: '$average',
    signature: '$average(array)',
    description: 'Returns the average (mean) of all numbers in array.',
    params: [
      { name: 'array', type: 'array', description: 'Array of numbers' }
    ],
    returns: 'number',
    examples: ['$average([1, 2, 3, 4]) /* 2.5 */'],
    docsUrl: 'https://docs.jsonata.org/aggregation-functions#average'
  },

  // Boolean Functions
  {
    name: '$boolean',
    signature: '$boolean(arg)',
    description: 'Casts the argument to a boolean.',
    params: [
      { name: 'arg', type: 'any', description: 'Value to convert to boolean' }
    ],
    returns: 'boolean',
    examples: ['$boolean(1) /* true */', '$boolean("") /* false */'],
    docsUrl: 'https://docs.jsonata.org/boolean-functions#boolean'
  },
  {
    name: '$not',
    signature: '$not(arg)',
    description: 'Returns the logical NOT of arg.',
    params: [
      { name: 'arg', type: 'boolean', description: 'Boolean value' }
    ],
    returns: 'boolean',
    examples: ['$not(true) /* false */'],
    docsUrl: 'https://docs.jsonata.org/boolean-functions#not'
  },
  {
    name: '$exists',
    signature: '$exists(arg)',
    description: 'Returns true if arg exists (is not undefined).',
    params: [
      { name: 'arg', type: 'any', description: 'Value to check' }
    ],
    returns: 'boolean',
    examples: ['$exists(foo) /* true if foo is defined */'],
    docsUrl: 'https://docs.jsonata.org/boolean-functions#exists'
  },

  // Array Functions
  {
    name: '$count',
    signature: '$count(array)',
    description: 'Returns the number of elements in array.',
    params: [
      { name: 'array', type: 'array', description: 'Input array' }
    ],
    returns: 'number',
    examples: ['$count([1, 2, 3]) /* 3 */'],
    docsUrl: 'https://docs.jsonata.org/array-functions#count'
  },
  {
    name: '$append',
    signature: '$append(array1, array2)',
    description: 'Concatenates array2 to array1.',
    params: [
      { name: 'array1', type: 'array', description: 'First array' },
      { name: 'array2', type: 'array', description: 'Second array' }
    ],
    returns: 'array',
    examples: ['$append([1, 2], [3, 4]) /* [1, 2, 3, 4] */'],
    docsUrl: 'https://docs.jsonata.org/array-functions#append'
  },
  {
    name: '$sort',
    signature: '$sort(array, function?)',
    description: 'Sorts array, optionally using a comparison function.',
    params: [
      { name: 'array', type: 'array', description: 'Array to sort' },
      { name: 'function', type: 'function', optional: true, description: 'Comparison function' }
    ],
    returns: 'array',
    examples: ['$sort([3, 1, 2]) /* [1, 2, 3] */'],
    docsUrl: 'https://docs.jsonata.org/array-functions#sort'
  },
  {
    name: '$reverse',
    signature: '$reverse(array)',
    description: 'Returns array in reverse order.',
    params: [
      { name: 'array', type: 'array', description: 'Array to reverse' }
    ],
    returns: 'array',
    examples: ['$reverse([1, 2, 3]) /* [3, 2, 1] */'],
    docsUrl: 'https://docs.jsonata.org/array-functions#reverse'
  },
  {
    name: '$shuffle',
    signature: '$shuffle(array)',
    description: 'Returns array with elements in random order.',
    params: [
      { name: 'array', type: 'array', description: 'Array to shuffle' }
    ],
    returns: 'array',
    examples: ['$shuffle([1, 2, 3, 4])'],
    docsUrl: 'https://docs.jsonata.org/array-functions#shuffle'
  },
  {
    name: '$distinct',
    signature: '$distinct(array)',
    description: 'Returns array with duplicate values removed.',
    params: [
      { name: 'array', type: 'array', description: 'Input array' }
    ],
    returns: 'array',
    examples: ['$distinct([1, 2, 2, 3, 3, 3]) /* [1, 2, 3] */'],
    docsUrl: 'https://docs.jsonata.org/array-functions#distinct'
  },
  {
    name: '$zip',
    signature: '$zip(array1, array2, ...)',
    description: 'Combines multiple arrays element-wise.',
    params: [
      { name: 'array1', type: 'array', description: 'First array' },
      { name: 'array2', type: 'array', description: 'Additional arrays' }
    ],
    returns: 'array',
    examples: ['$zip([1, 2], ["a", "b"]) /* [[1, "a"], [2, "b"]] */'],
    docsUrl: 'https://docs.jsonata.org/array-functions#zip'
  },

  // Object Functions
  {
    name: '$keys',
    signature: '$keys(object)',
    description: 'Returns an array of the keys in object.',
    params: [
      { name: 'object', type: 'object', description: 'Input object' }
    ],
    returns: 'array',
    examples: ['$keys({"a": 1, "b": 2}) /* ["a", "b"] */'],
    docsUrl: 'https://docs.jsonata.org/object-functions#keys'
  },
  {
    name: '$lookup',
    signature: '$lookup(object, key)',
    description: 'Returns the value of key in object.',
    params: [
      { name: 'object', type: 'object', description: 'Input object' },
      { name: 'key', type: 'string', description: 'Key to lookup' }
    ],
    returns: 'any',
    examples: ['$lookup({"a": 1, "b": 2}, "a") /* 1 */'],
    docsUrl: 'https://docs.jsonata.org/object-functions#lookup'
  },
  {
    name: '$spread',
    signature: '$spread(object)',
    description: 'Converts an object into an array of key-value pairs.',
    params: [
      { name: 'object', type: 'object', description: 'Input object' }
    ],
    returns: 'array',
    examples: ['$spread({"a": 1, "b": 2}) /* [{"a": 1}, {"b": 2}] */'],
    docsUrl: 'https://docs.jsonata.org/object-functions#spread'
  },
  {
    name: '$merge',
    signature: '$merge(array)',
    description: 'Merges an array of objects into a single object.',
    params: [
      { name: 'array', type: 'array', description: 'Array of objects' }
    ],
    returns: 'object',
    examples: ['$merge([{"a": 1}, {"b": 2}]) /* {"a": 1, "b": 2} */'],
    docsUrl: 'https://docs.jsonata.org/object-functions#merge'
  },
  {
    name: '$sift',
    signature: '$sift(object, function)',
    description: 'Returns a new object with only the properties where function returns true.',
    params: [
      { name: 'object', type: 'object', description: 'Input object' },
      { name: 'function', type: 'function', description: 'Predicate function' }
    ],
    returns: 'object',
    examples: ['$sift(obj, function($v) { $v > 5 })'],
    docsUrl: 'https://docs.jsonata.org/object-functions#sift'
  },
  {
    name: '$each',
    signature: '$each(object, function)',
    description: 'Applies function to each key-value pair in object.',
    params: [
      { name: 'object', type: 'object', description: 'Input object' },
      { name: 'function', type: 'function', description: 'Function to apply' }
    ],
    returns: 'array',
    examples: ['$each({"a": 1, "b": 2}, function($v, $k) { $k & "=" & $v })'],
    docsUrl: 'https://docs.jsonata.org/object-functions#each'
  },
  {
    name: '$error',
    signature: '$error(message?)',
    description: 'Throws an error with optional message.',
    params: [
      { name: 'message', type: 'string', optional: true, description: 'Error message' }
    ],
    returns: 'never',
    examples: ['$error("Invalid input")'],
    docsUrl: 'https://docs.jsonata.org/object-functions#error'
  },
  {
    name: '$assert',
    signature: '$assert(condition, message?)',
    description: 'Throws an error if condition is false.',
    params: [
      { name: 'condition', type: 'boolean', description: 'Condition to check' },
      { name: 'message', type: 'string', optional: true, description: 'Error message' }
    ],
    returns: 'undefined',
    examples: ['$assert(age >= 18, "Must be 18 or older")'],
    docsUrl: 'https://docs.jsonata.org/object-functions#assert'
  },
  {
    name: '$type',
    signature: '$type(value)',
    description: 'Returns the type of value as a string.',
    params: [
      { name: 'value', type: 'any', description: 'Value to check' }
    ],
    returns: 'string',
    examples: ['$type(123) /* "number" */', '$type([]) /* "array" */'],
    docsUrl: 'https://docs.jsonata.org/object-functions#type'
  },

  // Higher Order Functions
  {
    name: '$map',
    signature: '$map(array, function)',
    description: 'Applies function to each element in array and returns a new array.',
    params: [
      { name: 'array', type: 'array', description: 'Input array' },
      { name: 'function', type: 'function', description: 'Transformation function' }
    ],
    returns: 'array',
    examples: ['$map([1, 2, 3], function($v) { $v * 2 }) /* [2, 4, 6] */'],
    docsUrl: 'https://docs.jsonata.org/higher-order-functions#map'
  },
  {
    name: '$filter',
    signature: '$filter(array, function)',
    description: 'Returns elements from array where function returns true.',
    params: [
      { name: 'array', type: 'array', description: 'Input array' },
      { name: 'function', type: 'function', description: 'Predicate function' }
    ],
    returns: 'array',
    examples: ['$filter([1, 2, 3, 4], function($v) { $v > 2 }) /* [3, 4] */'],
    docsUrl: 'https://docs.jsonata.org/higher-order-functions#filter'
  },
  {
    name: '$reduce',
    signature: '$reduce(array, function, init?)',
    description: 'Reduces array to a single value using function.',
    params: [
      { name: 'array', type: 'array', description: 'Input array' },
      { name: 'function', type: 'function', description: 'Reducer function(accumulator, value)' },
      { name: 'init', type: 'any', optional: true, description: 'Initial value' }
    ],
    returns: 'any',
    examples: ['$reduce([1, 2, 3], function($acc, $v) { $acc + $v }, 0) /* 6 */'],
    docsUrl: 'https://docs.jsonata.org/higher-order-functions#reduce'
  },
  {
    name: '$singletonArray',
    signature: '$singletonArray(value)',
    description: 'Wraps value in an array if it is not already an array.',
    params: [
      { name: 'value', type: 'any', description: 'Value to wrap' }
    ],
    returns: 'array',
    examples: ['$singletonArray(5) /* [5] */', '$singletonArray([1, 2]) /* [1, 2] */'],
    docsUrl: 'https://docs.jsonata.org/higher-order-functions#singletonarray'
  },

  // Date/Time Functions
  {
    name: '$now',
    signature: '$now(picture?, timezone?)',
    description: 'Returns the current timestamp, optionally formatted.',
    params: [
      { name: 'picture', type: 'string', optional: true, description: 'Format string' },
      { name: 'timezone', type: 'string', optional: true, description: 'Timezone' }
    ],
    returns: 'string',
    examples: ['$now() /* "2023-10-15T14:30:00.000Z" */', '$now("[Y0001]-[M01]-[D01]")'],
    docsUrl: 'https://docs.jsonata.org/date-time-functions#now'
  },
  {
    name: '$millis',
    signature: '$millis()',
    description: 'Returns the current time in milliseconds since Unix epoch.',
    params: [],
    returns: 'number',
    examples: ['$millis()'],
    docsUrl: 'https://docs.jsonata.org/date-time-functions#millis'
  },
  {
    name: '$fromMillis',
    signature: '$fromMillis(millis, picture?, timezone?)',
    description: 'Converts milliseconds since epoch to a timestamp string.',
    params: [
      { name: 'millis', type: 'number', description: 'Milliseconds since Unix epoch' },
      { name: 'picture', type: 'string', optional: true, description: 'Format string' },
      { name: 'timezone', type: 'string', optional: true, description: 'Timezone' }
    ],
    returns: 'string',
    examples: ['$fromMillis(1697380200000)'],
    docsUrl: 'https://docs.jsonata.org/date-time-functions#frommillis'
  },
  {
    name: '$toMillis',
    signature: '$toMillis(timestamp, picture?)',
    description: 'Converts a timestamp string to milliseconds since epoch.',
    params: [
      { name: 'timestamp', type: 'string', description: 'Timestamp string' },
      { name: 'picture', type: 'string', optional: true, description: 'Format string' }
    ],
    returns: 'number',
    examples: ['$toMillis("2023-10-15T14:30:00Z")'],
    docsUrl: 'https://docs.jsonata.org/date-time-functions#tomillis'
  }
];

// Create a map for quick lookup
export const jsonataFunctionMap = new Map<string, JSONataFunction>(
  jsonataFunctions.map(fn => [fn.name, fn])
);

// Keywords and operators
export const jsonataKeywords = [
  'function', 'lambda', 'if', 'then', 'else', 'and', 'or', 'in', 'null', 'true', 'false'
];

export const jsonataOperators = [
  '~>', ':=', '..', '?', ':', '=', '!=', '<', '>', '<=', '>=',
  '+', '-', '*', '/', '%', '&', '|', 'and', 'or', 'in'
];
