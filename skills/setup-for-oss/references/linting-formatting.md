# Linting & formatting

## eslint.config.js (flat config)

```js
import hrcd from '@hrcd/eslint-config'

export default [
  ...hrcd,
]
```

Notes:
- Ensure dependencies include `@hrcd/eslint-config` and `eslint`.
- Extend or override based on project needs (e.g., add test globals).

## .editorconfig

```ini
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
```
