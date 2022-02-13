/*
==========================
        TEST CASES
==========================

createStore()
-------------
- create new store
- Assertions:
    - exists in localStorage
    - has correct name
    - points to an empty object


getStore()
----------
- create demo store and set item using defaults ==> this covers createStore default param
- call getStore and assign it to a variable
- Assertions:
    - the value returned should be deep equal to the demo store object
- Cleanup:
    - call clear() to return store to empty object


clear()
-------
- create store using defaults
- test that store is not an empty object
- call clear
- store should be returned to an empty object


getItem()
---------
- create demo store and set demo item using defaults
- use getItem to extract the value of the several nodes in the demo store
- Assertions:
    - each variable identified by getItem should be equal to its corresponding location in the demo item
- Cleanup:
    - clear


setItem()
---------
- create demo
- Test Cases:
    - write object to object
    - write object to array
    - write object to primitive datatype
    - write array to object
    - write array to array
    - write array to primitive datatype
    - write primitive datatype to any other type
- Assertions:
    - object should merge with object
    - array should merge with array
    - all other cases should result in the initial value being overwritten with the new value


removeItem()
------------
- create demo
- use removeItem to delete several entries from the store
- Assertions:
    - the store should be deep equal to the demo item, minus the removed properties


registerActions()
-----------------
- create an action function and use registerActions to merge it to the nodux action registry
- Assertions:
    - nodux.actions should no longer be an empty object, but should instead contain the registered action functions


registerPartitionedActions()
----------------------------
- create partitionewd actions
- Assertions:
    - the actions registry should now contain a subdomain of actions under the specified string name
    - be sure to include the previously registered actions in the test as there is no way to delete actions in nodux


_parsePath()
- Assertions:
    - can take either a string or array version of the path
    - in either case, it will return an object containing both versions


_getPathString()
- Assertions:
    - should take in a string or array version of the path and return the string version

*/

const assert = require("assert");
