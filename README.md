# angular-sails-model [![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

Sails model binder for AngularJS (based on the idea of angular-sails-bind by Diego Pamio - https://github.com/diegopamio)

## Features
- One line binding
- Configurable binding
- Extendable model "class"

## Install
Not yet

## Usage
```js
anSailsModel.bind(<model name>, <scope>, <filter>, <options>);
```

## Model name
- Type: string or array
- Optional: no

If model name is a string, then anSailsModel will bind model data to a scope variable with the same name.
If model name is an array, the first element is the model you wish to bind, and the second element is the scope
variable name you wish to bind to.

For example:
```js
anSailsModel.bind('user', $scope); // Binding user model to $scope.user
anSailsModel.bind(['user', 'users'], $scope); // Binding user model to $scope.users
```

## Scope
- Type: object
- Optional: No

The scope to bind models to.

## Filter
- Type: object
- Default: {}
- Optional: yes

Model query filters. Syntax is the same with the backend syntax.

## Options
- Type: object
- Default: {}
- Optional: yes

Binding config options.

### model
- Type: function
- Default: an.angular.sails.Model
- Optional: yes

Constructor of the model "class" you'd like to use at binding. Useful if you extend the base "class".

### eventModel
- Type: string
- Default: perModel
- Optional: yes

Valid values are: global, perModel

Determines if the anSailsModel events should be global or per model based.

### autoPersist
- Type: boolean
- Default: false
- Optional: yes

Determines if the model(s) should or shouldn't automatically persist their value(s) on change.

### autoListen
- Type: boolean
- Default: false
- Optional: yes

Determines if the model(s) should or shouldn't listen to the backend for any changes.

### transport
- Type: function
- Default: an.sails.model.Restful
- Optional: yes

Valid values are: an.sails.model.Restful, an.sails.model.Shortcut

Determines the transport method used by the model(s). This is a global option for all binds!

## Events emitted by models
- sailsModelSaveSucceed
- sailsModelSaveFailed
- sailsModelDeleteSucceed
- sailsModelDeleteFailed

## Building angular-sails-model
$ node grunt

## TODO
- Unit tests
- Profiling/optimizations
- Bower package

## License
The MIT License (MIT)

Copyright &copy; 2013 [Agoston Nagy](https://github.com/agostone)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
