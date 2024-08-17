import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import NodeCache from 'node-cache'
import fs from 'fs'
import path from 'path'

interface Store {
  img_lst: string[],
  img_prt: string
}

type StoreQuery = Store & { group: string } & Record<string, any>

// 创建 Express 应用程序
const app = express()
const cache = new NodeCache()
const port = 3000

app.use(cors()).use(bodyParser.json())

app.get('/info', (_, res) => {
  const keys = cache.keys()
  const data = {} as Record<string, any>

  keys.forEach(key => {
    const value = cache.get(key)
    data[key] = value
  })

  res.status(200).send(data)
})

/**
 * 添加信息
 */
app.post('/add', (req, res) => {
  const { img_lst, img_prt, group } = req.body as StoreQuery

  if (img_lst && img_prt && group) {
    if (!cache.has(group)) {
      cache.set(group, { img_lst, img_prt })
    }

    console.log('get:/add --->', cache.keys())

    res.status(200).send(true)
  } else {
    res.status(200).send(false)
  }
})


/**
 * 移动文件
 */
app.get('/move', (req, res) => {
  const rootPath = <string>req.query?.rootPath ?? 'F:\\Games\\comic'
  const files = fs.readdirSync(rootPath)
  const folderSet = new Set()

  files.forEach(file => {
    const folder = file.split('.')[0].split('-').at(-1)

    if (!folder) return

    const folderPath = path.join(rootPath, folder)
    const sourcePath = path.join(rootPath, file)

    if (fs.statSync(sourcePath).isFile()) {
      // 创建文件夹
      if (folder && !folderSet.has(folder) && !fs.existsSync(folderPath)) {
        try {
          fs.mkdirSync(folderPath, { recursive: true })
        } catch (err) {
          console.error(`Failed to create ${folder} folder. --->`, err);
        }
      }

      // 移动文件
      try {
        const originFilePath = `${rootPath}\\${file}`

        if (fs.existsSync(folderPath)) {
          fs.renameSync(originFilePath, path.join(folderPath, file))
        }
      } catch (err) {
        console.error('Failed to move.--->', err)
      }
    }
  })

  res.status(200).send(true)
})

/**
 * 删除信息
 */
app.delete('/delete/:group', (req, res) => {
  const group = req.params.group

  if (cache.has(group)) {
    cache.del(group)
  }

  console.log('delete:/delete --->', cache.keys())

  res.status(200).send(true)
})

/**
 * 清空map
 */
app.delete('/clear', (_, res) => {
  cache.flushAll()
  console.log('delete:/clear --->', cache.keys())
  res.status(200).send(true)
})

// 启动服务器，监听指定端口
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})