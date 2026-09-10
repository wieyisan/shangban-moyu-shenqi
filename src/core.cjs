const { unzipSync } = require('fflate');
const { XMLParser } = require('fast-xml-parser');
const path = require('node:path');
const crypto = require('node:crypto');
function webURL(value) {
  const text = String(value || '').trim();
  const u = new URL(/^[a-z][a-z\d+.-]*:/i.test(text) ? text : `https://${text}`);
  if (!['https:', 'http:'].includes(u.protocol) || !u.hostname || u.username || u.password) throw new Error('请输入有效的 http 或 https 网址');
  return u.href;
}
function decodeText(bytes) {
  if (bytes[0] === 0xff && bytes[1] === 0xfe) return new TextDecoder('utf-16le').decode(bytes);
  if (bytes[0] === 0xfe && bytes[1] === 0xff) return new TextDecoder('utf-16be').decode(bytes);
  try { return new TextDecoder('utf-8', { fatal:true }).decode(bytes); }
  catch { return new TextDecoder('gb18030').decode(bytes); }
}
const entity = s => s.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (_, k) => {
  if(k[0]==='#') {const n=k[1].toLowerCase()==='x'?parseInt(k.slice(2),16):parseInt(k.slice(1),10); return n>0 && n<=0x10ffff?String.fromCodePoint(n):'';}
  return ({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '})[k.toLowerCase()];
});
function plainHTML(s) {
  return entity(s.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,'').replace(/<\/(p|div|h[1-6]|li|section)>/gi,'\n\n').replace(/<br\s*\/?\s*>/gi,'\n').replace(/<[^>]*>/g,'')).replace(/[ \t]+/g,' ').replace(/\n\s*\n\s*\n/g,'\n\n').trim();
}
function txtChapters(text) {
  const lines=text.replace(/\r\n?/g,'\n').split('\n'); const chapters=[]; let current={title:'正文',text:''};
  for (const line of lines) {
    if (/^\s*(第[零〇一二三四五六七八九十百千万\d]+[章回卷节部篇]|chapter\s+\d+)/i.test(line) && line.length<90) {
      if(current.text.trim()) chapters.push(current); current={title:line.trim(),text:''};
    } else current.text+=line+'\n';
  }
  if(current.text.trim()) chapters.push(current);
  return chapters.length?chapters:[{title:'正文',text:text || '（空白文件）'}];
}
function epubChapters(bytes) {
  let total=0;
  const entries=unzipSync(bytes,{filter(file){total+=file.originalSize; if(total>100*1024*1024 || file.originalSize>20*1024*1024) throw new Error('EPUB 解压后过大（上限 100 MB）'); return true;}});
  const read=p=>{if(!entries[p]) throw new Error('EPUB 缺少文件：'+p); return new TextDecoder().decode(entries[p]);};
  const xml=new XMLParser({ignoreAttributes:false,processEntities:false});
  const container=xml.parse(read('META-INF/container.xml'));
  const roots=container.container?.rootfiles?.rootfile;
  const root=(Array.isArray(roots)?roots[0]:roots)?.['@_full-path'];
  if(!root) throw new Error('无法读取 EPUB 目录');
  const pkg=xml.parse(read(root)).package;
  const list=x=>Array.isArray(x)?x:x?[x]:[];
  const manifest=new Map(list(pkg.manifest?.item).map(x=>[x['@_id'],x]));
  const chapters=[];
  for(const ref of list(pkg.spine?.itemref)) {
    const item=manifest.get(ref['@_idref']); if(!item || ref['@_linear']==='no') continue;
    const filename=path.posix.normalize(path.posix.join(path.posix.dirname(root),decodeURIComponent(item['@_href'].split('#')[0])));
    const html=read(filename); const text=plainHTML(html.replace(/<head\b[^>]*>[\s\S]*?<\/head>/i,''));
    if(text) chapters.push({title:plainHTML(html.match(/<h[12]\b[^>]*>([\s\S]*?)<\/h[12]>/i)?.[1] || '') || `第 ${chapters.length+1} 节`,text});
  }
  if(!chapters.length) throw new Error('没有找到可读正文；不支持加密 EPUB');
  return chapters;
}
const idFor = bytes => crypto.createHash('sha256').update(bytes).digest('hex').slice(0,24);
module.exports={webURL,decodeText,txtChapters,epubChapters,idFor,plainHTML};
