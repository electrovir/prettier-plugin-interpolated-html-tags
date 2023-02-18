# prettier-plugin-interpolated-html-tags

Support interpolated tag names for HTML in Prettier formatting.

# Dev

To debug tests do the following:

1. run `npm test -- --inspect-brk`
2. open Chrome and attach the node inspector
3. add `debugger` to your code somewhere
4. kill the tests
5. run `npm test -- --inspect`
    1. so you don't have to play through the initial breaks every time
