// Run with NODE_PATH pointing to a Playwright installation.
const { _electron: electron }=require('playwright');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const os=require('node:os');
(async()=>{const userData=fs.mkdtempSync(path.join(os.tmpdir(),'qingyu-test-'));const app=await electron.launch({executablePath:process.env.QINGYU_TEST_EXECUTABLE||require('electron'),args:[path.join(__dirname,'..')],env:{...process.env,QINGYU_TEST_DATA:userData}});try{
 const page=await app.firstWindow();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.locator('#site-grid .site-card').first().waitFor();await page.screenshot({path:'artifacts/home.png'});
 await page.locator('#try-reading').click();await page.locator('#chapter-text').waitFor();assert.match(await page.locator('#chapter-title').textContent(),/第一章/);
 await page.locator('#toc-toggle').click();await page.locator('#toc button').nth(1).click();assert.match(await page.locator('#chapter-title').textContent(),/第二章/);
 await page.locator('#settings-button').click();await page.locator('#fontSize').fill('24');await page.locator('#fontSize').dispatchEvent('input');await page.waitForFunction(()=>getComputedStyle(document.querySelector('#chapter-text')).fontSize==='24px');
 await page.locator('#top').check();assert.equal(await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].isAlwaysOnTop()),true);
 await page.screenshot({path:'artifacts/reader.png'});
 await page.locator('#transparent').check();await page.waitForFunction(()=>document.body.classList.contains('transparent'));
 await page.locator('#reset-settings').click();await page.waitForFunction(()=>!document.body.classList.contains('transparent'));
 await page.locator('#return-home').click();await page.locator('#close-settings').click();
 const txt=path.join(userData,'测试小说.txt');fs.writeFileSync(txt,'第一章 开始\n'+('测试正文。\n'.repeat(150))+'第二章 后来\n结束');
 await app.evaluate(({dialog},txt)=>{dialog.showOpenDialog=async()=>({canceled:false,filePaths:[txt]});},txt);
 await page.locator('#import-book').click();await page.waitForFunction(()=>document.querySelector('#book-count').textContent==='1');await page.getByRole('button',{name:'阅读 测试小说',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#chapter-title').textContent==='第一章 开始');
 await page.waitForTimeout(150);await page.locator('#reading-scroll').evaluate(n=>n.scrollTop=600);await page.waitForTimeout(500);await page.locator('#return-home').click();await page.getByRole('button',{name:'阅读 测试小说',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#reading-scroll').scrollTop>500);
 await page.locator('#return-home').click();await page.locator('#add-site').click();await page.locator('#site-name').fill('测试收藏');await page.locator('#site-url').fill('https://example.com');await page.locator('#site-form button[type=submit]').click();await page.getByRole('button',{name:/测试收藏/}).waitFor();
 const bad=await page.evaluate(async()=>{try{await window.qingyu.call('web','file:///etc/passwd');return false;}catch{return true;}});assert.equal(bad,true);
 // Use a local HTTP fixture so network access cannot make the desktop test flaky.
 const server=require('node:http').createServer((_req,res)=>res.end('<html><head><title>Web fixture</title></head><body style="height:4000px"><h1>Browser isolation check</h1><a href="/next">Next</a></body></html>')).listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const url='http://127.0.0.1:'+server.address().port;
 await page.locator('#address').fill(url);await page.locator('#address-form button').click();await page.waitForFunction(()=>document.querySelector('#reload').textContent==='↻');
 const guestInfo=await app.evaluate(async({webContents})=>{for(let i=0;i<100;i++){const wc=webContents.getAllWebContents().find(x=>x.getURL().startsWith('http://127.0.0.1'));if(wc&&!wc.isLoading()&&wc.getTitle()==='Web fixture')return wc.executeJavaScript('({title:document.title,node:typeof require,bridge:typeof window.qingyu})');await new Promise(r=>setTimeout(r,50));}throw new Error('Web fixture did not finish loading');});assert.deepEqual(guestInfo,{title:'Web fixture',node:'undefined',bridge:'undefined'});
 await page.locator('#settings-button').click();await page.locator('#transparent').check();await page.waitForTimeout(200);
 const background=await app.evaluate(async({webContents})=>webContents.getAllWebContents().find(x=>x.getURL().startsWith('http://127.0.0.1')).executeJavaScript('getComputedStyle(document.body).backgroundColor'));assert.equal(background,'rgba(0, 0, 0, 0)');
 await page.locator('#close-settings').click();await page.mouse.move(100,15);await page.locator('#mouse-settings').waitFor({state:'visible'});await page.locator('#mouse-settings').click();await page.locator('#reset-settings').waitFor({state:'visible'});

 await page.locator('#reset-settings').click();await page.locator('#return-home').click();server.close();
 await page.locator('#boss').click();assert.equal(await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].isVisible()),false);
 await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].show());assert.equal(await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].isVisible()),true);
 await page.locator('#compact').click();await page.waitForFunction(()=>document.body.classList.contains('compact'));assert.equal(await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].getSize()[0]),460);await page.screenshot({path:'artifacts/compact.png'});await page.locator('#compact').click();
 const registered=await app.evaluate(({globalShortcut})=>globalShortcut.isRegistered('Alt+Z')&&globalShortcut.isRegistered('Alt+X'));assert.equal(registered,true);
 await page.evaluate(()=>window.qingyu.call('settings',{hideOnLeave:true}));await app.evaluate(({screen})=>{global.qyCursor=screen.getCursorScreenPoint;screen.getCursorScreenPoint=()=>({x:-10000,y:-10000});});await page.waitForTimeout(250);assert.equal(await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].isVisible()),false);
 await app.evaluate(({screen,BrowserWindow})=>{const b=BrowserWindow.getAllWindows()[0].getBounds();screen.getCursorScreenPoint=()=>({x:b.x+50,y:b.y+50});});await page.waitForTimeout(250);assert.equal(await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].getOpacity()),1);await page.evaluate(()=>window.qingyu.call('settings',{hideOnLeave:false}));await app.evaluate(({screen})=>{screen.getCursorScreenPoint=global.qyCursor;});
 assert.deepEqual(errors,[]);console.log('PASS: home, chapters, typography, always-on-top, transparency, TXT import, progress restore, bookmarks, URL restrictions, isolated browser, page CSS, hide/restore.');
}finally{await app.close();fs.rmSync(userData,{recursive:true,force:true});}})().catch(e=>{console.error(e);process.exit(1)});
