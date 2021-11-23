# `no-dux`
A ridiculously lightweight and easy-to-use state management alternative to Redux

- <a name='Why no-dux'>[Why no-dux](#why-no-dux)</a>
- <a name='getting-started'>[Getting Started](#getting-started)</a>
- <a name='api-documentation'>[API Documentation](#api-documentation)</a>
- <a name='react-hooks-api'>[React Hooks API](#react-hooks-api)</a>

# Why `no-dux`?
Many of you have probably used Redux in the past, and if you're like me your overall reaction was probably mostly positive. What a great tool, you thought, but why does it have so much boilerplate? And why does my data disappear on a page reload? Sure I can chuck it in localStorage but then I have my data duplicated, taking up twice as much memory for no reason. And how many of us have run into performance issues when using Redux of React Context API because unforeseen layers of component rerenders?

## Enter `no-dux`
no-dux is a stateless

## What are some benefits of using `no-dux`?
- It is aggressively easy to set up, learn, and use
- It reduces your application's boilerplate
- It handles data persistence over page reload (and over user sessions) without additional configuration or libraries
- Stateful rerender is 100% opt-in, giving you back control of your application's performance
- The core library is 100% framework agnostic, and its unpacked bundle size is only _**14kb**_ with _**zero dependencies**_!!

## Why is it different?


# Getting Started

If you're working on a React application, you'll likely want to download the extension that comes with additional state-management hooks.

# API Documentation
## Core API
### `nodux.createStore`
### `nodux.setItem`
### `nodux.removeItem`
### `nodux.clear`
### `nodux.getSize`

## Nodux Actions
### `nodux.registerActions`

# React Hooks API
### `useStore`
### `useAutosave`