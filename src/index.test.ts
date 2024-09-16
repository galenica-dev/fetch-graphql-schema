import { fetchSchema } from "./index";
import fs from "fs";
import { ApolloServer } from "apollo-server";

// Utility Functions

/**
 * Normalize schema by removing extra spaces and trimming the string.
 * This ensures whitespace differences are not considered in comparisons.
 */
function normalizeSchema(schema: string): string {
  return schema.replace(/\s+/g, " ").trim();
}

/**
 * Remove the file if it exists.
 * This helps to ensure clean test runs by removing any leftover files.
 */
function cleanupFile(filePath: string): void {
  fs.rmSync(filePath, { force: true });
}

// Test setup

const outputPath = "schema.graphql";

// Define the expected schema for the test
const typeDefs = `
  type Query {
    hello: String
  }
`;

// Initialize the Apollo Server with the schema
const testServer = new ApolloServer({ typeDefs });

describe("fetchSchema Integration Tests", () => {
  let graphqlEndpoint: string;

  beforeAll(async () => {
    // Start the test server and retrieve the URL (GraphQL endpoint)
    const { url } = await testServer.listen();
    graphqlEndpoint = url;
  });

  afterAll(async () => {
    // Stop the server after all tests have completed
    await testServer.stop();
  });

  beforeEach(() => {
    // Clean up the schema file before each test to avoid leftover data
    cleanupFile(outputPath);
  });

  afterEach(() => {
    // Ensure the schema file is removed after each test
    cleanupFile(outputPath);
  });

  it("should fetch the schema and write it to the output file", async () => {
    const expectedSchema = `
      type Query {
        hello: String
      }
    `;

    // Fetch the schema from the server and write it to the specified output path
    await fetchSchema(graphqlEndpoint, outputPath);

    // Read the schema from the output file
    const actualSchema = fs.readFileSync(outputPath, "utf-8");

    // Normalize and compare the fetched schema with the expected one
    expect(normalizeSchema(actualSchema)).toEqual(
      normalizeSchema(expectedSchema)
    );
  });

  it("should throw an error if no URL is provided", async () => {
    // Expect an error to be thrown if an empty URL is provided
    await expect(fetchSchema("", outputPath)).rejects.toThrow(
      "Please provide a GraphQL endpoint URL."
    );

    await expect(fetchSchema("_not/an.url", outputPath)).rejects.toThrow(
      "Invalid GraphQL endpoint URL."
    );
  });

  it("should throw an error if output path is a directory", async () => {
    // Expect an error to be thrown if the output path is a directory instead of a file
    await expect(fetchSchema(graphqlEndpoint, "/")).rejects.toThrow(
      "The output path is a directory. Please provide a file name."
    );
  });
});
