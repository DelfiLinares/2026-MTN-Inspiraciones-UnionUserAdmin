import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

export default tseslint.config(
  { ignores: ["**/dist/**", "**/node_modules/**", "**/coverage/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Prohíbe `any`.
      "@typescript-eslint/no-explicit-any": "error",
      // Prohíbe la aserción de no nulo (`!`).
      "@typescript-eslint/no-non-null-assertion": "error",
      // Prohíbe aserciones de tipo (`as`). Excepción solo con `eslint-disable-next-line`
      // acompañado de una justificación en el comentario.
      "@typescript-eslint/consistent-type-assertions": [
        "error",
        { assertionStyle: "never" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
);
