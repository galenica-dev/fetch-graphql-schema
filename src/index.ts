import minimist from "minimist";
import fs from "fs";

export async function fetchSchema(url: string, outputPath: string) {
  if (!url) {
    throw new Error("Please provide a GraphQL endpoint URL.");
  }

  if (fs.existsSync(outputPath) && fs.lstatSync(outputPath).isDirectory()) {
    throw new Error(
      "The output path is a directory. Please provide a file name."
    );
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          {
            __schema {
              types {
                name
                kind
                description
                fields {
                  name
                  description
                  args {
                    name
                    description
                    type {
                      kind
                      name
                      ofType {
                        kind
                        name
                        ofType {
                          kind
                          name
                        }
                      }
                    }
                  }
                  type {
                    kind
                    name
                    ofType {
                      kind
                      name
                      ofType {
                        kind
                        name
                      }
                    }
                  }
                }
              }
            }
          }
        `,
      }),
    });

    const result: any = await response.json();
    const schema = JSON.stringify(result.data, null, 2);
    fs.writeFileSync(outputPath, schema);
    console.log(
      `GraphQL schema downloaded successfully and saved to ${outputPath}`
    );
  } catch (error) {
    console.error("Error fetching or saving schema:", error);
    throw error;
  }
}

// This ensures fetchSchema is only called if the script is executed directly
if (require.main === module) {
  const argv = minimist(process.argv.slice(2));
  const url: string = argv._[0];
  const outputPath: string = argv.o || argv.output || "schema.graphql"; // Allow both -o and --output

  fetchSchema(url, outputPath).catch((error) => process.exit(1));
}
