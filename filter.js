const fs = require('fs').promises;

async function filterUsers() {
    try {
        console.log('Starting user filtering process...');

        // Đọc nội dung của cả hai tệp
        const user1Content = await fs.readFile('user.txt', 'utf-8');
        const user2Content = await fs.readFile('user2.txt', 'utf-8');

        // Tách thành mảng các dòng và loại bỏ khoảng trắng
        const user1Lines = user1Content.split('\n').map(line => line.trim()).filter(line => line);
        const user2Lines = user2Content.split('\n').map(line => line.trim()).filter(line => line);

        console.log(`Number of users in user.txt: ${user1Lines.length}`);
        console.log(`Number of users in user2.txt: ${user2Lines.length}`);

        // Lọc các dòng từ user2.txt
        const filteredLines = user2Lines.filter(user2Line =>
            user1Lines.some(user1Line => user2Line.includes(user1Line))
        );

        console.log(`Number of filtered users: ${filteredLines.length}`);

        // Ghi kết quả vào tệp mới
        await fs.writeFile('filtered_users.txt', filteredLines.join('\n'));

        console.log('Filtering completed. Results written to filtered_users.txt');
    } catch (error) {
        console.error('Error during file processing:', error);
    }
}

// Chạy hàm filterUsers nếu file này được chạy trực tiếp
if (require.main === module) {
    filterUsers();
}

module.exports = filterUsers;