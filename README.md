
# Overview
Library modules for nodejs that bundled general-purpose implementations.  
For example, this includes following currently.
 - Enhanced http client for scraping.
 - Simple transaction decorator. 
 - Utility for array manipulation.
 - etc...

## Error definition
XJS throws error with `code` property which has one of the following numbers.
|code|thrown by|
|:---|:---|
|100|`func/decorator/transaction`|
|200|`prcs/http-resolver`|
