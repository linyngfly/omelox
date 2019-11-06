omelox-cli
========

omelox-cli is a command-line tool for [omelox](https://github.com/NetEase/omelox).  
you can use omelox-cli to connect to omelox master and do lots of things.

##Installation
```
npm install -g omelox-cli
```
##Usage
Use omelox-cli to connect to omelox master  

```
omelox-cli -h host -P port -u username -p password  
```  

The default parameter of omelox-cli is as follows:

```  
omelox-cli -h 127.0.0.1 -P 3005 -u monitor -p monitor 
```  

After that, omelox-cli will enter repl mode. You can type 'help' for more information. 
Enjoy it:
![omelox-cli help](http://ww1.sinaimg.cn/mw690/b7bc844fgw1eaa5s16o2uj20hv0k4whw.jpg)

## Links
[user level control](https://github.com/NetEase/omelox-admin#user-level-control)  
[commands wiki](https://github.com/NetEase/omelox-cli/wiki/omelox-cli-man-page)

## License

(The MIT License)

Copyright (c) 2012-2013 NetEase, Inc. and other contributors

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
