
 Available to `npm i xjs-common`.

# Overview
Library modules for nodejs that bundled general-purpose implementations.  
For example, this includes following currently.
 - Enhanced http client for scraping (`HttpResolver`).
 - Simple transaction decorator (`@transation()`). 
 - Utility for array manipulation (`UArray`).
 - etc...

## Error definition
XJS throws error with `code` property which has one of the following numbers.
|code|thrown by|
|:---|:---|
|10|`func/u`|
|20|`func/u-string`|
|100|`func/decorator/transaction`|
|200|`prcs/http-resolver`|
