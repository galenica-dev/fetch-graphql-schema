import fs from "fs";
import fetchMock from "jest-fetch-mock";
import { fetchSchema } from "./index"; // Adjust path if needed

fetchMock.enableMocks();
jest.mock("fs");

// Schéma GraphQL simplifié pour le mock
const mockSchema = {
  __schema: {
    types: [
      {
        name: "Query",
        kind: "OBJECT",
        description: "The root query type",
        fields: [
          {
            name: "launches",
            description: "Get a list of launches",
            args: [],
            type: {
              kind: "LIST",
              name: null,
              ofType: {
                kind: "OBJECT",
                name: "Launch",
                ofType: null,
              },
            },
          },
        ],
      },
    ],
  },
};

describe("fetchSchema", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({ data: mockSchema }));

    // Mock file system behavior
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    (fs.lstatSync as jest.Mock).mockReturnValue({ isDirectory: () => false });
    (fs.writeFileSync as jest.Mock).mockImplementation(() => {});
  });

  it("should fetch and save a GraphQL schema", async () => {
    const url = "http://localhost/graphql";
    const outputPath = "spacex-schema.graphql";
    const expectedSchema = JSON.stringify(mockSchema, null, 2);

    await fetchSchema(url, outputPath);

    // Vérifications
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: expect.any(String),
    });
    expect(fs.writeFileSync).toHaveBeenCalledWith(outputPath, expectedSchema);
  });

  it("should handle fetch errors", async () => {
    fetchMock.mockReject(new Error("Network error"));

    const url = "https://mocked-graphql-endpoint.com/graphql";
    const outputPath = "spacex-schema.graphql";

    try {
      await fetchSchema(url, outputPath);
    } catch (error: any) {
      // Verify the error message and ensure fs.writeFileSync was not called
      expect(error.message).toMatch(
        /Error fetching or saving schema: Network error/
      );
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    }
  });

  it("should throw error if URL is not provided", async () => {
    await expect(fetchSchema("", "schema.graphql")).rejects.toThrow(
      "Please provide a GraphQL endpoint URL."
    );
  });

  it("should throw error if output path is a directory", async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.lstatSync as jest.Mock).mockReturnValue({ isDirectory: () => true });

    const url = "http://localhost/graphql";
    const outputPath = "spacex-schema.graphql";

    await expect(fetchSchema(url, outputPath)).rejects.toThrow(
      "The output path is a directory. Please provide a file name."
    );
  });
});
