[![CI](https://github.com/begyyal/xjs_commons/actions/workflows/test.yml/badge.svg)](https://github.com/begyyal/xjs_commons/actions/workflows/test.yml)

Available to `npm i xjs-common`.

# Overview
Library modules for nodejs that bundled general-purpose implementations.  
This module is very simple, therefore it has no dependencies.

## Error definition
XJS throws error with `code` property which has one of the following numbers.
|code|thrown by|
|:---|:---|
|10|`func/u`|
|20|`func/u-string`|
|100|`func/decorator/transaction`|
|200|`prcs/http-resolver`|
