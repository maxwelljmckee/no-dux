# `no-dux`
A ridiculously lightweight and easy-to-use state management alternative to Redux

- [Why no-dux](#why-no-dux)
- [TLDR](#tldr)
- [Getting Started](#getting-started)
- [Core API](#core-api)
  - [createStore](#createstore)
  - [Data Setters](#data-setters)
    - [setItem](#setitem)
    - [removeItem](#removeitem)
    - [clear](#clear)
  - [Data Getters](#data-getters)
    - [getStore](#getstore)
    - [getItem](#getitem)
    - [getSize](#getsize)
  - [Nodux Actions](#nodux-actions)
    - [registerActions](#registeractions)
    - [registerPartitionedActions](#registerpartitionedactions)
    - [Calling Your Actions](#calling-your-actions)
    - [Scalability](#scalability)
- [React Hooks API](#react-hooks-api)
  - [useStore](#usestore)
  - [useAutosave](#useautosave)

# Why `no-dux`?
## You're looking for a new state management solution
If you're a frontend or fullstack developer, chances are you've had some experience working with Redux. If you're anything like me, your initial impression was mostly positive. "What a great tool," you thought, but as time went on you started asking questions like, "but why does it have so much boilerplate? And why does my data disappear on a page reload? Sure I can chuck it in localStorage to persist, but then I'm clogging up memory with unnecessary duplication. And what the heck is a reducer anyway?"

In recent years, many developers have abandoned Redux in favor of the React Context API, which captures nearly all the same use cases with less configuration. But if you're not careful, both of these technologies can lead you into a trap – unnecessary rerenders. At a glance this may seem inconsequential. Maybe you're a pro and you think it's somebody else's problem. But as your application and your team scale in size and complexity, controlling your rerender can become harder and harder to maintain, and may ultimately result in non-trivial performance issues.

<br />

## What makes `no-dux` different?
- It is aggressively easy to set up, learn, and use
- It reduces your application's boilerplate and runtime memory overhead
- It handles data persistence over page reload without additional configuration or libraries
- _**Stateful rerender is 100% opt-in**_, putting you back in charge of your application's performance
- The core library is 100% framework agnostic, and its **unpacked bundle size is only _14kb_ with _zero dependencies!!_**

<br />

## How does it work?
Instead of overengineering another complex data-persistence solution, `no-dux` works by extending the browser's native data-persistence tools through the `localStorage` api.

Most developers probably think of `localStorage` as a glorified set of key-value pairs. It's fine for storing a few odds and ends, but it's not powerful or flexible enough to meet your application's state-management needs.

`no-dux` opens up a new world of possibility by making it easy to set and remove _**deeply nested**_ data in your browser's localStorage. With `no-dux`, you enter your store through a single root node in your localStorage, and from there you can build a data-tree as large and complex as your application. We take care of the nesting and the JSON parsing for you!

<br />

[back to top](#no-dux)

<br />

# TLDR
Okay, here's the short version:
- use `nodux.createStore` to instantiate your store somewhere near the top level of your application
- use `nodux.setItem` to update your store
- use `nodux.removeItem` to delete values from your store
- use `nodux.getItem` to reference values in your store
- keep your code DRY and maintainable by encapsulating your store update methods in reuseable `actions` with `nodux.registerActions`
```js
// top level module

import { nodux } from '@no-dux/core';
  // or '@no-dux/react' when using the react extension

nodux.createStore({ root: 'demoApp' });
  // => demoApp = {}

createUserActions();
  // optionally instantiate some actions along with your store

const App = () => {...};
```
<br/>

```js
// actions creator module

// this pattern functionally replaces the entire constants => actions => reducer boilerplate of Redux

import { nodux } from '@no-dux/core';

const loginUser = (token) => nodux.setItem('auth', { authToken: token });

const logoutUser = () => nodux.removeItem('auth');

const updateUsername = (newName) => nodux.setItem('user', { name: newName });

const updateUiTheme = (darkTheme) => nodux.setItem('uiSettings', { darkTheme });

export const createUseActions = () = {
  nodux.registerActions({
    loginUser,
    logoutUser,
    updateUsername,
    updateUiTheme,
  });
};
```
<br/>

```js
// anywhere within your application

import { nodux } from '@no-dux/core';

nodux.setItem('user', { name: 'demoUser', favoriteAnimal: 'Bibo the cat' });
  // => demoStore = { user: { name: 'demoUser', favoriteAnimal: 'Bibo the cat' } }

nodux.getItem('user.favoriteAnimal');
  // => 'Bibo the cat'

nodux.removeItem('user', ['favoriteAnimal']);
  // => demoStore = { user: { name: 'demoUser' } }


// alternatively using normalized actions

const { actions } = nodux;

actions.loginUser(token);
  // => demoStore = { auth: { authToken: token } }

actions.updateUiTheme({ darkTheme: true });
  // => demoStore = { auth: { authToken: token }, uiSettings: { darkTheme: true } }
```


<br />

[back to top](#no-dux)

<br />

# Getting Started

```
npm install @no-dux/core
```
or
```
yarn add @no-dux/core
```

<br />

[back to top](#no-dux)

<br />

# Core API
## createStore
### `nodux.createStore({ root?: string, defaultStore?: object })`
<br />

The first thing we'll need to do is instantiate our store somewhere near the top level of our application. If you're working on a React app, you'll likely prefer to use your `App` component. We'll also specify some default values so we have some data to work with in upcoming examples. That looks like this:
```js
import { nodux } from '@no-dux/core';
// or @no-dux/react if using the extension

const storeDefaults = {

  auth: {
    sessionToken: '...',
    refreshToken: '...',
    ...
  },

  user: {
    name: 'dudeGuy',
    email: 'dude@guy.com',
    id: 'un1qu3$tr1ng',
    randomThing: 'moreStuff',
    ...
  },

  uiSettings: {
    darkTheme: true,
    ...
  },

};

nodux.createStore({ root: 'demoApp', defaults: storeDefaults });
```

<br />

Notice that our example store has a knowledge of some auth data, some user data, and some ui settings.
## Arguments
- The value of `root` will be used as the name for the root node of store's data-tree. If no value is provided, the name will default to "root"
- If desired, default values can be set to the store using the `defaultStore` argument. If no defaults are specified, the store will simply be initialized as an empty object at the root node

<br />

[back to top](#no-dux)

<br />

# Data Setters
## setItem
### `nodux.setItem(path: string | string[], item: string | object)`
<br />

Suppose our user has a pet whose information we would like to remember. We would get that information from the user and set it in our store like this:
```js
import { nodux } from '@no-dux/core';

nodux.setItem('user.pet', { type: 'cat', name: 'Bibo the cat' });
```
The `path` argument tells `no-dux` how to key into the store's data-tree to find the item we'd like to update.

If a node in the path does not exist in the current data-tree, it will be automatically set to an empty object. We don't need to set `pet` as a property of `user` before we start writing values into it, we can simply write values into `user.pet` and `no-dux` handles the rest!

<br />

We can also use an array to define the path. That looks like this:
```js
nodux.setItem(['user', 'pet'], { type: 'cat', name: 'Bibo the cat' });
```

<br />

The expected result of these operations on our store looks like this:
```js
// store

demoApp: {

  auth: {
    sessionToken: '...',
    refreshToken: '...',
    ...
  },

  user: {
    name: 'dudeGuy',
    email: 'dude@guy.com',
    id: 'un1qu3$tr1ng',
    randomThing: 'moreStuff',


    // pet data updated
    pet: {
      name: 'Bibo the cat',
      type: 'cat',
    },

    ...
  },

  uiSettings: {
    darkTheme: true,
    ...
  },

};
```

<br />

[back to top](#no-dux)

<br />


## removeItem
### `nodux.removeItem(path: string | string[], blacklist?: string | string[])`

<br />

Now, suppose our user decides they want to logout of their current session. We'll probably want to remove any relevant auth information from the store.

To remove an item from our store, we need to provide a path to the item so `no-dux` knows where to look for it. The `blacklist` argument can be a string, an array of strings, or nothing! Let's explore the possibilities:
```js
nodux.removeItem('auth', ['sessionToken', 'refreshToken']);
```

<br />

The above option will remove only the `sessionToken` and `refreshToken` properties of the auth object, leaving the rest intact. The result should look like this:
```js
// store

demoApp: {

  auth: {
    ...
  },

  user: {
    name: 'dudeGuy',
    email: 'dude@guy.com',
    id: 'un1qu3$tr1ng',
    randomThing: 'moreStuff',
    pet: {
      name: 'Bibo the cat',
      type: 'cat',
    },
    ...
  },

  uiSettings: {
    darkTheme: true,
    ...
  },

};
```

<br />

But suppose we'd like to remove the auth object entirely. We're just going to reset it when the user logs back in anyway, right?

To remove an item completely, we can simply provide _**no argument**_ for `blacklist`. That looks like this:
```js
nodux.removeItem('auth');
```
and the expected result of this operation looks like this:
```js
// store

demoApp: {

  user: {
    name: 'dudeGuy',
    email: 'dude@guy.com',
    id: 'un1qu3$tr1ng',
    randomThing: 'moreStuff',
    pet: {
      name: 'Bibo the cat',
      type: 'cat',
    },
    ...
  },

  uiSettings: {
    darkTheme: true,
    ...
  },

};
```

<br />

See? The `auth` object has been completely removed from the store. Anytime no `blacklist` argument is provided to `removeItem`, nodux will completely remove the last node in the path. Otherwise, it will remove the items specified in the `blacklist`. Okay, let's look at one more example of how to use `removeItem`:

Suppose we want to remove the `randomThing` property from our `user` object. Hey what's that random thing doing in there anyway??

Any time we only want to remove a single item, we can specify `blacklist` as a simple string, rather than an array of strings, like this:
```js
nodux.removeItem('user', 'randomThing');
```
Super! Now that we've removed our user's session data and that random thing, our store should look like this:
```js
// store

demoApp: {

  user: {
    name: 'dudeGuy',
    email: 'dude@guy.com',
    id: 'un1qu3$tr1ng',
    pet: {
      name: 'Bibo the cat',
      type: 'cat',
    },
    ...
  },

  uiSettings: {
    darkTheme: true,
    ...
  },

};
```

<br />

[back to top](#no-dux)

<br />


## clear
### `nodux.clear()`
<br />

This one is pretty straightforward. Use nodux.clear when you want to scrap the entire store and return an empty object at your root node. That looks like this:
```js
nodux.clear();
```
and the result looks like this:
```js
// store

demoApp: {}
```

<br />

[back to top](#no-dux)

<br />


# Data Getters
**IMPORTANT**: With `no-dux`, stateful update is 100% opt-in. That means that data-getters can provide a _**snapshot**_ of the store when a component renders, but _**component rerender will not be triggered by store updates**_. For stateful component rerender, please see the [React Hooks API](#react-hooks-api) section of the docs.

We've learned how to set and remove data from our store, but what if we just want to take a peek inside and see what's there? That's where **getters** come in!

Let's go back to an earlier version of our store example to learn about getters:
```js
// store

demoApp: {

  auth: {
    sessionToken: '...',
    refreshToken: '...',
    ...
  },

  user: {
    name: 'dudeGuy',
    email: 'dude@guy.com',
    id: 'un1qu3$tr1ng',
    randomThing: 'moreStuff',
    pet: {
      name: 'Bibo the cat',
      type: 'cat',
    },
    ...
  },

  uiSettings: {
    darkTheme: true,
    ...
  },

};
```

<br />

## getStore
### `nodux.getStore()`
<br />

This one is pretty straightforward. It simply returns the entire store! That looks like this:
```js
const store = nodux.getStore();
```
Easy! Now you have the whole store and you can get whatever you need.

<br />

[back to top](#no-dux)

<br />


## getItem
### `nodux.getItem(path: string | string[])`
<br />

Cool, so getStore is great and all, but you'll likely find it more useful to grab a specific slice of state out of your store. That's where `getItem` comes in. It takes in a path just like `setItem` and `removeItem`, and returns whatever it finds at the end of that path like this:
```js
const worldsBestCat = nodux.getItem('user.pet.name');

console.log(worldsBestCat);  // => 'Bibo the cat'
```

<br />

[back to top](#no-dux)

<br />


## getSize
### `nodux.getSize()`
<br />

getSize is a convenience method provided to check the current memory usage of your store. It simply calculates memory allocation based on the total number of characters in your JSON-stringified store and displays an alert message on the browser. To use, simply call it in your code like this:
```js
<TestSizeButton onClick={nodux.getSize} />
```
You can test your store's size however you want. The example above is a `TestSizeButton` React component that would reveal the alert message when clicked. Obviously this is intended for testing purposes only and should be removed from your production application.

<br />

[back to top](#no-dux)

<br />


# Nodux Actions
Super! We're finally ready to talk about `actions`!

At this point, many of you may be thinking, "it's true, Redux boilerplate is a pain, but one thing I do like is the way the `dispatch => action => reducer` pattern normalizes my actions into reuseable state update methods. I can dispatch the same action from anywhere in my application and get a reliable result. Does no-dux provide a similar solution for action normalization?"

<br />

The answer to this question is **no-dux actions**!

Using actions, you'll have reuseable state-update methods that you can call from anywhere in your application, keeping your code DRY and maintainable.

<br />

## registerActions
### `nodux.registerActions(actions: object)`
<br />

First you'll want to create a new module where your actions will live. I prefer this convention for structuring my project's file-tree:
```
demoApp/
  src/
    components/
    bunchOfOtherStuff/
    store/
      actions/
        userActions.js
```
Now that you've set up your file-tree and created a new module for your actions, you're ready to start defining some normalized actions:
```js
// userActions.js

import { nodux } from '@no-dux/core';

const setUserData = (userData) => nodux.setItem('user', userData);

const setUserPet = (petData) => nodux.setItem('user.pet', petData);

export const createUserActions = () => {
  nodux.registerActions({
    setUserData,
    setUserPet,
  });
}
```
There's no reason you can't do other things in the body of your action too. Perhaps you'd like to build an action that looks more like this:
```js
const setUserData = (payload) => {
  const backendData = // do some backend call thing
  const updatedPayload = // transform original payload
  nodux.setItem('path', updatedPayload);
}
```
Awesome! The last step to ensure that you have access to your actions throughout your application is to take your handy new `createUserActions` function, and call it somewhere near the top level of your application. Right next to `createStore` ought to be a good spot:
```js
// top level module

import { nodux } from '@no-dux/core';
import { createUserActions } from './src/store/actions/userActions';

nodux.createStore({ root: 'demoApp' });
createUserActions();
```
Simple as that! Now our actions will be available through nodux from anywhere in our application.

<br />

[back to top](#no-dux)

<br />

## registerPartitionedActions
### `nodux.registerPartitionedActions(subdomain: string, actions: object)`
<br />

If you're concerned about the scalability of keeping all of your actions in one large registry, you can add a layer of encapsulation by partitioning your actions into subdomains. Usage is exactly the same as the `registerActions` method, except that it takes in a subdomain string as its first argument. The actions provided will now be encapsulated within that subdomain, bringing an extra layer of organization to your action registry.
```js
// userActions.js

import { nodux } from '@no-dux/core';

const setUserData = (userData) => nodux.setItem('user', userData);

const setUserPet = (petData) => nodux.setItem('user.pet', petData);

export const createUserActions = () => {
  nodux.registerPartitionedActions('userActions', {
    setUserData,
    setUserPet,
  });
}
```

<br />

[back to top](#no-dux)

<br />

## Calling Your Actions
Now that you have registered your actions with no-dux and created them at the top of your application, what should you do when you want to use them in a module? Easy, you have access to them through nodux:
```js
// another module anywhere in your application

import { nodux } from '@no-dux/core';

const MyModule = () => {

  const userData = fetchUser();

  // for un-partitioned actions
  const { actions } = nodux;
  actions.setUserData(userData);

  // for partitioned actions
  const { userActions } = nodux.actions;
  userActions.setUserData(userData)


  // the syntax below is also perfectly fine
  // I just prefer the look of the object destructuring way

  nodux.actions.setUserData(userData);
};

```

<br />

[back to top](#no-dux)

<br />


## Scalability
As our applications grow, we may find ourselves with a ballooning number of actions-creator modules, resulting in a growing list of actions-creator calls in our top level application module:
```js
// top level module

import ...

nodux.createStore({ root: 'demoApp' });
createUserActions();
createProductActions();
createShoppingCartActions();
createFlimflamActions();
createMumboJumboActions();
createRandomActions();
...
```


If, like me, you don't like the look of a bunch of actions-creators cluttering up your top-level app module, I'd recommend simply adding an `index.js` file to your actions directory like this:
```
demoApp/
  src/
    components/
    bunchOfOtherStuff/
    store/
      actions/
        index.js
        ...
```

It might look something like this:
```js
// src/store/actions/index.js

import ... all actions-creators here

export const createStoreActions = () => {
  createUserActions();
  createProductActions();
  createShoppingCartActions();
  createFlimflamActions();
  createMumboJumboActions();
  createRandomActions();
};
```
And then your app module will be nice and cleaned up:
```js
// top level module

import { nodux } from '@no-dux/core';
import { createStoreActions } from './src/store/actions/index';

nodux.createStore({ root: 'demoApp' });
createStoreActions();
```
Ahh, now doesn't that feel better?

<br />

[back to top](#no-dux)

<br />


# React Hooks API
One of the most exciting features of `no-dux` is that it gives you 100% complete control of your component rerenders. That's because all store updates happen the background unless you opt-in to listening for store updates.

That's where the React hooks api comes in. The `@no-dux/react` extension allows you to hook into your component state and receive background store updates as local state updates.

Let's remember our store example one more time to talk about the React Hooks API:
```js
// store

demoApp: {

  auth: {
    sessionToken: '...',
    refreshToken: '...',
    ...
  },

  user: {
    name: 'dudeGuy',
    email: 'dude@guy.com',
    id: 'un1qu3$tr1ng',
    randomThing: 'moreStuff',
    pet: {
      name: 'Bibo the cat',
      type: 'cat',
    },
    ...
  },

  uiSettings: {
    darkTheme: true,
    ...
  },

};
```

<br />

## useStore
### `useStore(path?: string | string[])`
<br />

When used without a `path` argument, useStore will simply return the entire contents of your store. That looks like this:
```js
// component renders on every store update

const store = useStore();
```
However, this comes with an obvious downside. When you listen to the whole store, it will update whenever *any property at any nested level* is updated.

Using the `path` argument of the `useStore` hook allows you to be more specific about which store updates will trigger component updates:
```js
// component updates only when user updates

const { user } = useStore('user');

nodux.setItem('uiSettings', { darkTheme: false }); // => DOES NOT update component state

nodux.setItem('user', { name: 'guyDude' }); // => updates component state

nodux.setItem('user.pet', { name: 'Bibo the best cat ever' }); // => updates component state
```
Okay, this is better. Now the store only updates when changes are made to the `user` property of our store. Let's take it one step further see just how specific we can get!

```js
// component updates only when user.pet.type changes

const { type: petType } = useStore('user.pet.type');

nodux.setItem('uiSettings', { darkTheme: false }); // => DOES NOT update component state

nodux.setItem('user', { name: 'guyDude' }); // => DOES NOT update component state

nodux.setItem('user.pet', { name: 'Bibo the best cat ever' }); // => DOES NOT update component state

nodux.setItem('user.pet', { type: 'alligator' }); // => only this updates component state
```
Great! Now we have a super specific state update that targets a leaf-node of our data-tree. You can see that I am aliasing `type` as `petType`, in case I want to be more descriptive with my naming.

In this example, if the `user` property is updated, our component won't rerender because we are targeting more specific property. Even if the `user.pet.name` property is updated, we *still* expect that our component's state will not be updated. Now that's what I call controlling your rerender!

<br />

## Listening for multiple updates
You may be wondering, "what if I want to listen for multiple updates, but maintain my rerender specificity?" This solution is resolved by providing an array of paths instead of a single path. That looks like this:
```js
const { name: userName, darkTheme } = useStore(['user.name', 'uiSettings.darkTheme']);
```
In this example, component state only updates when the `user.name` property or the `uiSettings.darkTheme` property changes. As you may have noticed, the returned properties are named using the _**terminal node**_ of the provided path.

<br />

## Common Gotchas:
- As with all objects, key names must be unique. Therefore, when providing multiple paths, always ensure that there are no collisions between their _**terminal nodes**_.
- When collisions occur it is recommended to simply listen for updates to a different layer of your data-tree

<br />

[back to top](#no-dux)

<br />


## useAutosave
### `useAutosave(path: string | string[], whitelist: object, blacklist?: string | string[])`
<br />

This is a convenience hook provided to make background updates without manually calling `setItem` every time. This is especially useful when you remember an array of user preferences that may change regularly with user interactions. Let's look at an example:

<br />

Suppose our application has a data-table that enables sorting and pagination, and as a convenience we'd like to remember our user's most recent interaction with the table so that it looks the same every time they return to the page.

We'll start by adding a new `tableSettings` object to our `user` property:
```js
// store

demoApp: {

  auth: {
    sessionToken: '...',
    refreshToken: '...',
    ...
  },

  user: {
    name: 'dudeGuy',
    email: 'dude@guy.com',
    id: 'un1qu3$tr1ng',
    randomThing: 'moreStuff',
    pet: {
      name: 'Bibo the cat',
      type: 'cat',
    },

    // tableSettings added here
    tableSettings: {
      sortColumn: 'name',
      sortDirection: 'desc',
      page: 0,
    },
    ...
  },

  uiSettings: {
    darkTheme: true,
    ...
  },

};
```

Suppose we have a knowledge of the `sortOrder`, `sortDirection`, and `page` values somewhere else in our module, probably stored in a bit of state. Here's how we'll set up `useAutosave` to make background updates to our `tableSettings`:
```js
useAutosave('user.tableSettings', { sortOrder, sortDirection, page });
```
And we're done! `useAutosave` will listen for changes to the three specified values, and make background updates to the `user.tableSettings` slice of state any time these values change.
- Just like with our other methods, the `path` argument can be specified using a string or an array of strings.
- `whitelist` must be specified using an object because we need to know both the value of the variable and the key to assign it to

**IMPORTANT:** The names of the keys in your whitelist *must* correspond to the store items you want to write them to. If the naming conventions in your component's local state do not correspond to the target names in your store, you'll likely want to do something like this:
```js
const localSortState = // => locally defined state variable

useAutosave('user.tableSettings', { sortOrder: localSortState, sortDirection, page });
```

<br />

## Using the `blacklist`
The `blacklist` argument is a simple convenience designed to help clean up your code. It can be a string or an array of strings, and it specifies object properties that you would like to omit from the whitelist.

Suppose you have a rather complex object that you would like to track in your store. But you have a problem, there are two pieces of sensitive information inside your complex object that you don't want to track. Without the blacklist, that might look like this:
```js
const { sensitiveThing1, sensitiveThing2, ...rest } = complexObject;
useAutosave('blacklistExample', rest);
```
Okay this isn't terrible, but supposing you have a scenario need to use multiple object destructuring statements, you can see how the pattern clutters your code as it scales. Here's what it looks like using blacklist:
```js
useAutosave('blacklistExample', {...complexObject1, ...complexObject2 }, ['sensitiveThing1', 'sensitiveThing2', 'sensitiveThing3'])
```

[back to top](#no-dux)



<!--

To Do List:
- sandbox
- add `usage` and `args` sections to api docs
- intermediate cases
  - avoiding data-loss
  - Variable interpolation into a path

-->
