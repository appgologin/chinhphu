const MeshCentral = require('meshcentral-node');
const fs = require('fs');
const path = require('path');
const express = require('express');

// Sử dụng biến môi trường cho thông tin nhạy cảm
const mesh = new MeshCentral({
    serverUrl: process.env.MESH_SERVER_URL || 'wss://thanghuynh99.life:443',
    username: process.env.MESH_USERNAME || 'trangtung95hp@gmail.com',
    password: process.env.MESH_PASSWORD || 'trangtung95hp'
});

mesh.on('connected', async() => {
    console.log('Connected to MeshCentral server');

    try {
        // Tạo agent exe
        const agentInfo = await createAgentExe();
        console.log('Agent exe created:', agentInfo);

        // Lấy danh sách thiết bị
        const devices = await getDevices();
        console.log('Devices:', devices);

        // Nếu có thiết bị, thực hiện các tác vụ PowerShell và quản lý file
        if (devices.length > 0) {
            const deviceId = devices[0]._id; // Sử dụng thiết bị đầu tiên làm ví dụ

            // Chạy PowerShell command
            const psResult = await runPowerShell(deviceId, 'Get-Process');
            console.log('PowerShell result:', psResult);

            // Lấy danh sách file
            const files = await getFileList(deviceId, 'C:\\');
            console.log('Files:', files);
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

mesh.on('error', (err) => {
    console.error('MeshCentral error:', err);
});

// Hàm tạo agent exe
function createAgentExe() {
    return new Promise((resolve, reject) => {
        mesh.createAgentInstallerEx({}, (err, agentInfo) => {
            if (err) {
                reject(err);
            } else {
                // Lưu file exe
                const filePath = path.join(__dirname, 'meshagent.exe');
                fs.writeFileSync(filePath, agentInfo.binary);
                resolve({
                    filePath: filePath,
                    hash: agentInfo.hash
                });
            }
        });
    });
}

// Hàm lấy danh sách thiết bị
function getDevices() {
    return new Promise((resolve, reject) => {
        mesh.getDevices((err, devices) => {
            if (err) {
                reject(err);
            } else {
                resolve(devices);
            }
        });
    });
}

// Hàm chạy PowerShell command
function runPowerShell(deviceId, command) {
    return new Promise((resolve, reject) => {
        mesh.runPowerShell(deviceId, command, (result) => {
            resolve(result);
        });
    });
}

// Hàm lấy danh sách file
function getFileList(deviceId, path) {
    return new Promise((resolve, reject) => {
        mesh.getFileList(deviceId, path, (err, files) => {
            if (err) {
                reject(err);
            } else {
                resolve(files);
            }
        });
    });
}

const app = express();

app.get('/ping', (req, res) => {
    res.send('pong');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});