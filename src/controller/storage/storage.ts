import { invoke } from "@tauri-apps/api"
import { hooks } from "../../services/hook"
import { rcloneInfo } from "../../services/rclone"
import { FileInfo } from "../../type/rclone/rcloneInfo"
import { ParametersType } from "../../type/rclone/storage/defaults"
import { rclone_api_post } from "../../utils/rclone/request"

//列举存储
async function reupStorage() {
    const dump = await rclone_api_post(
        '/config/dump',
    )
    rcloneInfo.storageList = []
    for (const storageName in dump) {
        rcloneInfo.storageList.push({
            name: storageName,
            type: dump[storageName].type,
        })
    }
    hooks.upStorage()
}


//删除存储
async function delStorage(name: string) {
    const del = await rclone_api_post(
        '/config/delete', {
        name: name
    })
    console.log(del);
    reupStorage()
}

//获取存储
async function getStorageParams(name: string): Promise<ParametersType> {
    const get = await rclone_api_post(
        '/config/get', {
        name: name
    })
    return get
}

//挂载存储<dev>
async function mountStorage(name: string) {
    const get = await rclone_api_post(
        '/mount/mount', {
        remotePath: name,
    })
    console.log(get);
}


//获取文件列表
async function getFileList(storageName: string, path: string): Promise<FileInfo[]> {

    const fileList = await rclone_api_post(
        '/operations/list', {
        fs: storageName + ':',
        remote: formatPathRclone(path, false)
    })
    return fileList.list
}

//删除存储
async function delFile(storageName: string, path: string, refreshCallback?: Function) {
    if (path.substring(0, 1) == '/') {
        path = path.substring(1, path.length)
    }
    const backData = await rclone_api_post(
        '/operations/deletefile', {
        fs: storageName + ':',
        remote: formatPathRclone(path, false)
    })
    if (refreshCallback) {
        refreshCallback()
    }
}

async function delDir(storageName: string, path: string, refreshCallback?: Function) {

    const backData = await rclone_api_post(
        '/operations/purge', {
        fs: storageName + ':',
        remote: formatPathRclone(path, true)
    })
    if (refreshCallback) {
        refreshCallback()
    }
}

//创建目录
async function mkDir(storageName: string, path: string, refreshCallback?: Function) {


    const backData = await rclone_api_post(
        '/operations/mkdir', {
        fs: storageName + ':',
        remote: formatPathRclone(path, true)
    })
    if (refreshCallback) {
        refreshCallback()
    }
}

function formatPathRclone(path: string, isDir?: boolean): string {
    if (path.substring(0, 1) == '/') {
        path = path.substring(1, path.length)
    }
    if (isDir) {
        if (path.substring(path.length - 1, path.length) == '/') {
            path = path.substring(0, path.length - 1)
        } else {
            path = path + '/'
        }
    }

    path = path.replace(/\/+/g, '/');
    return path;
}

//copyFile
async function copyFile(storageName: string, path: string, destStoragename: string, destPath: string) {
    const backData = await rclone_api_post(
        '/operations/copyfile', {
        srcFs: storageName + ':',
        srcRemote: formatPathRclone(path),
        dstFs: destStoragename + ':',
        dstRemote: formatPathRclone(destPath, true) + getFileName(path)
    }, true)
}

async function moveFile(storageName: string, path: string, destStoragename: string, destPath: string, newNmae?: string) {

    const backData = await rclone_api_post(
        '/operations/movefile', {
        srcFs: storageName + ':',
        srcRemote: formatPathRclone(path),
        dstFs: destStoragename + ':',
        dstRemote: formatPathRclone(destPath, true) + (newNmae ? newNmae : getFileName(path))
    }, true)
}

function getFileName(path: string): string {
    const pathArr = path.split('/')
    return pathArr[pathArr.length - 1]
}

//copyDir
async function copyDir(storageName: string, path: string, destStoragename: string, destPath: string) {
    const backData = await rclone_api_post(
        '/sync/copy', {
        srcFs: storageName + ':' + formatPathRclone(path, true),
        dstFs: destStoragename + ':' + formatPathRclone(destPath, true) + getFileName(path)
    }, true)
}

async function moveDir(storageName: string, path: string, destStoragename: string, destPath: string, newNmae?: string) {
    const backData = await rclone_api_post(
        '/sync/move', {
        srcFs: storageName + ':' + formatPathRclone(path, true),
        dstFs: destStoragename + ':' + formatPathRclone(destPath, true) + (newNmae ? newNmae : getFileName(path))
    }, true)
}

export { reupStorage, delStorage, getStorageParams, getFileList, delFile, delDir, mkDir, formatPathRclone, copyFile, copyDir, moveFile, moveDir }