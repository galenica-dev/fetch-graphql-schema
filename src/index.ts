#!/usr/bin/env node

import minimist from "minimist";
import fs from "fs";
import { getIntrospectionQuery, buildClientSchema, printSchema } from "graphql";

/**
 * Fetches the GraphQL schema from the given endpoint URL and writes it to a file.
 *
 * @param {string} url - The GraphQL endpoint URL.
 * @param {string} outputPath - The path to save the schema file.
 * @throws {Error} If the URL is invalid or output path is a directory.
 */
export async function fetchSchema(
  url: string,
  outputPath: string
): Promise<void> {
  validateInputs(url, outputPath);

  try {
    const introspectionQuery = getIntrospectionQuery();
    const response = await fetchGraphQLSchema(url, introspectionQuery);

    const result = await response.json();
    const schemaSDL = convertResultToSDL(result);

    saveSchemaToFile(outputPath, schemaSDL);

    logSuccess(outputPath);
  } catch (error) {
    logError(error as Error);
    throw error;
  }
}

/**
 * Validates the inputs provided to the fetchSchema function.
 *
 * @param {string} url - The GraphQL endpoint URL.
 * @param {string} outputPath - The path to save the schema file.
 * @throws {Error} If the URL is missing or outputPath is a directory.
 */
function validateInputs(url: string, outputPath: string): void {
  if (!url) {
    throw new Error("Please provide a GraphQL endpoint URL.");
  }

  if (fs.existsSync(outputPath) && fs.lstatSync(outputPath).isDirectory()) {
    throw new Error(
      "The output path is a directory. Please provide a file name."
    );
  }
}

/**
 * Fetches the GraphQL schema using the introspection query.
 *
 * @param {string} url - The GraphQL endpoint URL.
 * @param {string} introspectionQuery - The introspection query string.
 * @returns {Promise<Response>} The fetch response.
 */
async function fetchGraphQLSchema(
  url: string,
  introspectionQuery: string
): Promise<Response> {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: introspectionQuery }),
  });
}

/**
 * Converts the fetch result into a printable SDL schema.
 *
 * @param {any} result - The result from the GraphQL server.
 * @returns {string} The schema in SDL format.
 * @throws {Error} If the result is invalid.
 */
function convertResultToSDL(result: any): string {
  const schema = buildClientSchema(result?.data);
  return printSchema(schema);
}

/**
 * Saves the schema SDL to the specified output file.
 *
 * @param {string} outputPath - The path to save the schema.
 * @param {string} schemaSDL - The schema SDL string.
 */
function saveSchemaToFile(outputPath: string, schemaSDL: string): void {
  fs.writeFileSync(outputPath, schemaSDL);
}

/**
 * Logs success message after the schema is saved.
 *
 * @param {string} outputPath - The path where the schema was saved.
 */
function logSuccess(outputPath: string): void {
  console.log(
    `GraphQL schema downloaded successfully and saved to ${outputPath}`
  );
}

/**
 * Logs any error that occurs during schema fetching or saving.
 *
 * @param {Error} error - The error object.
 */
function logError(error: Error): void {
  console.error("Error fetching or saving schema:", error);
}

// CLI logic: Only execute fetchSchema if the script is run directly
if (require.main === module) {
  const argv = minimist(process.argv.slice(2));
  const {
    _: [url],
    o: outputPathOption,
    output: outputPathLong,
  } = argv;

  const outputPath = outputPathOption || outputPathLong || "schema.graphql"; // Support both -o and --output

  fetchSchema(url, outputPath).catch((error) => process.exit(1));
}
