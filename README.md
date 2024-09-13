# @galenica-dev/fetch-graphql-schema

[![Galenica Logo](https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT28SnSz-u4kK7ZWy9KKdzNN5o_qOCFNMCSRw&s)](https://www.galenica.com)

A simple and efficient command-line tool to download and save GraphQL schemas locally for easy development and integration purposes.

## Features

- Fetches the full GraphQL schema from a specified endpoint URL
- Saves the schema in the SDL (Schema Definition Language) format to a local file
- Supports custom output paths for flexibility
- Built with TypeScript for type safety and reliability
- Provides clear error messaging for invalid URLs or paths

## Prerequisites

- Node.js version 18 or higher
- npm (Node Package Manager)

## Installation

To install the package globally on your system, run:

```bash
npm install -g @galenica-dev/fetch-graphql-schema
```

## Usage

Once installed, you can use the tool to fetch a schema from a GraphQL endpoint and save it to a file:

```bash
fetch-graphql-schema <graphql-endpoint-url> -o <output-file-path>
```

### Example

To fetch a schema from `https://example.com/graphql` and save it as `schema.graphql`:

```bash
fetch-graphql-schema https://example.com/graphql -o schema.graphql
```

If no output path is specified, the default output file will be `schema.graphql` in the current directory.

### Options

- `<graphql-endpoint-url>`: The URL of the GraphQL endpoint from which to fetch the schema.
- `-o, --output`: Specifies the output file path. If omitted, the schema will be saved to `schema.graphql` in the current directory.

### Error Handling

- If the provided URL is missing or invalid, an error will be thrown: `Please provide a valid GraphQL endpoint URL.`
- If the output path is a directory instead of a file, an error will be thrown: `The output path is a directory. Please provide a file name.`

## Sponsorship

This project is open-source and maintained by the Galenica Development Team. Development and maintenance of this project are sponsored by [Galenica](https://www.galenica.com).

## License

This project is licensed under the MIT License
