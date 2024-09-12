module.exports = {
  preset: "ts-jest", // Pour permettre à Jest de comprendre TypeScript
  testEnvironment: "node", // Ton code s'exécute dans un environnement Node.js
  testMatch: ["**/__tests__/**/*.ts?(x)", "**/?(*.)+(spec|test).ts?(x)"], // Où trouver tes fichiers de test
};
