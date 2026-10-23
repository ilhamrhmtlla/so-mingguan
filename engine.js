(function(root){
'use strict';
const norm=v=>String(v??'').normalize('NFKC').trim().replace(/\s+/g,' ').toUpperCase();
const number=v=>{if(typeof v==='number')return Number.isFinite(v)?v:null;if(v==null||String(v).trim()==='')return null;let s=String(v).trim().replace(/\s/g,'');if(s.includes(','))s=s.replace(/\./g,'').replace(',','.');return /^[-+]?\d+(\.\d+)?$/.test(s)?Number(s):null;};
function parse(rows,type){
 let h=-1,c={};
 for(let i=0;i<Math.min(rows.length,100);i++){const a=rows[i].map(norm);const n=a.indexOf('NAMA BARANG'),u=a.indexOf('SATUAN'),q=a.indexOf(type==='sales'?'KUANTITAS':'STOK GUDANG');if(n>=0&&u>=0&&q>=0){h=i;c={n,u,q,cat:a.indexOf('KATEGORI BARANG'),code:a.findIndex(x=>['KODE BARANG','NO. BARANG','NOMOR BARANG'].includes(x))};break;}}
 if(h<0)throw Error(type==='sales'?'Kolom Nama Barang, Satuan, dan Kuantitas tidak ditemukan. Pilih laporan Penjualan per Barang.':'Kolom Nama Barang, Satuan, dan Stok Gudang tidak ditemukan. Pilih laporan Ketersediaan Stok Penjualan.');
 const items=[];let invalid=0;
 for(let i=h+1;i<rows.length;i++){const r=rows[i],name=String(r[c.n]??'').trim(),unit=String(r[c.u]??'').trim();if(!name||norm(name)==='NAMA BARANG'||/^TOTAL(?:\s|$)/i.test(name))continue;const qty=number(r[c.q]);if(!unit||qty===null){invalid++;continue;}items.push({name,unit,qty,category:c.cat>=0?String(r[c.cat]??'').trim():'',code:c.code>=0?String(r[c.code]??'').trim():'',sourceRow:i+1});}
 if(!items.length)throw Error('Tidak ada baris barang yang dapat dibaca dari laporan ini.');
 const top=rows.slice(0,h).flat().filter(x=>typeof x==='string');return {items,invalid,period:top.find(x=>/Dari .*s\/d/i.test(x))||'',sheetRows:rows.length};
}
function match(sales,stock){
 const sold=new Map(),ix=new Map(),names=new Set(),categoryOrder=new Map(),stockOrder=new Map();let nonpositive=0;
 for(const s of sales.items){if(s.qty<=0){nonpositive++;continue;}const k=norm(s.name)+'\u0000'+norm(s.unit);if(sold.has(k))sold.get(k).sold+=s.qty;else sold.set(k,{...s,sold:s.qty});}
 for(const s of stock.items){const k=norm(s.name)+'\u0000'+norm(s.unit);if(!ix.has(k))ix.set(k,[]);ix.get(k).push(s);names.add(norm(s.name));if(!categoryOrder.has(norm(s.category)))categoryOrder.set(norm(s.category),categoryOrder.size);if(!stockOrder.has(k))stockOrder.set(k,stockOrder.size);}
 const result=[...sold.entries()].map(([key,s])=>{const a=ix.get(key)||[];let status=a.length===1?'Cocok':a.length>1?'Nama ganda':names.has(norm(s.name))?'Satuan berbeda':'Tidak ditemukan';return {name:s.name,unit:s.unit,sold:s.sold,stock:status==='Cocok'?a[0].qty:null,category:status==='Cocok'?a[0].category:'',status,physical:'',note:'',key};});
 const rank=r=>r.status==='Cocok'?(categoryOrder.get(norm(r.category))??Infinity):Infinity;
 result.sort((a,b)=>rank(a)-rank(b)||(stockOrder.get(a.key)??Infinity)-(stockOrder.get(b.key)??Infinity));return {rows:result,nonpositive};
}
root.SOEngine={norm,number,parse,match};
})(typeof module==='object'?module.exports:globalThis);
