const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const fs = require('fs');

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] 
});

const activeCodes = new Map();

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // --- LỆNH TẠO WEB ---
    if (message.content === '!create') {
        if (!activeCodes.has(message.author.id)) {
            activeCodes.set(message.author.id, Math.random().toString(36).substring(2, 8).toUpperCase());
        }
        
        const currentCode = activeCodes.get(message.author.id);
        const hexCode = Buffer.from(currentCode).toString('hex');

        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Security Terminal</title>
            <style>
                :root { --primary: #00f2ff; --bg: #050505; --warn: #ff0055; }
                body { background: var(--bg); color: white; font-family: 'Segoe UI', sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; overflow: hidden; }
                
                /* Viền ngoài cùng của bảng điều khiển */
                .panel { 
                    border: 2px solid var(--primary); 
                    padding: 40px; 
                    text-align: center; 
                    background: rgba(0, 242, 255, 0.05);
                    box-shadow: 0 0 20px rgba(0, 242, 255, 0.2), inset 0 0 10px rgba(0, 242, 255, 0.1);
                    border-radius: 20px;
                    position: relative;
                    backdrop-filter: blur(10px);
                }

                /* Viền hộp chứa mã */
                .code-box {
                    border: 1px dashed var(--primary);
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 10px;
                    background: rgba(0,0,0,0.5);
                }

                h1 { font-size: 3rem; margin: 0; letter-spacing: 8px; color: var(--primary); text-shadow: 0 0 10px var(--primary); filter: blur(8px); transition: 0.3s; }
                
                button { 
                    background: transparent; 
                    color: var(--primary); 
                    border: 1px solid var(--primary); 
                    padding: 12px 30px; 
                    border-radius: 50px;
                    cursor: pointer; 
                    font-weight: bold; 
                    text-transform: uppercase;
                    transition: all 0.3s;
                    box-shadow: 0 0 10px rgba(0, 242, 255, 0.2);
                }

                button:hover { background: var(--primary); color: var(--bg); box-shadow: 0 0 30px var(--primary); }

                .timer-ring {
                    margin-top: 20px;
                    font-weight: bold;
                    color: var(--warn);
                    border-top: 1px solid #333;
                    padding-top: 15px;
                }
                #tm { font-size: 1.5rem; text-shadow: 0 0 5px var(--warn); }
            </style>
        </head>
        <body oncontextmenu="return false">
            <div class="panel">
                <div style="text-transform: uppercase; opacity: 0.7; font-size: 0.8rem;">Secure Data Access</div>
                <div class="code-box">
                    <h1 id="disp">******</h1>
                </div>
                <button onclick="take()">Nhận mã & Copy</button>
                <div class="timer-ring">TỰ HỦY TRONG: <span id="tm">10</span>S</div>
            </div>

            <script>
                const h = "${hexCode}";
                const c = h.match(/.{1,2}/g).map(byte => String.fromCharCode(parseInt(byte, 16))).join('');
                let t = 10;

                function take() {
                    const d = document.getElementById('disp');
                    d.innerText = c;
                    d.style.filter = "none";
                    navigator.clipboard.writeText(c);
                    document.querySelector('button').innerText = "ĐÃ COPY!";
                }

                const timer = setInterval(() => {
                    t--;
                    document.getElementById('tm').innerText = t;
                    if(t <= 0) {
                        clearInterval(timer);
                        document.body.innerHTML = "<h1 style='color:var(--warn); filter:none;'>ACCESS DENIED - DATA DELETED</h1>";
                        setTimeout(() => { window.location.href = 'about:blank'; }, 800);
                    }
                }, 1000);

                setInterval(() => {
                    if (window.outerHeight - window.innerHeight > 160 || window.outerWidth - window.innerWidth > 160) {
                        window.location.href = 'about:blank';
                    }
                }, 500);
            </script>
        </body>
        </html>`;

        const fileName = `ui_secure_${message.author.id}.html`;
        fs.writeFileSync(fileName, htmlContent);
        const attachment = new AttachmentBuilder(fileName);

        await message.reply({ content: "💎 **Giao diện UI cao cấp đã sẵn sàng!**", files: [attachment] });
        fs.unlinkSync(fileName);
    }

    // --- CÁC LỆNH KHÁC ---
    if (message.content.startsWith('!doima')) {
        const newCode = message.content.split(' ')[1];
        if (!newCode) return message.reply("⚠️ Nhập mã mới: `!doima [code]`");
        activeCodes.set(message.author.id, newCode);
        message.reply(`✅ Đã đổi mã sang: **${newCode}**`);
    }

    if (message.content.startsWith('!submit')) {
        const input = message.content.split(' ')[1];
        if (input === activeCodes.get(message.author.id)) {
            message.reply("🌟 **Xác nhận thành công!** Quyền truy cập được chấp nhận.");
            activeCodes.delete(message.author.id);
        } else {
            message.reply("❌ **Mã không chính xác hoặc đã hết hạn.**");
        }
    }

    if (message.content === '!menu') {
        const code = activeCodes.get(message.author.id) || "Trống";
        message.reply(`**[ COMMAND MENU ]**\n\`!create\` - Tạo Web UI\n\`!doima\` - Đổi mã (Đang là: ${code})\n\`!submit\` - Duyệt mã`);
    }
});

client.login('TOKEN_CỦA_BẠN');
const http = require('http');
http.createServer((req, res) => {
  res.write("Bot is running!");
  res.end();
}).listen(process.env.PORT || 8080);
