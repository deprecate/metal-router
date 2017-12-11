# metal-router

[![Build Status](https://travis-ci.org/metal/metal-router.svg?branch=master)](https://travis-ci.org/metal/metal-router)

[![Build Status](https://saucelabs.com/browser-matrix/metal-router.svg)](https://saucelabs.com/beta/builds/7fd4f0c40d2e4777abd005a50e6ac16b)

Routing solution to link URLs to Metal.js components using HTML5 History API.

![](https://raw.githubusercontent.com/metal/metal-router/master/demos/img/sample.gif)

## Use

### Simple use case

```javascript
import Component from 'metal-component';
import Router from 'metal-router';

class MyComponent extends Component {
  ...
};

Component.render(Router, {
  component: MyComponent,
  data: {
    title: 'Home Page'
  },
  element: '#main > div',
  path: '/path'
});

// Dispatch router to the current browser url
Router.router().dispatch();
```

### JSX

```jsx
<Router
  component={MyComponent}
  data={{
    title: 'Home Page'
  }}
  path="/path"
/>
```

### Soy

```soy
{call Router.render}
  {param component: 'MyComponent' /}
  {param data: ['title': 'Home Page'] /}
  {param path: '/path' /}
{/call}
```

### Passing data

There are multiple ways to pass data to the `component`.
The `data` config property can be an object, or a function that can
return either an object or a promise. The following examples will
all return the same data to `MyComponent`.

```javascript
// Object literal
Component.render(Router, {
  component: MyComponent,
  data: {
    title: 'Home Page'
  },
  path: '/path'
});

// Function
Component.render(Router, {
  component: MyComponent,
  data: function() {
    return {
      title: 'Home Page'
    }
  },
  path: '/path'
});

// Promise
Component.render(Router, {
  component: MyComponent,
  data: function() {
    return new Promise(function(resolve) {
      resolve({
        title: 'Home Page'
      });
    });
  },
  path: '/path'
});
```

If returning a promise, the component will not be rendered until
the promise is resolved.

### Fetching

Data from an Ajax request can easily be passed to the `component`
via the `fetch` and `fetchUrl` config properties.

```javascript
Component.render(Router, {
  component: MyComponent,
  fetch: true,
  fetchUrl: '/some/api.json',
  path: '/path'
});
```

This will fire off a request to `/some/api.json` when `/path` is navigated to,
and pass the returned data directly to `MyComponent`. Note that the component
will not be rendered until the request is complete.

Use the `fetchTimeout` property for setting a max amount of time
for the request.

```javascript
Component.render(Router, {
  component: MyComponent,
  fetch: true,
  fetchTimeout: 10000, // Milliseconds
  fetchUrl: '/some/api.json',
  path: '/path'
});
```

### Parameters

Params can be collected from the path and passed to the `component` alongside
regular data.

```javascript
Component.render(Router, {
  component: MyComponent,
  data: {
    title: 'User Page'
  },
  path: '/user/:name'
});
```

Then if the user navigates to `/user/foo`, the following data
will be passed to the component.

```javascript
{
  router: {
    params: {
      name: 'foo'
    }
  },
  title: 'User Page'
}
```

Query params are also parsed and added to the component data. If
the user navigates to `/user/foo?id=123', the following data will
be passed to the component.

```javascript
{
  router: {
    params: {
      name: 'foo'
    },
    query: {
      id: '123'
    }
  },
  title: 'User Page'
}
```

## Setup

1. Install a recent release of [NodeJS](https://nodejs.org/en/download/) if you
don't have it yet.

2. Install local dependencies:

  ```
  npm install
  ```

3. Run the tests:

  ```
  npm test
  ```

4. Build the code:

  ```
  npm run build
  ```

5. Run the demo:

  ```
  npm run demo
  ```

## Contributing

Check out the [contributing guidelines](https://github.com/metal/metal-uri/blob/master/CONTRIBUTING.md) for more information.
