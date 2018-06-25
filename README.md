# mpack

> 一个模块打包器学习项目

## Introduction

代码来自parcel核心开发者@ronami的开源项目minipack，minipack是一个最简单的模块系统示例，仅查找了一层的依赖，没有递归查找，不支持循环依赖

本项目抄自minipack，修改支持了循环依赖，思路就是每个模块有个专有id，看id是否重复，如果重复就不加载模块

以前对webpack原理稍微有些基本理解，可是放到代码层面实现的时候就懵逼了，看到这个项目就边抄边学了一下，不得不感叹模块系统的构建思路真是巧妙，虽然没多少代码。在此总结一下

## summary

基本流程：

1. 从入口分析依赖
2. 根据依赖递归构建依赖图，在本项目中就是一个数组
3. 根据依赖图构建模块系统生成可由浏览器直接运行的文件

有这么几个问题，依赖图是什么？在浏览器可运行的模块系统是怎么构建的？

1. 依赖图是什么

依赖图我理解就是包括了所有“依赖”的集合，这个“依赖”并不是简单一个文件名，它可能需要包括`依赖的代码`,`依赖的路径`,`依赖的id`,`依赖自身的依赖的相对路径`等等

为什么需要这些东西？因为依赖图的目的是帮助我们构建出能在浏览器直接运行的模块应用，如果觉得多了或少了，可以修改，并没有强制规定，只要最后能方便构建出来即可

2. 模块系统是怎么构建的

如果要构建一个可在浏览器运行commonjs的模块系统，简单来说，就是构建一个IIFE，手动定义`module`, `exports`，和`require`变量，具体代码如下，说不太清楚，反正很巧妙

```
(function(modules) {
  function require(id) {
    // modules就是下面传的那个对象
    const [fn, mapping] = modules[id]

    // 所谓的require，就是从整个modules里找到对应id的函数
    function localRequire(name) {
      return require(mapping[name])
    }

    let module = {
      exports: {}
    }

    fn(localRequire, module, module.exports)

    return module.exports
  }

  require(0)
})({
  0: [
    // 模块函数，即fn
    function(require, module, exports) {
      var name = require('./utils.js')
      var age = 10

      exports.age = age
    },
    // 这个表示当前模块依赖和其id，即mapping
    { './utils.js', 1 }
  ],
  1: [
    function(require, module, exports) {
      console.log('utils')
    },
    {}
  ]
})
```

可以看到, mapping和fn都需要依赖图来提供，这也是为什么它要包含这些东西

同时这段代码也可以很清晰的解释module.exports和exports的区别