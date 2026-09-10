const {_electron:electron}=require('playwright');
const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const os=require('node:os');
(async()=>{
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'qingyu-transparent-'));
const app=await electron.launch({executablePath:process.env.QINGYU_TEST_EXECUTABLE||require('electron'),args:[path.join(__dirname,'..')],env:{...process.env,QINGYU_TEST_DATA:dir}});
try{
 const page=await app.firstWindow();await page.locator('#try-reading').click();await page.locator('#settings-button').click();await page.locator('#word-preset').click();await page.waitForFunction(()=>document.body.classList.contains('immersive'));
 assert.equal(await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].hasShadow()),false);
 assert.equal(await app.evaluate(({globalShortcut})=>globalShortcut.isRegistered('Alt+R')),true);
 for(const selector of ['.titlebar','.sidebar','.main-toolbar','.browser-toolbar','.reader-heading','.reading-status','.chapter-nav'])assert.equal(await page.locator(selector).isVisible(),false,selector);
 const paint=()=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 const capture=()=>app.evaluate(async({BrowserWindow})=>{const image=await BrowserWindow.getAllWindows()[0].webContents.capturePage();return {png:image.toPNG().toString('base64'),bitmap:image.toBitmap().toString('base64'),size:image.getSize()};});
 const scroll=async n=>{await page.locator('#reading-scroll').evaluate((el,n)=>el.scrollTop=n,n);await paint();await page.waitForTimeout(100);};
 await scroll(0);const before=await capture();fs.writeFileSync('artifacts/transparent-1.1.0.png',Buffer.from(before.png,'base64'));
 const border=Buffer.from(before.bitmap,'base64'),{width,height}=before.size;let borderPixels=0,visiblePixels=0;
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){const alpha=border[(y*width+x)*4+3];if(alpha)visiblePixels++;if((x<3||x>=width-3||y<3||y>=height-3)&&alpha)borderPixels++;}
 assert.equal(borderPixels,0,'outer edges must be fully alpha-zero');assert.ok(visiblePixels>100,'reading text must remain visible');
 for(const n of [180,420,750,210,900,50,500,0])await scroll(n);
 const after=await capture();assert.equal(after.bitmap,before.bitmap,'scroll round trip must not retain old glyphs');
 const text=await page.locator('#chapter-text').textContent();await page.locator('#chapter-text').evaluate(n=>n.textContent='');await paint();await page.waitForTimeout(100);const cleared=Buffer.from((await capture()).bitmap,'base64');assert.equal(cleared.some((v,i)=>i%4===3&&v>0),false,'clearing text must leave no pixels');await page.locator('#chapter-text').evaluate((n,t)=>n.textContent=t,text);
 await page.keyboard.press('Escape');assert.equal(await page.locator('.main-toolbar').isVisible(),true);await page.keyboard.press('Escape');assert.equal(await page.locator('.main-toolbar').isVisible(),false);
 await app.evaluate(({screen})=>{global.originalCursor=screen.getCursorScreenPoint;screen.getCursorScreenPoint=()=>({x:-9999,y:-9999});});await page.evaluate(()=>window.qingyu.call('settings',{hideOnLeave:true}));await page.waitForTimeout(1500);
 assert.equal(await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].isVisible()),false,'native window must hide');
 await app.evaluate(({screen,BrowserWindow})=>{const b=BrowserWindow.getAllWindows()[0].getBounds();screen.getCursorScreenPoint=()=>({x:b.x+20,y:b.y+20});});await page.waitForTimeout(300);
 assert.equal(await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].isVisible()),true,'re-entry must show window');assert.equal(await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].hasShadow()),false);
 await page.evaluate(()=>window.qingyu.call('settings',{hideOnLeave:false}));await app.evaluate(({screen})=>screen.getCursorScreenPoint=global.originalCursor);
 console.log('PASS: no native shadow, alpha-zero borders, text-only UI, scroll round-trip identical pixels, empty content leaves zero pixels, Escape recovery, native hover hide/re-entry.');
}finally{await app.close();fs.rmSync(dir,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exit(1)});
