const {app,BrowserWindow,WebContentsView,ipcMain,dialog,globalShortcut,Tray,Menu,nativeImage,screen}=require('electron');
const fs=require('node:fs'); const path=require('node:path'); const {pathToFileURL}=require('node:url');
const {translate}=require('./i18n.js');
const {webURL,decodeText,txtChapters,epubChapters,idFor}=require('./core.cjs');
if(process.env.QINGYU_TEST_DATA)app.setPath('userData',process.env.QINGYU_TEST_DATA);
let normalBounds, revealUntil=0, mouseDrag=null;
let win,view,tray,db,root,cssKey,hoverHidden=false,quitting=false,bounds,styleSerial=Promise.resolve();
let state={language:'zh-CN',opacity:1,top:false,transparent:false,hideOnLeave:false,hideImages:false,fontSize:18,textColor:'#39483f',autoScroll:0,bossKey:'Alt+Z',quitKey:'Alt+X'};
const tr=text=>translate(text,state.language);
function buildMenu(items){return Menu.buildFromTemplate(items.map(item=>({...item,...(item.label?{label:tr(item.label)}:{})})));}
const shellURL=pathToFileURL(path.join(__dirname,'index.html')).href;
const save=()=>fs.writeFileSync(path.join(root,'state.json'),JSON.stringify({settings:{...state,hideOnLeave:false,autoScroll:0},library:db.library,sites:db.sites}));
const emit=data=>{if(win&&!win.isDestroyed()) win.webContents.send('state',data);};
function pauseMedia(paused) {if(view&&!view.webContents.isDestroyed()) view.webContents.executeJavaScript(`document.querySelectorAll('video,audio').forEach(v=>{if(${paused}){if(!v.paused){v.dataset.qyResume='1';v.pause()}}else if(v.dataset.qyResume){delete v.dataset.qyResume;v.play().catch(()=>{})}})`).catch(()=>{});}
// Transparent native shadows cache the silhouette of old text on macOS.
// Disable them entirely instead of invalidating that cache on every scroll frame.
function restore(){hoverHidden=false;revealUntil=Date.now()+1200;win.setIgnoreMouseEvents(false);win.setHasShadow(false);win.setOpacity(state.opacity);win.show();win.focus();pauseMedia(false);}
function updateTray(){if(tray)tray.setContextMenu(buildMenu([{label:'显示上班摸鱼神器',click:restore},{label:'阅读工具栏（Alt+R）',click:()=>{restore();emit({toggleControls:true});}},{label:'恢复不透明窗口',click:()=>{state.opacity=1;state.transparent=false;state.hideOnLeave=false;restore();applyWebStyle();emit({settings:state});save();}},{type:'separator'},{label:'退出',click:()=>app.quit()}]));}
function readingMenu(){buildMenu([
 {label:'显示 / 收起阅读工具栏（Alt+R）',click:()=>emit({toggleControls:true})},
 {label:'阅读设置',click:()=>emit({showSettings:true})},
 {label:'关闭透明模式',click:()=>{state.transparent=false;state.hideOnLeave=false;restore();applyWebStyle();emit({settings:state});save();}},
 {type:'separator'},{label:'隐藏窗口',click:boss},{label:'退出',click:()=>app.quit()}
]).popup({window:win});}

function boss(){if(!win.isVisible()||win.isMinimized()||hoverHidden)restore();else{pauseMedia(true);win.hide();}}
function registerKeys(next){
  if([next.bossKey,next.quitKey].some(k=>String(k).toLowerCase()==='alt+r'))throw new Error('Alt+R 用于唤回阅读工具栏，请选择其他快捷键');
  const previous={bossKey:state.bossKey,quitKey:state.quitKey}; globalShortcut.unregisterAll();
  try {if(!next.bossKey||!next.quitKey||next.bossKey===next.quitKey||!globalShortcut.register(next.bossKey,boss)||!globalShortcut.register(next.quitKey,()=>app.quit()))throw new Error('快捷键已被占用或格式不正确');}
  catch(e){globalShortcut.unregisterAll();globalShortcut.register(previous.bossKey,boss);globalShortcut.register(previous.quitKey,()=>app.quit());globalShortcut.register('Alt+R',()=>{restore();emit({toggleControls:true});});throw e;}
  globalShortcut.register('Alt+R',()=>{restore();emit({toggleControls:true});});
}
function layout(){if(view&&bounds)view.setBounds(bounds);}
function closeView(){if(view){win.contentView.removeChildView(view);view.webContents.close();view=null;cssKey=null;} }
function applyWebStyle(){
  styleSerial=styleSerial.catch(()=>{}).then(async()=>{
    const active=view;if(!active||active.webContents.isDestroyed())return;
    if(cssKey) await active.webContents.removeInsertedCSS(cssKey).catch(()=>{});
    let css=state.transparent?'html,body,div,main,article,section,header,footer,aside,nav{background-color:transparent!important;background-image:none!important;}':'';
    if(state.hideImages)css+='img,video,canvas,svg,picture{visibility:hidden!important;}';
    if(state.transparent)css+=`p,span,a,h1,h2,h3,li{color:${state.textColor}!important;}`;
    cssKey=await active.webContents.insertCSS(css||'');
    active.setBackgroundColor(state.transparent?'#00000000':'#FFFFFFFF');
    active.webContents.setZoomFactor(state.fontSize/18);
  }).catch(()=>{});return styleSerial;
}
async function openWeb(url,local=false){
  closeView();view=new WebContentsView({webPreferences:{sandbox:true,contextIsolation:true,nodeIntegration:false,partition:'persist:qingyu-web',webSecurity:true}});
  const wc=view.webContents;wc.on('context-menu',readingMenu);wc.session.setPermissionRequestHandler((_wc,_permission,cb)=>cb(false));wc.session.setPermissionCheckHandler(()=>false);
  wc.setWindowOpenHandler(({url})=>{try{openWeb(webURL(url)).catch(e=>emit({error:e.message}));}catch{}return {action:'deny'};});
  wc.on('will-navigate',(event,target)=>{try{webURL(target);}catch{event.preventDefault();}});
  wc.on('will-redirect',(event,target)=>{try{webURL(target);}catch{event.preventDefault();}});
  wc.on('did-start-loading',()=>emit({loading:true}));wc.on('did-stop-loading',()=>emit({loading:false}));
  wc.on('did-navigate',(_e,url)=>emit({url:local?'本地 PDF':url}));
  wc.on('did-navigate-in-page',(_e,url)=>emit({url:local?'本地 PDF':url}));
  wc.on('did-finish-load',()=>{applyWebStyle();emit({pageTitle:wc.getTitle()});});
  wc.on('did-fail-load',(_e,code,description)=>{if(code!==-3)emit({error:'页面加载失败：'+description});});
  win.contentView.addChildView(view);layout();await wc.loadURL(url);return true;
}
async function importBook(){
  const result=await dialog.showOpenDialog(win,{title:tr('导入本地书籍'),filters:[{name:tr('电子书'),extensions:['txt','epub','pdf']}],properties:['openFile']});
  if(result.canceled)return null;
  const source=result.filePaths[0]; if(fs.statSync(source).size>50*1024*1024)throw new Error('文件超过 50 MB，请拆分后导入');
  const bytes=fs.readFileSync(source),id=idFor(bytes),ext=path.extname(source).slice(1).toLowerCase();
  if(db.library.some(x=>x.id===id))return db.library;
  let chapters;
  if(ext==='txt')chapters=txtChapters(decodeText(bytes));else if(ext==='epub')chapters=epubChapters(bytes);else if(ext!=='pdf')throw new Error('暂不支持此格式');
  if(chapters)fs.writeFileSync(path.join(root,id+'.json'),JSON.stringify(chapters));else fs.copyFileSync(source,path.join(root,id+'.pdf'));
  db.library.unshift({id,title:path.basename(source,path.extname(source)),format:ext.toUpperCase(),chapter:0,scroll:0,progress:0,added:Date.now()});save();return db.library;
}
app.whenReady().then(()=>{
  root=process.env.QINGYU_TEST_DATA||path.join(app.getPath('userData'),'library');fs.mkdirSync(root,{recursive:true});
  try{db=JSON.parse(fs.readFileSync(path.join(root,'state.json'),'utf8'));state={...state,...db.settings,hideOnLeave:false,autoScroll:0};}catch{db={library:[],sites:[]};}
  db.library=Array.isArray(db.library)?db.library:[];db.sites=Array.isArray(db.sites)?db.sites:[];
  win=new BrowserWindow({width:1180,height:790,minWidth:660,minHeight:480,frame:false,acceptFirstMouse:true,transparent:true,hasShadow:false,backgroundColor:'#00000000',show:false,webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true}});
  win.loadFile(path.join(__dirname,'index.html'));win.once('ready-to-show',()=>{win.show();win.setOpacity(state.opacity);win.setAlwaysOnTop(state.top);});
  win.webContents.setWindowOpenHandler(()=>({action:'deny'}));win.webContents.on('will-navigate',e=>e.preventDefault());
  win.on('blur',()=>{mouseDrag=null;});win.on('minimize',()=>pauseMedia(true));win.on('restore',()=>pauseMedia(false));
  win.on('close',event=>{if(!quitting){event.preventDefault();pauseMedia(true);win.hide();}});
  const pixels=Buffer.alloc(32*32*4);for(let i=0;i<pixels.length;i+=4){pixels[i]=118;pixels[i+1]=111;pixels[i+2]=36;pixels[i+3]=255;}
  tray=new Tray(nativeImage.createFromBitmap(pixels,{width:32,height:32}));tray.setToolTip('上班摸鱼神器 · '+state.bossKey+' 显示/隐藏');updateTray();tray.on('click',restore);
  try{registerKeys(state);}catch(e){win.webContents.once('did-finish-load',()=>emit({error:e.message+'，请在设置中修改'}));}
  setInterval(()=>{
    if(!win||win.isDestroyed()||win.isMinimized())return;
    // Native hide removes every composited pixel, shadow and hit target.
    // Keep polling our stored bounds while hover-hidden to allow re-entry.
    if(!win.isVisible()&&!hoverHidden)return;
    if(state.hideOnLeave&&!mouseDrag&&Date.now()>=revealUntil){
      const p=screen.getCursorScreenPoint(),b=win.getBounds();
      const outside=p.x<b.x||p.x>=b.x+b.width||p.y<b.y||p.y>=b.y+b.height;
      if(outside!==hoverHidden){
        hoverHidden=outside;
        if(outside){pauseMedia(true);win.hide();}
        else{win.setHasShadow(false);win.setOpacity(state.opacity);win.showInactive();pauseMedia(false);}
      }
    }
    if(state.autoScroll>0&&!hoverHidden){if(view)view.webContents.executeJavaScript(`(()=>{const el=document.scrollingElement; if(el)el.scrollBy(0,${state.autoScroll/10});})()`).catch(()=>{});else emit({scrollBy:state.autoScroll/10});}
  },100);
});
ipcMain.handle('qingyu',async(event,action,p)=>{
  if(event.sender!==win?.webContents || event.senderFrame.url!==shellURL)throw new Error('无权访问');
  switch(action){
    case 'drag-start':{
      if(p&&Number.isFinite(p.x)&&Number.isFinite(p.y))mouseDrag={x:p.x,y:p.y,bounds:win.getBounds()};return;
    }
    case 'drag-move':{
      if(mouseDrag&&p&&Number.isFinite(p.x)&&Number.isFinite(p.y))win.setPosition(Math.round(mouseDrag.bounds.x+p.x-mouseDrag.x),Math.round(mouseDrag.bounds.y+p.y-mouseDrag.y));return;
    }
    case 'drag-end':mouseDrag=null;revealUntil=Date.now()+300;return;
    case 'reading-menu':readingMenu();return;
    case 'compact':{if(p){if(!normalBounds)normalBounds=win.getBounds();win.setMinimumSize(240,140);win.setSize(460,p==='strip'?300:600);}else{win.setMinimumSize(660,480);if(normalBounds)win.setBounds(normalBounds);normalBounds=null;}return;}
    case 'init':return {settings:state,library:db.library,sites:db.sites};
    case 'window':if(p==='hide')boss();else if(p==='minimize')win.minimize();else if(p==='maximize'){win.isMaximized()?win.unmaximize():win.maximize();}else if(p==='quit')app.quit();return;
    case 'settings':{
      const next={...state};if(['zh-CN','en'].includes(p.language))next.language=p.language;for(const k of ['top','transparent','hideOnLeave','hideImages'])if(typeof p[k]==='boolean')next[k]=p[k];
      for(const [k,min,max] of [['opacity',.1,1],['fontSize',12,30],['autoScroll',0,100]])if(Number.isFinite(p[k]))next[k]=Math.min(max,Math.max(min,p[k]));
      if(/^#[\da-f]{6}$/i.test(p.textColor))next.textColor=p.textColor;
      for(const k of ['bossKey','quitKey'])if(typeof p[k]==='string'&&p[k].length<70)next[k]=p[k];
      if(next.bossKey!==state.bossKey||next.quitKey!==state.quitKey)registerKeys(next);
      state=next;updateTray();win.setAlwaysOnTop(state.top);win.setHasShadow(false);if(!state.hideOnLeave&&hoverHidden){hoverHidden=false;win.showInactive();pauseMedia(false);}win.setOpacity(state.opacity);await applyWebStyle();save();return state;
    }
    case 'bounds':if(p&&['x','y','width','height'].every(k=>Number.isFinite(p[k])&&p[k]>=0)){bounds=Object.fromEntries(Object.entries(p).filter(([k])=>['x','y','width','height'].includes(k)).map(([k,v])=>[k,Math.round(v)]));layout();}return;
    case 'web':return openWeb(webURL(p));
    case 'home':closeView();return;
    case 'navigate':if(view){const h=view.webContents.navigationHistory;if(p==='back'&&h.canGoBack())h.goBack();if(p==='forward'&&h.canGoForward())h.goForward();if(p==='reload')view.webContents.reload();}return;
    case 'import':return importBook();
    case 'book':{const book=db.library.find(x=>x.id===p);if(!book)throw new Error('书籍不存在');closeView();if(book.format==='PDF'){await openWeb(pathToFileURL(path.join(root,book.id+'.pdf')).href,true);return {book};}return {book,chapters:JSON.parse(fs.readFileSync(path.join(root,book.id+'.json'),'utf8'))};}
    case 'progress':{const book=db.library.find(x=>x.id===p.id);if(book){book.chapter=Math.max(0,Math.floor(Number(p.chapter)||0));book.scroll=Math.max(0,Number(p.scroll)||0);book.progress=Math.max(0,Math.min(100,Number(p.progress)||0));book.lastRead=Date.now();save();}return;}
    case 'remove':{const book=db.library.find(x=>x.id===p);if(book){db.library=db.library.filter(x=>x.id!==p);fs.rmSync(path.join(root,book.id+(book.format==='PDF'?'.pdf':'.json')),{force:true});save();}return db.library;}
    case 'site':{const url=webURL(p.url);if(!db.sites.some(x=>x.url===url))db.sites.push({url,title:String(p.title||new URL(url).hostname).slice(0,60)});save();return db.sites;}
    case 'removeSite':db.sites=db.sites.filter(x=>x.url!==p);save();return db.sites;
    default:throw new Error('未知操作');
  }
});
app.on('before-quit',()=>{quitting=true;closeView();});app.on('will-quit',()=>globalShortcut.unregisterAll());
if(!app.requestSingleInstanceLock())app.quit();app.on('second-instance',()=>{if(win)restore();});

app.on('activate',()=>{if(win&&!win.isDestroyed())restore();});
