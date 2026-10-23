(function(root){
'use strict';
const norm=v=>String(v??'').normalize('NFKC').trim().replace(/\s+/g,' ').toUpperCase();
const number=v=>{if(typeof v==='number')return Number.isFinite(v)?v:null;if(v==null||String(v).trim()==='')return null;let s=String(v).trim().replace(/\s/g,'');if(s.includes(','))s=s.replace(/\./g,'').replace(',','.');return /^[-+]?\d+(\.\d+)?$/.test(s)?Number(s):null;};
function parse(rows,type,options={}){
 let h=-1,c={};
 for(let i=0;i<Math.min(rows.length,100);i++){const a=rows[i].map(norm);const n=a.findIndex(x=>['NAMA BARANG','NAMA ITEM'].includes(x)),u=a.indexOf('SATUAN'),q=a.findIndex(x=>(type==='sales'?['KUANTITAS','JUMLAH']:['STOK GUDANG','STOK']).includes(x));if(n>=0&&u>=0&&q>=0){h=i;c={n,u,q,cat:a.findIndex(x=>['KATEGORI BARANG','JENIS'].includes(x)),code:a.findIndex(x=>['KODE BARANG','NO. BARANG','NOMOR BARANG','KODE ITEM'].includes(x)),ipos:a.includes('KODE ITEM')};break;}}
 if(h<0)throw Error(type==='sales'?'Kolom Nama Barang, Satuan, dan Kuantitas tidak ditemukan. Pilih laporan Penjualan per Barang.':'Kolom Nama Barang, Satuan, dan Stok Gudang tidak ditemukan. Pilih laporan Ketersediaan Stok Penjualan.');
 const value=(r,col)=>{const direct=rows[r]?.[col];if(direct!==null&&direct!==undefined&&direct!=='')return direct;const m=(options.merges||[]).find(m=>m.s.r<=r&&m.e.r>=r&&m.s.c<=col&&m.e.c>=col);return m?rows[m.s.r]?.[m.s.c]:direct;};
 const items=[];let invalid=0;
 for(let i=h+1;i<rows.length;i++){const r=rows[i],name=String(r[c.n]??'').trim(),unit=String(r[c.u]??'').trim();if(!name||['NAMA BARANG','NAMA ITEM'].includes(norm(name))||/^TOTAL(?:\s|$)/i.test(name))continue;const qty=number(value(i,c.q));if(!unit||qty===null){invalid++;continue;}items.push({name,unit,qty,category:c.cat>=0?String(r[c.cat]??'').trim():'',code:c.code>=0?String(r[c.code]??'').trim():'',sourceRow:i+1});}
 if(!items.length)throw Error('Tidak ada baris barang yang dapat dibaca dari laporan ini.');
 const top=rows.slice(0,h).flat().filter(x=>typeof x==='string');return {items,invalid,period:top.find(x=>/Dari .*s\/d|PERIODE\s*:/i.test(x))||'',company:top.find(x=>/^(PT\.?\s|APOTEK\s|TOKO\s|CV\.?\s)/i.test(x.trim()))||'',format:c.ipos?'iPos':'Accurate',sheetRows:rows.length};
}
function match(sales,stock){
 const sold=new Map(),ix=new Map(),names=new Set(),categoryOrder=new Map(),stockOrder=new Map();let nonpositive=0;
 const useCode=sales.items.every(s=>s.code)&&stock.items.every(s=>s.code),identity=s=>norm(useCode?s.code:s.name),keyOf=s=>identity(s)+'\u0000'+norm(s.unit);
 for(const s of sales.items){if(s.qty<=0){nonpositive++;continue;}const k=keyOf(s);if(sold.has(k))sold.get(k).sold+=s.qty;else sold.set(k,{...s,sold:s.qty});}
 for(const s of stock.items){const k=keyOf(s);if(!ix.has(k))ix.set(k,[]);ix.get(k).push(s);names.add(identity(s));if(!categoryOrder.has(norm(s.category)))categoryOrder.set(norm(s.category),categoryOrder.size);if(!stockOrder.has(k))stockOrder.set(k,stockOrder.size);}
 const result=[...sold.entries()].map(([key,s])=>{const a=ix.get(key)||[];let status=a.length===1?'Cocok':a.length>1?(useCode?'Kode ganda':'Nama ganda'):names.has(identity(s))?'Satuan berbeda':'Tidak ditemukan';return {name:s.name,code:s.code,unit:s.unit,sold:s.sold,stock:status==='Cocok'?a[0].qty:null,category:status==='Cocok'?a[0].category:'',status,physical:'',note:'',key};});
 const rank=r=>r.status==='Cocok'?(categoryOrder.get(norm(r.category))??Infinity):Infinity;
 result.sort((a,b)=>rank(a)-rank(b)||(stockOrder.get(a.key)??Infinity)-(stockOrder.get(b.key)??Infinity));return {rows:result,nonpositive,method:useCode?'Kode item + satuan':'Nama barang + satuan'};
}
root.SOEngine={norm,number,parse,match};
})(typeof module==='object'?module.exports:globalThis);
