pagerun-jscoverage
=======================

It's a plugin for pagerun, you can use it to get js coverage in webpage.

Config
=======================

Sample code:

    pagerun.setConfig({
        jscoverage: {
            "beautify" : true,
            "include" : ['/test\\.js/i']
        }
    });

1. beautify : beautify the js code
2. include

    If not set the value, this plugin will cover all js code.

    You can use 3 modes.

    a. head match : just match head string

        "include" : ['http://test.com/']
        // match: http://test.com/1.js, http://test.com/2.js, http://test.com/test/3.js

    b. strict match : match all url string

        "include" : ['!http://test.com/test.js']
        // just match: http://test.com/test.js

    c. regex match : macth by regex

        "include" : ['/test\\.(jpg|gif)/i']

License
================

pagerun-jscoverage is released under the MIT license:

> The MIT License
>
> Copyright (c) 2014 Yanis Wang \< yanis.wang@gmail.com \>
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.

Thanks
================

* pageRun: [https://github.com/yaniswang/pageRun/](https://github.com/yaniswang/pageRun/)
* GitHub: [https://github.com/](https://github.com/)