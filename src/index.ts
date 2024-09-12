import minimist from "minimist";
import fs from "fs";

const argv = minimist(process.argv.slice(2));

const url: string = argv._[0];
const outputPath: string = argv.o || argv.output || "schema.graphql"; // Allow both -o and --output

if (!url) {
  console.error("Please provide a GraphQL endpoint URL.");
  process.exit(1);
}

if (fs.existsSync(outputPath) && fs.lstatSync(outputPath).isDirectory()) {
  console.error("The output path is a directory. Please provide a file name.");
  process.exit(1);
}

fetch(url, {
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
})
  .then((res) => res.json())
  .then((res: { data: any }) => {
    // Add type annotation for better clarity
    const schema = JSON.stringify(res.data, null, 2);
    fs.writeFileSync(outputPath, schema);
    console.log(
      `GraphQL schema downloaded successfully and saved to ${outputPath}`
    );
  })
  .catch((error) => {
    console.error("Error fetching or saving schema:", error);
    process.exit(1);
  });
