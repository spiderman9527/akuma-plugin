// img_lst, 图片地址后缀列表
// img_prt, 图片地址前缀

const baseUrl = 'http://127.0.0.1:3000' // 服务器地址
const downloadDomain = 'https://s1.akuma.moe'

// ================== 下载页面 https://s1.akuma.moe/ =====================
//触发下载
function download(img_lst, img_prt) {
  const ext = img_lst[0].split('.')[0]
  let group = img_prt.split('/').at(-1)

  if (!group) {
    const tempUrl = URL.createObjectURL(new Blob())
    group = tempUrl.toString()
    URL.revokeObjectURL(tempUrl)
  }

  img_lst.forEach((src) => {
    const link = document.createElement("a")
    link.href = `${img_prt}/${src}`
    link.download = `${src.split('-')[0]}-${group}.${ext}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  })
}

async function getInfo() {
  const response = await fetch(`${baseUrl}/info`)

  return data = response.json()
}

//  从服务器获取的信息下载
async function downloadByServer() {
  const info = await getInfo()

  if (!info) {
    alert('数据异常！')
    return
  }

  Object.keys(info).forEach(group => {
    const { img_lst, img_prt } = info[group] ?? {}

    download(img_lst, img_prt)
  })

  deleteInfo()
}

// 从本地输入的信息下载，一般用于失败重下
function downloadByLocal(img_lst, group) {
  download(img_lst, `${downloadDomain}/${group}`)
}

// 删除服务器上的数据
async function deleteInfo(group) {
  if (group) {
    fetch(`${baseUrl}/delete/${group}`, { method: 'delete' })
  } else {
    fetch(`${baseUrl}/clear`, { method: 'delete' })
  }
}

// =================== 获取页面 https://akuma.moe ========================
//保存信息至服务器
async function saveInfo() {
  const group = img_prt.split('/').at(-1)

  const response = await fetch(`${baseUrl}/add`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ img_lst, img_prt, group })
  })
  const res = await response.json()
  console.log(res)
  if (res) {
    alert('保存成功！')
  } else {
    alert('已存在，请勿重新添加！')
  }
}

;(function() {
   window.baseUrl = 'http://127.0.0.1:3000' // 服务器地址

  saveInfo()
})()

//======================= 失败重下 ===========================
// 查找下载失败的项, 需要再对应的能获取到img_lst的页面中执行
function checkFailureItem(failures) {
  return img_lst.filter((src) => {
    let flag = false

    for (let i = 0; i < failures.length; i++) {
      if (src.includes(failures[i])) {
        flag = true
        break
      }
    }
    return flag
  })
}