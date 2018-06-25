const fs = require('fs')
const path = require('path')
const babylon = require('babylon')
const traverse = require('babel-traverse').default
const { transformFromAst } = require('babel-core')

let uid = 0
// 解决循环依赖
let loadedModule = {}

function createAsset(filePath) {
  // 如果这个模块已经被加载过，只返回id
  if (loadedModule[filePath]) {
    return {
      id: loadedModule[filePath]
    }
  }

  const content = fs.readFileSync(filePath, 'utf-8')

  const ast = babylon.parse(content, {
    sourceType: 'module'
  })

  const dependencies = []

  // 添加依赖
  traverse(ast, {
    ImportDeclaration: ({ node }) => {
      dependencies.push(node.source.value)
    },
  })

  const id = uid++
  loadedModule[filePath] = id

  // 将ast转成兼容浏览器的代码
  const { code } = transformFromAst(ast, null, {
    presets: ['env']
  })

  return {
    id,
    filePath,
    dependencies,
    code
  }
}

function createGraph(entry) {
  const mainAsset = createAsset(entry)

  const queue = [mainAsset]

  for (const asset of queue) {
    asset.mapping = {}

    const dirname = path.dirname(asset.filePath)

    asset.dependencies.forEach((relativePath) => {
      // 依赖的绝对路径
      const absPath = path.join(dirname, relativePath)
      // 找这个依赖里的依赖
      const child = createAsset(absPath)
      asset.mapping[relativePath] = child.id
      // 如果有依赖才添加，否则无依赖或者依赖已经加载过
      if (child.code) {
        // 把依赖里的依赖推入数组，供继续循环查找
        queue.push(child)
      }
    })
  }

  return queue
}

function bundle(graph) {
  let modules = ''

  graph.forEach(mod => {
    modules += `${mod.id}: [
      function (require, module, exports) { ${mod.code} },
      ${JSON.stringify(mod.mapping)},
    ],`
  })

  const result = `
    (function (modules) {
      function require(id) {
        const [fn, mapping] = modules[id]

        function localRequire(name) {
          return require(mapping[name])
        }

        const module = { exports: {} }

        fn(localRequire, module, module.exports)

        return module.exports
      }

      require(0)
    })({${modules}})
  `

  return result
}

const graph = createGraph('../example/entry.js')
const result = bundle(graph)

fs.statSync('../dist') ? void 0 : fs.mkdirSync('../dist')
fs.writeFileSync('../dist/dist.js', result)