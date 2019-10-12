module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  extends: ['@nuxtjs', 'plugin:nuxt/recommended'],
  rules: {
    'nuxt/no-cjs-in-config': 'off',
    // custom rules
    quotes: ['warn', 'single', { avoidEscape: true }],
    semi: ['warn', 'always'],
    'no-console': ['warn', { allow: ['error'] }],
    'arrow-parens': ['error', 'always'],
    'space-before-function-paren': 'off',
    indent: 'off',
    'standard/computed-property-even-spacing': 'off',
    'vue/no-v-html': 'off',
    'vue/html-self-closing': [
      'warn',
      {
        html: {
          void: 'any',
          normal: 'always',
          component: 'always'
        },
        svg: 'always',
        math: 'always'
      }
    ],
    'vue/max-attributes-per-line': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    'vue/multiline-html-element-content-newline': 'off'
  }
}
