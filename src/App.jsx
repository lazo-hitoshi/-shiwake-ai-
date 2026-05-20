import { useState, useCallback, useRef, useEffect } from "react";

/* ═══ Industry & Account Data ═══ */
const DEFAULT_INDUSTRIES = {
  general: { label: "汎用（全業種共通）", icon: "🏢", isBase: true, accounts: [
    {code:"611",name:"役員報酬",category:"expenses"},{code:"612",name:"給料手当",category:"expenses"},{code:"613",name:"法定福利費",category:"expenses"},{code:"614",name:"福利厚生費",category:"expenses"},{code:"621",name:"旅費交通費",category:"expenses"},{code:"622",name:"通信費",category:"expenses"},{code:"623",name:"消耗品費",category:"expenses"},{code:"624",name:"事務用品費",category:"expenses"},{code:"625",name:"水道光熱費",category:"expenses"},{code:"626",name:"地代家賃",category:"expenses"},{code:"627",name:"保険料",category:"expenses"},{code:"628",name:"修繕費",category:"expenses"},{code:"629",name:"租税公課",category:"expenses"},{code:"631",name:"接待交際費",category:"expenses"},{code:"632",name:"会議費",category:"expenses"},{code:"633",name:"広告宣伝費",category:"expenses"},{code:"634",name:"支払手数料",category:"expenses"},{code:"635",name:"車両費",category:"expenses"},{code:"636",name:"リース料",category:"expenses"},{code:"637",name:"減価償却費",category:"expenses"},{code:"638",name:"外注費",category:"expenses"},{code:"639",name:"諸会費",category:"expenses"},{code:"641",name:"新聞図書費",category:"expenses"},{code:"642",name:"研修費",category:"expenses"},{code:"649",name:"雑費",category:"expenses"},
    {code:"111",name:"現金",category:"assets"},{code:"112",name:"普通預金",category:"assets"},{code:"113",name:"当座預金",category:"assets"},{code:"121",name:"売掛金",category:"assets"},{code:"131",name:"前払費用",category:"assets"},{code:"141",name:"仮払金",category:"assets"},{code:"151",name:"建物",category:"assets"},{code:"152",name:"車両運搬具",category:"assets"},{code:"153",name:"工具器具備品",category:"assets"},{code:"154",name:"ソフトウェア",category:"assets"},
    {code:"211",name:"買掛金",category:"liabilities"},{code:"212",name:"未払金",category:"liabilities"},{code:"213",name:"未払費用",category:"liabilities"},{code:"214",name:"預り金",category:"liabilities"},{code:"215",name:"仮受消費税",category:"liabilities"},{code:"221",name:"借入金",category:"liabilities"},
  ]},
  construction: { label: "建設業", icon: "🏗️", accounts: [
    {code:"511",name:"材料費",category:"expenses"},{code:"512",name:"労務費",category:"expenses"},{code:"513",name:"外注加工費",category:"expenses"},{code:"514",name:"機械等経費",category:"expenses"},{code:"515",name:"仮設材料費",category:"expenses"},{code:"516",name:"安全対策費",category:"expenses"},{code:"517",name:"産廃処理費",category:"expenses"},{code:"518",name:"重機リース料",category:"expenses"},{code:"519",name:"測量設計費",category:"expenses"},{code:"521",name:"現場交通費",category:"expenses"},{code:"522",name:"工事保険料",category:"expenses"},
  ]},
  it_services: { label: "IT・情報サービス業", icon: "💻", accounts: [
    {code:"511",name:"クラウド利用料",category:"expenses"},{code:"512",name:"ライセンス費",category:"expenses"},{code:"513",name:"サーバー費用",category:"expenses"},{code:"514",name:"外注開発費",category:"expenses"},{code:"515",name:"SaaS利用料",category:"expenses"},{code:"516",name:"ドメイン費用",category:"expenses"},{code:"517",name:"データセンター費",category:"expenses"},{code:"518",name:"セキュリティ対策費",category:"expenses"},
  ]},
  retail: { label: "小売・飲食業", icon: "🛒", accounts: [
    {code:"511",name:"商品仕入高",category:"expenses"},{code:"512",name:"原材料費",category:"expenses"},{code:"513",name:"包装資材費",category:"expenses"},{code:"514",name:"容器代",category:"expenses"},{code:"515",name:"衛生管理費",category:"expenses"},{code:"516",name:"食材廃棄損",category:"expenses"},{code:"517",name:"店舗装飾費",category:"expenses"},{code:"518",name:"POS関連費",category:"expenses"},
  ]},
  manufacturing: { label: "製造業", icon: "🏭", accounts: [
    {code:"511",name:"原材料費",category:"expenses"},{code:"512",name:"労務費",category:"expenses"},{code:"513",name:"製造経費",category:"expenses"},{code:"514",name:"外注加工費",category:"expenses"},{code:"515",name:"動力費",category:"expenses"},{code:"516",name:"金型費",category:"expenses"},{code:"517",name:"品質管理費",category:"expenses"},{code:"518",name:"工場消耗品費",category:"expenses"},
  ]},
  realestate: { label: "不動産業", icon: "🏠", accounts: [
    {code:"511",name:"管理委託費",category:"expenses"},{code:"512",name:"仲介手数料",category:"expenses"},{code:"513",name:"修繕積立金",category:"expenses"},{code:"514",name:"原状回復費",category:"expenses"},{code:"515",name:"鑑定評価費",category:"expenses"},{code:"516",name:"登記費用",category:"expenses"},{code:"517",name:"固定資産税",category:"expenses"},
  ]},
  medical: { label: "医療・福祉", icon: "🏥", accounts: [
    {code:"511",name:"医薬品費",category:"expenses"},{code:"512",name:"診療材料費",category:"expenses"},{code:"513",name:"医療機器費",category:"expenses"},{code:"514",name:"検査委託費",category:"expenses"},{code:"515",name:"給食材料費",category:"expenses"},{code:"516",name:"寝具消耗品費",category:"expenses"},{code:"517",name:"介護用品費",category:"expenses"},
  ]},
  transport: { label: "運輸・物流業", icon: "🚛", accounts: [
    {code:"511",name:"燃料費",category:"expenses"},{code:"512",name:"車両修繕費",category:"expenses"},{code:"513",name:"高速道路料金",category:"expenses"},{code:"514",name:"運送保険料",category:"expenses"},{code:"515",name:"倉庫保管料",category:"expenses"},{code:"516",name:"荷役費",category:"expenses"},{code:"517",name:"車検整備費",category:"expenses"},
  ]},
  waste: { label: "産廃・環境業", icon: "♻️", accounts: [
    {code:"511",name:"処分場管理費",category:"expenses"},{code:"512",name:"収集運搬費",category:"expenses"},{code:"513",name:"中間処理費",category:"expenses"},{code:"514",name:"最終処分費",category:"expenses"},{code:"515",name:"環境測定費",category:"expenses"},{code:"516",name:"マニフェスト費",category:"expenses"},{code:"517",name:"特管産廃処理費",category:"expenses"},
  ]},
};

const CATEGORY_LABELS = {expenses:{label:"費用",color:"#c0392b"},assets:{label:"資産",color:"#2471a3"},liabilities:{label:"負債",color:"#7d3c98"}};
const font = `'Noto Sans JP','Helvetica Neue',sans-serif`;
const accent = "#1a3a4a";
const accentLight = "#2980b9";
const bg = "#f4f6f8";
const cardBg = "#ffffff";
const bdr = "#dde3ea";
function deepClone(o){return JSON.parse(JSON.stringify(o))}

/* ═══ Auth & usage (server-side) ═══ */
const SESSION_KEY="shiwake_session";
const PLAN_LABELS={
  free:"無料プラン",light:"ライトプラン",basic:"ベーシックプラン",
  business:"ビジネスプラン",pro:"プロプラン",unlimited:"無制限プラン",
};
const LIMIT_MSG="今月の処理枚数を使い切りました";
const LIMIT_MSG_DETAIL="今月の処理枚数を使い切りました。翌月1日にリセットされます。";

function loadSession(){
  try{
    const raw=sessionStorage.getItem(SESSION_KEY);
    if(raw)return JSON.parse(raw);
  }catch{/* ignore */}
  return null;
}
function saveSession(session){sessionStorage.setItem(SESSION_KEY,JSON.stringify(session));}
function clearSession(){sessionStorage.removeItem(SESSION_KEY);}
function getPlanLabel(plan){return PLAN_LABELS[plan]||plan;}

async function fetchUsage(token){
  try{
    const res=await fetch(`/api/usage?token=${encodeURIComponent(token)}`);
    if(!res.ok)return null;
    return await res.json();
  }catch{return null;}
}

async function fetchAdminReport(token){
  try{
    const res=await fetch(`/api/usage?token=${encodeURIComponent(token)}&admin=true`);
    if(!res.ok)return null;
    return await res.json();
  }catch{return null;}
}

const isMobileDevice=()=>/iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

function usageFromApi(data,user){
  if(!data)return{used:0,max:user?.maxPerMonth??10,remaining:user?.maxPerMonth??10,reached:false};
  return{
    used:data.used??0,
    max:data.max??user?.maxPerMonth??10,
    remaining:data.remaining??0,
    month:data.month,
    reached:(data.used??0)>=(data.max??0),
    warn:(data.remaining??99)<=10&&(data.remaining??99)>0,
  };
}

function UsageProgress({usageInfo}){
  if(!usageInfo)return null;
  const pct=usageInfo.max?Math.min(100,(usageInfo.used/usageInfo.max)*100):0;
  const barColor=usageInfo.reached?"#c62828":usageInfo.warn?"#f57f17":"#27ae60";
  return(
    <div style={{background:cardBg,borderRadius:10,padding:"12px 16px",border:`1px solid ${bdr}`,marginBottom:16}}>
      <div style={{fontSize:12,fontWeight:700,color:accent,marginBottom:8}}>
        今月の利用状況：{usageInfo.used} / {usageInfo.max} 枚
        {usageInfo.remaining>0&&<span style={{fontWeight:400,color:"#666"}}>（残り {usageInfo.remaining} 枚）</span>}
      </div>
      <div style={{height:8,background:"#e8ecf0",borderRadius:4,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${pct}%`,background:barColor,borderRadius:4,transition:"width 0.3s"}}/>
      </div>
      {usageInfo.warn&&!usageInfo.reached&&<p style={{margin:"8px 0 0",fontSize:12,color:"#f57f17",fontWeight:600}}>⚠️ 残り枚数が少なくなっています</p>}
      {usageInfo.reached&&<p style={{margin:"8px 0 0",fontSize:12,color:"#c62828",fontWeight:700}}>{LIMIT_MSG_DETAIL}</p>}
    </div>
  );
}

function LoginScreen({onLogin}){
  const[company,setCompany]=useState("");
  const[password,setPassword]=useState("");
  const[error,setError]=useState("");
  const[loading,setLoading]=useState(false);
  const submit=async e=>{
    e.preventDefault();
    setLoading(true);setError("");
    try{
      const res=await fetch("/api/auth",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({company,password})});
      const data=await res.json();
      if(!data.success){setError(data.error||"ログインに失敗しました");return;}
      const session={token:data.token,user:data.user};
      saveSession(session);
      onLogin(session);
    }catch{setError("通信エラーが発生しました");}
    finally{setLoading(false);}
  };
  return(
    <div style={{minHeight:"100vh",background:bg,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:font}}>
      <div style={{background:cardBg,borderRadius:16,padding:"36px 32px",border:`1px solid ${bdr}`,width:"100%",maxWidth:400,boxShadow:"0 8px 32px rgba(0,0,0,0.08)"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:48,marginBottom:8}}>📒</div>
          <h1 style={{margin:0,fontSize:22,color:accent,fontWeight:800}}>AI自動仕訳システム</h1>
          <p style={{margin:"8px 0 0",fontSize:13,color:"#888"}}>会社名とパスワードでログイン</p>
        </div>
        <form onSubmit={submit}>
          <label style={{fontSize:12,fontWeight:600,color:"#555",display:"block",marginBottom:6}}>会社名</label>
          <input value={company} onChange={e=>setCompany(e.target.value)} placeholder="例：A商事" required
            style={{width:"100%",padding:"12px 14px",borderRadius:8,border:`2px solid ${bdr}`,fontSize:14,fontFamily:font,boxSizing:"border-box",marginBottom:16}}/>
          <label style={{fontSize:12,fontWeight:600,color:"#555",display:"block",marginBottom:6}}>パスワード</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="パスワード" required
            style={{width:"100%",padding:"12px 14px",borderRadius:8,border:`2px solid ${bdr}`,fontSize:14,fontFamily:font,boxSizing:"border-box",marginBottom:8}}/>
          {error&&<p style={{color:"#c62828",fontSize:13,margin:"8px 0 16px",textAlign:"center"}}>{error}</p>}
          <button type="submit" disabled={loading}
            style={{width:"100%",padding:"14px 0",borderRadius:8,border:"none",background:loading?"#ccc":accentLight,color:"#fff",fontSize:16,fontWeight:700,cursor:loading?"default":"pointer",fontFamily:font,marginTop:8}}>
            {loading?"ログイン中...":"ログイン"}
          </button>
        </form>
      </div>
    </div>
  );
}

function AdminPanel({token,onClose}){
  const[report,setReport]=useState(null);
  const[loading,setLoading]=useState(true);
  useEffect(()=>{fetchAdminReport(token).then(r=>{setReport(r);setLoading(false);});},[token]);
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:2000,display:"flex",justifyContent:"center",alignItems:"center",padding:16}} onClick={onClose}>
      <div style={{background:cardBg,borderRadius:16,width:"100%",maxWidth:720,maxHeight:"85vh",overflow:"hidden",display:"flex",flexDirection:"column",boxShadow:"0 24px 80px rgba(0,0,0,0.25)"}} onClick={e=>e.stopPropagation()}>
        <div style={{background:`linear-gradient(135deg,${accent},#2c3e50)`,padding:"16px 24px",color:"#fff",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <h2 style={{margin:0,fontSize:16,fontWeight:800}}>📊 利用状況管理</h2>
          <button onClick={onClose} style={{padding:"6px 14px",borderRadius:6,border:"1px solid rgba(255,255,255,0.4)",background:"transparent",color:"#fff",fontSize:13,cursor:"pointer",fontFamily:font}}>閉じる</button>
        </div>
        <div style={{padding:20,overflowY:"auto",flex:1}}>
          {loading?<p style={{textAlign:"center",color:"#888"}}>読み込み中...</p>:report?(
            <>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
                <div style={{background:"#eaf2f8",borderRadius:10,padding:16}}>
                  <div style={{fontSize:11,color:"#666"}}>今月のAPI総利用回数</div>
                  <div style={{fontSize:24,fontWeight:800,color:accent}}>{report.totalUsed} 回</div>
                </div>
                <div style={{background:"#e8f5e9",borderRadius:10,padding:16}}>
                  <div style={{fontSize:11,color:"#666"}}>推定費用（1回¥5）</div>
                  <div style={{fontSize:24,fontWeight:800,color:"#1b5e20"}}>¥{report.estimatedCostYen?.toLocaleString()}</div>
                </div>
              </div>
              <div style={{fontSize:12,color:"#888",marginBottom:10}}>対象月：{report.month}</div>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                  <thead><tr style={{background:"#f5f7fa"}}>
                    <th style={{padding:"8px 10px",textAlign:"left"}}>会社名</th>
                    <th style={{padding:"8px 10px",textAlign:"left"}}>プラン</th>
                    <th style={{padding:"8px 10px",textAlign:"left"}}>業種</th>
                    <th style={{padding:"8px 10px",textAlign:"right"}}>利用枚数</th>
                    <th style={{padding:"8px 10px",width:120}}>利用率</th>
                  </tr></thead>
                  <tbody>{report.users?.map(u=>(
                    <tr key={u.id} style={{borderBottom:"1px solid #f0f2f5"}}>
                      <td style={{padding:"8px 10px",fontWeight:600}}>{u.company}</td>
                      <td style={{padding:"8px 10px"}}>{getPlanLabel(u.plan)}</td>
                      <td style={{padding:"8px 10px"}}>{u.industry}</td>
                      <td style={{padding:"8px 10px",textAlign:"right"}}>{u.used} / {u.max}</td>
                      <td style={{padding:"8px 10px"}}>
                        <div style={{height:6,background:"#e8ecf0",borderRadius:3,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${Math.min(100,u.percent)}%`,background:u.percent>=100?"#c62828":u.percent>=80?"#f57f17":"#27ae60"}}/>
                        </div>
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </>
          ):<p style={{color:"#c62828"}}>データを取得できませんでした</p>}
        </div>
      </div>
    </div>
  );
}

function buildCSV(entries){
  const h="日付,借方コード,借方科目,貸方コード,貸方科目,金額,税区分,消費税額,取引先,摘要,インボイス番号";
  const rows=entries.map(e=>`${e.date},${e.debit_code},${e.debit_account},${e.credit_code},${e.credit_account},${e.amount},${e.tax_rate},${e.tax_amount||0},${e.vendor},${e.description},${e.invoice_number||""}`);
  return"\uFEFF"+[h,...rows].join("\n");
}

async function shareOrSaveCSV(csvText,filename,onShowModal){
  const blob=new Blob([csvText],{type:"text/csv;charset=utf-8;"});
  const file=new File([blob],filename,{type:"text/csv"});
  if(navigator.share&&navigator.canShare?.({files:[file]})){
    try{
      await navigator.share({files:[file],title:"仕訳帳CSV"});
      return;
    }catch(err){
      if(err?.name==="AbortError")return;
    }
  }
  if(isMobileDevice()){
    onShowModal({csvText,filename});
    return;
  }
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url;a.download=filename;a.rel="noopener";
  document.body.appendChild(a);a.click();
  setTimeout(()=>{document.body.removeChild(a);URL.revokeObjectURL(url);},500);
}

function CsvExportModal({csvText,filename,onClose}){
  const[copied,setCopied]=useState(false);
  const copy=async()=>{
    try{
      await navigator.clipboard.writeText(csvText);
      setCopied(true);
      setTimeout(()=>setCopied(false),2000);
    }catch{
      const ta=document.createElement("textarea");
      ta.value=csvText;ta.style.position="fixed";ta.style.left="-9999px";
      document.body.appendChild(ta);ta.select();document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);setTimeout(()=>setCopied(false),2000);
    }
  };
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:2000,display:"flex",alignItems:"flex-end",justifyContent:"center",padding:12}} onClick={onClose}>
      <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:480,padding:"20px 18px",boxShadow:"0 -4px 24px rgba(0,0,0,0.15)"}} onClick={e=>e.stopPropagation()}>
        <h3 style={{margin:"0 0 8px",fontSize:16,color:accent,fontWeight:800}}>CSVを保存</h3>
        <p style={{margin:"0 0 14px",fontSize:12,color:"#666",lineHeight:1.6}}>「コピー」を押して、メモ帳・Excel・Googleスプレッドシートに貼り付けて保存できます。</p>
        <div style={{fontSize:11,color:"#999",marginBottom:8}}>{filename}</div>
        <textarea readOnly value={csvText} style={{width:"100%",height:100,fontSize:10,fontFamily:"monospace",borderRadius:8,border:`1px solid ${bdr}`,padding:8,boxSizing:"border-box",resize:"none",marginBottom:14}}/>
        <div style={{display:"flex",gap:10}}>
          <button onClick={copy} style={{flex:1,padding:"12px 0",borderRadius:8,border:"none",background:copied?"#27ae60":accentLight,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:font}}>{copied?"コピーしました":"コピー"}</button>
          <button onClick={onClose} style={{padding:"12px 20px",borderRadius:8,border:`1px solid ${bdr}`,background:"#fff",color:"#666",fontSize:14,cursor:"pointer",fontFamily:font}}>閉じる</button>
        </div>
      </div>
    </div>
  );
}

/* ═══ Step Bar ═══ */
function StepBar({current}){
  const steps=[{num:1,label:"業種を選ぶ",icon:"🏢"},{num:2,label:"領収書を取り込む",icon:"📷"},{num:3,label:"AIが仕訳を作成",icon:"🤖"},{num:4,label:"確認・保存",icon:"💾"}];
  return(
    <div style={{display:"flex",justifyContent:"center",gap:0,marginBottom:20,padding:"0 8px"}}>
      {steps.map((s,i)=>{const done=current>s.num;const active=current===s.num;return(
        <div key={s.num} style={{display:"flex",alignItems:"center"}}>
          <div style={{textAlign:"center",minWidth:80}}>
            <div style={{width:44,height:44,borderRadius:"50%",margin:"0 auto 6px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,background:done?"#27ae60":active?accentLight:"#e8ecf0",color:done||active?"#fff":"#999",border:active?`3px solid #1a6fa0`:"3px solid transparent",transition:"all 0.3s",boxShadow:active?"0 2px 12px rgba(41,128,185,0.3)":"none"}}>{done?"✓":s.icon}</div>
            <div style={{fontSize:11,fontWeight:active?700:400,color:active?accent:done?"#27ae60":"#999"}}>{s.label}</div>
          </div>
          {i<steps.length-1&&<div style={{width:40,height:2,background:done?"#27ae60":"#ddd",margin:"0 4px",marginBottom:20,borderRadius:1}}/>}
        </div>
      )})}
    </div>
  );
}

/* ═══ Step 1: Industry ═══ */
function Step1({industries,industry,setIndustry,onNext,onOpenMaster}){
  return(
    <div style={{background:cardBg,borderRadius:14,padding:"28px 24px",border:`1px solid ${bdr}`,maxWidth:700,margin:"0 auto"}}>
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{fontSize:40,marginBottom:8}}>🏢</div>
        <h2 style={{margin:0,fontSize:20,color:accent,fontWeight:800}}>ステップ１：業種を選んでください</h2>
        <p style={{margin:"8px 0 0",fontSize:13,color:"#888"}}>お客様の業種に合った勘定科目で、AIが仕訳を判定します</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:20}}>
        {Object.entries(industries).map(([k,p])=>(
          <button key={k} onClick={()=>setIndustry(k)} style={{padding:"16px 10px",borderRadius:10,cursor:"pointer",fontFamily:font,border:industry===k?`3px solid ${accentLight}`:`1px solid ${bdr}`,background:industry===k?"#eaf2f8":"#fff",textAlign:"center",transition:"all 0.15s"}}>
            <div style={{fontSize:28,marginBottom:4}}>{p.icon}</div>
            <div style={{fontSize:12,fontWeight:industry===k?800:500,color:industry===k?accent:"#555"}}>{p.label}</div>
          </button>
        ))}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <button onClick={onOpenMaster} style={{padding:"8px 16px",borderRadius:7,border:`1px solid ${bdr}`,background:"#fff",color:"#888",fontSize:12,cursor:"pointer",fontFamily:font}}>⚙️ 科目マスタ管理</button>
        <button onClick={onNext} style={{padding:"12px 36px",borderRadius:8,border:"none",background:accentLight,color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:font,boxShadow:"0 2px 8px rgba(41,128,185,0.3)"}}>次へ進む →</button>
      </div>
    </div>
  );
}

/* ═══ Step 2: Upload ═══ */
function Step2Upload({onImageSelected,onTextMode,onBack,limitReached,usageInfo}){
  const fileRef=useRef(null);const cameraRef=useRef(null);const[dragOver,setDragOver]=useState(false);
  const handleFile=f=>{if(limitReached||!f)return;const r=new FileReader();r.onload=ev=>onImageSelected(ev.target.result,f.type);r.readAsDataURL(f);};
  const blocked={opacity:limitReached?0.45:1,pointerEvents:limitReached?"none":"auto",cursor:limitReached?"not-allowed":"pointer"};
  return(
    <div style={{maxWidth:700,margin:"0 auto"}}>
      <UsageProgress usageInfo={usageInfo}/>
      <div style={{background:cardBg,borderRadius:14,padding:"28px 24px",border:`1px solid ${bdr}`,marginBottom:16,...blocked}}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:40,marginBottom:8}}>📷</div>
          <h2 style={{margin:0,fontSize:20,color:accent,fontWeight:800}}>ステップ２：領収書を取り込む</h2>
          <p style={{margin:"8px 0 0",fontSize:13,color:"#888"}}>以下のいずれかの方法で、領収書の画像を取り込んでください</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:20}}>
          <div onClick={()=>cameraRef.current?.click()} style={{background:"#fff7ed",borderRadius:12,padding:"20px 12px",textAlign:"center",cursor:"pointer",border:"2px solid #f0d9b5"}}>
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={e=>handleFile(e.target.files?.[0])} style={{display:"none"}}/>
            <div style={{fontSize:40,marginBottom:8}}>📱</div>
            <div style={{fontSize:14,fontWeight:700,color:"#b45309",marginBottom:4}}>スマホで撮影</div>
            <div style={{fontSize:11,color:"#92714a",lineHeight:1.5}}>カメラが起動します<br/>領収書をパシャッと撮るだけ！</div>
          </div>
          <div onClick={()=>fileRef.current?.click()} style={{background:"#eff6ff",borderRadius:12,padding:"20px 12px",textAlign:"center",cursor:"pointer",border:"2px solid #93c5fd"}}>
            <input ref={fileRef} type="file" accept="image/*,.pdf" onChange={e=>handleFile(e.target.files?.[0])} style={{display:"none"}}/>
            <div style={{fontSize:40,marginBottom:8}}>📁</div>
            <div style={{fontSize:14,fontWeight:700,color:"#1d4ed8",marginBottom:4}}>ファイルを選ぶ</div>
            <div style={{fontSize:11,color:"#4a6fa5",lineHeight:1.5}}>保存済みの画像を選択<br/>スキャンしたPDFもOK</div>
          </div>
          <div onClick={onTextMode} style={{background:"#f0fdf4",borderRadius:12,padding:"20px 12px",textAlign:"center",cursor:"pointer",border:"2px solid #86efac"}}>
            <div style={{fontSize:40,marginBottom:8}}>✏️</div>
            <div style={{fontSize:14,fontWeight:700,color:"#166534",marginBottom:4}}>手入力する</div>
            <div style={{fontSize:11,color:"#4a7a5a",lineHeight:1.5}}>領収書の内容を<br/>文字で入力する</div>
          </div>
        </div>
        <div onDragOver={e=>{e.preventDefault();setDragOver(true);}} onDragLeave={()=>setDragOver(false)} onDrop={e=>{e.preventDefault();setDragOver(false);handleFile(e.dataTransfer.files?.[0]);}} onClick={()=>fileRef.current?.click()}
          style={{border:`2px dashed ${dragOver?accentLight:"#ccc"}`,borderRadius:10,padding:20,textAlign:"center",cursor:"pointer",background:dragOver?"#eaf2f8":"#fafafa"}}>
          <div style={{fontSize:11,color:"#999"}}>💡 パソコンの方は、ここに画像を<strong>ドラッグ＆ドロップ</strong>しても取り込めます</div>
        </div>
        <button onClick={onBack} style={{marginTop:16,padding:"8px 20px",borderRadius:7,border:`1px solid ${bdr}`,background:"#fff",color:"#888",fontSize:12,cursor:"pointer",fontFamily:font}}>← 戻る</button>
      </div>
      <div style={{background:"#fffbeb",borderRadius:12,padding:"16px 20px",border:"1px solid #fde68a"}}>
        <h4 style={{margin:"0 0 10px",fontSize:13,color:"#92400e",fontWeight:700}}>📌 きれいに読み取るコツ</h4>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,fontSize:12,color:"#78350f"}}>
          <div style={{display:"flex",gap:8}}><span style={{fontSize:18}}>💡</span><div><strong>明るい場所で撮影</strong><br/>影ができないように</div></div>
          <div style={{display:"flex",gap:8}}><span style={{fontSize:18}}>📐</span><div><strong>まっすぐ全体が入るように</strong><br/>斜めだと読みにくい</div></div>
          <div style={{display:"flex",gap:8}}><span style={{fontSize:18}}>🔍</span><div><strong>ピントを合わせて</strong><br/>金額・日付がはっきり読めるか確認</div></div>
          <div style={{display:"flex",gap:8}}><span style={{fontSize:18}}>📄</span><div><strong>しわは伸ばしてから</strong><br/>平らにして撮影</div></div>
        </div>
      </div>
    </div>
  );
}

/* ═══ Step 2b: Text ═══ */
function Step2Text({onSubmit,onBack,limitReached,usageInfo}){
  const[text,setText]=useState("");
  return(
    <div style={{background:cardBg,borderRadius:14,padding:"28px 24px",border:`1px solid ${bdr}`,maxWidth:700,margin:"0 auto"}}>
      <UsageProgress usageInfo={usageInfo}/>
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{fontSize:40,marginBottom:8}}>✏️</div>
        <h2 style={{margin:0,fontSize:20,color:accent,fontWeight:800}}>領収書の内容を入力してください</h2>
        <p style={{margin:"8px 0 0",fontSize:13,color:"#888"}}>日付・金額・お店の名前・何を買ったかを書いてください</p>
      </div>
      <div style={{background:"#f9fafb",borderRadius:10,padding:16,marginBottom:16,border:`1px solid ${bdr}`}}>
        <div style={{fontSize:12,color:"#666",marginBottom:8,fontWeight:600}}>📝 入力例：</div>
        <div style={{fontSize:12,color:"#999",lineHeight:1.8,fontFamily:"monospace",whiteSpace:"pre-line"}}>{`5月19日 ヤマダ電機 USBケーブル 1,980円\n5月18日 タクシー代 東京駅→品川 2,340円\n5月17日 Amazon AWS利用料 54,780円`}</div>
      </div>
      <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="ここに入力してください..."
        style={{width:"100%",minHeight:140,borderRadius:10,border:`2px solid ${bdr}`,padding:14,fontSize:14,fontFamily:font,resize:"vertical",boxSizing:"border-box",lineHeight:1.8}}/>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:16}}>
        <button onClick={onBack} style={{padding:"10px 20px",borderRadius:7,border:`1px solid ${bdr}`,background:"#fff",color:"#888",fontSize:13,cursor:"pointer",fontFamily:font}}>← 戻る</button>
        <button onClick={()=>{if(text.trim()&&!limitReached)onSubmit(text);}} disabled={!text.trim()||limitReached}
          style={{padding:"12px 36px",borderRadius:8,border:"none",background:text.trim()&&!limitReached?accentLight:"#ccc",color:"#fff",fontSize:15,fontWeight:700,cursor:text.trim()&&!limitReached?"pointer":"default",fontFamily:font}}>🤖 AIで仕訳を作成 →</button>
      </div>
    </div>
  );
}

/* ═══ Step 2c: Confirm Image ═══ */
function Step2Confirm({imageData,onConfirm,onRetake,limitReached,usageInfo}){
  return(
    <div style={{background:cardBg,borderRadius:14,padding:"28px 24px",border:`1px solid ${bdr}`,maxWidth:700,margin:"0 auto"}}>
      <UsageProgress usageInfo={usageInfo}/>
      <div style={{textAlign:"center",marginBottom:16}}>
        <h2 style={{margin:0,fontSize:20,color:accent,fontWeight:800}}>この画像でよろしいですか？</h2>
        <p style={{margin:"8px 0 0",fontSize:13,color:"#888"}}>金額や日付がはっきり読めるか確認してください</p>
      </div>
      <div style={{textAlign:"center",marginBottom:20,background:"#f5f5f5",borderRadius:10,padding:12}}>
        <img src={imageData} alt="プレビュー" style={{maxWidth:"100%",maxHeight:350,borderRadius:8,boxShadow:"0 2px 12px rgba(0,0,0,0.1)"}}/>
      </div>
      <div style={{background:"#eff6ff",borderRadius:8,padding:12,marginBottom:16,fontSize:12,color:"#1d4ed8"}}>✅ <strong>日付</strong>・<strong>金額</strong>・<strong>店名</strong> が読めていますか？</div>
      <div style={{display:"flex",justifyContent:"space-between"}}>
        <button onClick={onRetake} style={{padding:"10px 20px",borderRadius:7,border:`1px solid ${bdr}`,background:"#fff",color:"#888",fontSize:13,cursor:"pointer",fontFamily:font}}>📷 撮り直す</button>
        <button onClick={onConfirm} disabled={limitReached} style={{padding:"12px 36px",borderRadius:8,border:"none",background:limitReached?"#ccc":accentLight,color:"#fff",fontSize:15,fontWeight:700,cursor:limitReached?"default":"pointer",fontFamily:font}}>🤖 AIで仕訳を作成 →</button>
      </div>
    </div>
  );
}

/* ═══ Step 3: Processing ═══ */
function Step3({industryLabel}){
  return(
    <div style={{background:cardBg,borderRadius:14,padding:"48px 24px",border:`1px solid ${bdr}`,maxWidth:700,margin:"0 auto",textAlign:"center"}}>
      <div style={{fontSize:56,marginBottom:16,animation:"pulse 1.5s ease-in-out infinite"}}>🤖</div>
      <h2 style={{margin:"0 0 12px",fontSize:20,color:accent}}>AIが仕訳を作成中です...</h2>
      <p style={{fontSize:13,color:"#888",marginBottom:20}}>「{industryLabel}」の勘定科目で判定中。少々お待ちください</p>
      <div style={{display:"flex",justifyContent:"center",gap:8}}>
        {[0,1,2].map(i=><div key={i} style={{width:12,height:12,borderRadius:"50%",background:accentLight,animation:`bounce 1.2s ease-in-out ${i*0.2}s infinite`}}/>)}
      </div>
      <style>{`@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}@keyframes bounce{0%,100%{opacity:.3;transform:translateY(0)}50%{opacity:1;transform:translateY(-8px)}}`}</style>
    </div>
  );
}

/* ═══ Step 4: Results ═══ */
function Step4({entries,allAccounts,editingId,onEdit,onUpdate,onRemove,onExport,onAddMore,onReset,limitReached}){
  const total=entries.reduce((s,e)=>s+(Number(e.amount)||0),0);
  const Conf=({level})=>{const m={high:{bg:"#e8f5e9",c:"#2e7d32",l:"高"},medium:{bg:"#fff8e1",c:"#f57f17",l:"中"},low:{bg:"#fce4ec",c:"#c62828",l:"低"}};const s=m[level]||m.low;return<span style={{background:s.bg,color:s.c,padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>確度:{s.l}</span>;};
  return(
    <div style={{maxWidth:960,margin:"0 auto"}}>
      <div style={{background:cardBg,borderRadius:14,border:`1px solid ${bdr}`,overflow:"hidden",marginBottom:16}}>
        <div style={{background:"#e8f5e9",padding:"16px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
          <div><h2 style={{margin:0,fontSize:18,color:"#1b5e20",fontWeight:800}}>✅ 仕訳が完成しました！</h2><p style={{margin:"4px 0 0",fontSize:12,color:"#388e3c"}}>{entries.length}件｜合計 ¥{total.toLocaleString()}</p></div>
          <button onClick={onExport} style={{padding:"8px 16px",borderRadius:7,border:"none",background:"#27ae60",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:font}}>{isMobileDevice()?"📥 CSV保存・共有":"📥 CSV保存"}</button>
        </div>
        <div style={{padding:"10px 24px",background:"#fffbeb",fontSize:12,color:"#92400e",borderBottom:`1px solid ${bdr}`}}>💡 確度「中」「低」は要確認。✏️で修正できます。</div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead><tr style={{background:"#f5f7fa",fontSize:11,color:"#555"}}>
              <th style={{padding:"9px 10px",textAlign:"left"}}>日付</th><th style={{padding:"9px 10px",textAlign:"left"}}>借方</th><th style={{padding:"9px 10px",textAlign:"left"}}>貸方</th><th style={{padding:"9px 10px",textAlign:"right"}}>金額</th><th style={{padding:"9px 10px"}}>税区分</th><th style={{padding:"9px 10px"}}>取引先</th><th style={{padding:"9px 10px"}}>摘要</th><th style={{padding:"9px 10px"}}>確度</th><th style={{padding:"9px 6px",width:50}}></th>
            </tr></thead>
            <tbody>{entries.map(en=>(
              <tr key={en.id} style={{borderBottom:"1px solid #f0f2f5",background:en.confidence==="low"?"#fff5f5":en.confidence==="medium"?"#fffdf5":"#fff"}}>
                <td style={{padding:"8px 10px",whiteSpace:"nowrap"}}>{editingId===en.id?<input type="date" value={en.date} onChange={e=>onUpdate(en.id,"date",e.target.value)} style={{width:110,fontSize:11,fontFamily:font}}/>:en.date}</td>
                <td style={{padding:"8px 10px"}}>{editingId===en.id?<select value={en.debit_account} onChange={e=>onUpdate(en.id,"debit_account",e.target.value)} style={{fontSize:11,fontFamily:font,maxWidth:120}}>{allAccounts.map((a,i)=><option key={i} value={a.name}>{a.name}</option>)}</select>:<span style={{fontWeight:600}}>{en.debit_account}</span>}</td>
                <td style={{padding:"8px 10px"}}>{editingId===en.id?<select value={en.credit_account} onChange={e=>onUpdate(en.id,"credit_account",e.target.value)} style={{fontSize:11,fontFamily:font,maxWidth:120}}>{allAccounts.map((a,i)=><option key={i} value={a.name}>{a.name}</option>)}</select>:en.credit_account}</td>
                <td style={{padding:"8px 10px",textAlign:"right",fontWeight:600,fontVariantNumeric:"tabular-nums"}}>¥{Number(en.amount||0).toLocaleString()}</td>
                <td style={{padding:"8px 10px",fontSize:11}}>{en.tax_rate}</td>
                <td style={{padding:"8px 10px",fontSize:11}}>{en.vendor}</td>
                <td style={{padding:"8px 10px",fontSize:11,maxWidth:140,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} title={en.description}>{en.description}</td>
                <td style={{padding:"8px 10px"}}><Conf level={en.confidence}/></td>
                <td style={{padding:"8px 6px"}}>
                  <button onClick={()=>onEdit(en.id)} style={{background:"none",border:"none",cursor:"pointer",fontSize:14,padding:1}}>{editingId===en.id?"✅":"✏️"}</button>
                  <button onClick={()=>onRemove(en.id)} style={{background:"none",border:"none",cursor:"pointer",fontSize:14,padding:1}}>🗑️</button>
                </td>
              </tr>
            ))}</tbody>
            <tfoot><tr style={{background:"#f0f4f8",fontWeight:700}}><td colSpan={3} style={{padding:10,textAlign:"right"}}>合計</td><td style={{padding:10,textAlign:"right",fontVariantNumeric:"tabular-nums",color:accent,fontSize:14}}>¥{total.toLocaleString()}</td><td colSpan={5}/></tr></tfoot>
          </table>
        </div>
        {entries.some(e=>e.reasoning)&&(
          <div style={{padding:"10px 24px 14px",borderTop:`1px solid ${bdr}`}}>
            <details><summary style={{fontSize:11,color:"#888",cursor:"pointer",fontWeight:600}}>💡 AI判定理由</summary><div style={{marginTop:6}}>{entries.filter(e=>e.reasoning).map(e=><div key={e.id} style={{fontSize:11,color:"#666",padding:"3px 0",borderBottom:"1px solid #f0f0f0"}}><strong>{e.debit_account}</strong>：{e.reasoning}</div>)}</div></details>
          </div>
        )}
      </div>
      <div style={{display:"flex",justifyContent:"center",gap:12}}>
        <button onClick={onAddMore} disabled={limitReached} style={{padding:"12px 28px",borderRadius:8,border:`2px solid ${limitReached?"#ccc":accentLight}`,background:"#fff",color:limitReached?"#ccc":accentLight,fontSize:14,fontWeight:700,cursor:limitReached?"default":"pointer",fontFamily:font}}>📷 次の領収書を取り込む</button>
        <button onClick={onReset} style={{padding:"12px 28px",borderRadius:8,border:`1px solid ${bdr}`,background:"#fff",color:"#888",fontSize:14,cursor:"pointer",fontFamily:font}}>🔄 最初からやり直す</button>
      </div>
    </div>
  );
}

/* ═══ Master Panel (compact) ═══ */
function MasterPanel({industries,setIndustries,onClose}){
  const[selInd,setSelInd]=useState("general");const[editRow,setEditRow]=useState(null);const[addMode,setAddMode]=useState(false);const[newAcct,setNewAcct]=useState({code:"",name:"",category:"expenses"});
  const cur=industries[selInd];const filtered=cur?.accounts||[];
  const inp={padding:6,fontSize:12,borderRadius:4,border:`1px solid ${bdr}`,fontFamily:font,boxSizing:"border-box",width:"100%"};
  const addAccount=()=>{if(!newAcct.code.trim()||!newAcct.name.trim())return;const u=deepClone(industries);u[selInd].accounts.push({...newAcct});setIndustries(u);setNewAcct({code:"",name:"",category:"expenses"});setAddMode(false);};
  const delAccount=i=>{const u=deepClone(industries);u[selInd].accounts.splice(i,1);setIndustries(u);};
  const saveEdit=(i,ed)=>{const u=deepClone(industries);u[selInd].accounts[i]=ed;setIndustries(u);setEditRow(null);};
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:1000,display:"flex",justifyContent:"center",alignItems:"center",padding:16}}>
      <div style={{background:bg,borderRadius:16,width:"100%",maxWidth:800,maxHeight:"85vh",overflow:"hidden",display:"flex",flexDirection:"column",boxShadow:"0 24px 80px rgba(0,0,0,0.25)"}}>
        <div style={{background:`linear-gradient(135deg,${accent},#2c3e50)`,padding:"16px 24px",color:"#fff",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <h2 style={{margin:0,fontSize:16,fontWeight:800}}>⚙️ 勘定科目マスタ管理</h2>
          <button onClick={onClose} style={{padding:"4px 12px",borderRadius:6,border:"1px solid rgba(255,255,255,0.4)",background:"transparent",color:"#fff",fontSize:15,cursor:"pointer",fontFamily:font,fontWeight:700}}>✕</button>
        </div>
        <div style={{display:"flex",flex:1,overflow:"hidden"}}>
          <div style={{width:180,borderRight:`1px solid ${bdr}`,background:"#fff",overflowY:"auto",flexShrink:0,padding:"8px 0"}}>
            {Object.entries(industries).map(([k,ind])=><div key={k} onClick={()=>{setSelInd(k);setEditRow(null);setAddMode(false);}} style={{padding:"8px 12px",cursor:"pointer",background:selInd===k?"#eaf2f8":"transparent",borderLeft:selInd===k?`3px solid ${accentLight}`:"3px solid transparent",fontSize:12,fontWeight:selInd===k?700:400,color:selInd===k?accent:"#444"}}>{ind.icon} {ind.label}</div>)}
          </div>
          <div style={{flex:1,overflowY:"auto",padding:16}}>
            <h3 style={{margin:"0 0 10px",fontSize:14,color:accent}}>{cur?.icon} {cur?.label}</h3>
            <div style={{background:"#fff",borderRadius:8,border:`1px solid ${bdr}`,overflow:"hidden"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr style={{background:"#f5f7fa",fontSize:11,color:"#777"}}><th style={{padding:"8px 10px",textAlign:"left",width:70}}>コード</th><th style={{padding:"8px 10px",textAlign:"left"}}>科目名</th><th style={{padding:"8px 10px",textAlign:"left",width:60}}>区分</th><th style={{padding:"8px 10px",width:70}}></th></tr></thead>
              <tbody>
                {filtered.map((a,i)=>editRow===i?(
                  <EditRowC key={i} acct={a} onSave={ed=>saveEdit(i,ed)} onCancel={()=>setEditRow(null)}/>
                ):(
                  <tr key={i} style={{borderBottom:"1px solid #f0f2f5"}}><td style={{padding:"7px 10px",fontFamily:"monospace",fontSize:11,color:"#666"}}>{a.code}</td><td style={{padding:"7px 10px",fontWeight:500}}>{a.name}</td><td style={{padding:"7px 10px"}}><span style={{background:CATEGORY_LABELS[a.category]?.color+"18",color:CATEGORY_LABELS[a.category]?.color,padding:"1px 8px",borderRadius:20,fontSize:10,fontWeight:600}}>{CATEGORY_LABELS[a.category]?.label}</span></td><td style={{padding:"7px 10px",textAlign:"center"}}><button onClick={()=>{setEditRow(i);setAddMode(false);}} style={{background:"none",border:"none",cursor:"pointer",fontSize:12}}>✏️</button><button onClick={()=>delAccount(i)} style={{background:"none",border:"none",cursor:"pointer",fontSize:12}}>🗑️</button></td></tr>
                ))}
                {addMode&&<tr style={{background:"#f8fffe"}}><td style={{padding:"7px 10px"}}><input value={newAcct.code} onChange={e=>setNewAcct({...newAcct,code:e.target.value})} placeholder="コード" style={{...inp,fontFamily:"monospace"}}/></td><td style={{padding:"7px 10px"}}><input value={newAcct.name} onChange={e=>setNewAcct({...newAcct,name:e.target.value})} placeholder="科目名" style={inp}/></td><td style={{padding:"7px 10px"}}><select value={newAcct.category} onChange={e=>setNewAcct({...newAcct,category:e.target.value})} style={{...inp,width:"auto"}}>{Object.entries(CATEGORY_LABELS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select></td><td style={{padding:"7px 10px",textAlign:"center"}}><button onClick={addAccount} style={{background:"none",border:"none",cursor:"pointer",fontSize:12}}>✅</button><button onClick={()=>setAddMode(false)} style={{background:"none",border:"none",cursor:"pointer",fontSize:12}}>❌</button></td></tr>}
              </tbody></table>
              {!addMode&&<div style={{padding:8,borderTop:"1px solid #f0f2f5"}}><button onClick={()=>{setAddMode(true);setEditRow(null);}} style={{width:"100%",padding:"8px 0",borderRadius:6,border:`1px dashed ${accentLight}`,background:"transparent",color:accentLight,fontSize:11,cursor:"pointer",fontFamily:font,fontWeight:600}}>＋ 科目を追加</button></div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function EditRowC({acct,onSave,onCancel}){const[ed,setEd]=useState({...acct});const inp={padding:6,fontSize:12,borderRadius:4,border:`1px solid ${bdr}`,fontFamily:font,boxSizing:"border-box",width:"100%"};return(<tr style={{background:"#fffef5",borderBottom:"1px solid #f0f2f5"}}><td style={{padding:"7px 10px"}}><input value={ed.code} onChange={e=>setEd({...ed,code:e.target.value})} style={{...inp,fontFamily:"monospace"}}/></td><td style={{padding:"7px 10px"}}><input value={ed.name} onChange={e=>setEd({...ed,name:e.target.value})} style={inp}/></td><td style={{padding:"7px 10px"}}><select value={ed.category} onChange={e=>setEd({...ed,category:e.target.value})} style={{...inp,width:"auto"}}>{Object.entries(CATEGORY_LABELS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select></td><td style={{padding:"7px 10px",textAlign:"center"}}><button onClick={()=>onSave(ed)} style={{background:"none",border:"none",cursor:"pointer",fontSize:12}}>✅</button><button onClick={onCancel} style={{background:"none",border:"none",cursor:"pointer",fontSize:12}}>❌</button></td></tr>);}

/* ═══ Main App ═══ */
export default function App(){
  const[session,setSession]=useState(()=>loadSession());
  const[usageData,setUsageData]=useState(null);
  const[showAdmin,setShowAdmin]=useState(false);
  const[industries,setIndustries]=useState(deepClone(DEFAULT_INDUSTRIES));
  const[industry,setIndustry]=useState("general");
  const[step,setStep]=useState(1);
  const[subMode,setSubMode]=useState(null);
  const[imageData,setImageData]=useState(null);
  const[imageType,setImageType]=useState(null);
  const[entries,setEntries]=useState([]);
  const[editingId,setEditingId]=useState(null);
  const[error,setError]=useState(null);
  const[showMaster,setShowMaster]=useState(false);
  const[csvModal,setCsvModal]=useState(null);

  const user=session?.user;
  const usageInfo=usageFromApi(usageData,user);

  const refreshUsage=useCallback(async tok=>{
    if(!tok)return;
    const u=await fetchUsage(tok);
    if(u)setUsageData(u);
  },[]);

  const handleLogin=s=>{
    setSession(s);
    setIndustry(s.user?.industry||"general");
    refreshUsage(s.token);
  };

  const handleLogout=()=>{
    clearSession();
    setSession(null);
    setUsageData(null);
    setStep(1);
    setEntries([]);
    setSubMode(null);
    setImageData(null);
    setShowAdmin(false);
  };

  useEffect(()=>{
    if(session?.token)refreshUsage(session.token);
  },[session?.token,refreshUsage]);

  useEffect(()=>{
    if(session?.user?.industry)setIndustry(session.user.industry);
  },[session?.user?.industry]);

  useEffect(()=>{
    if(session)return;
    (async()=>{
      const res=await fetch("/api/auth",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({company:"",password:""})});
      const data=await res.json();
      if(data.success&&data.legacy)handleLogin({token:data.token,user:data.user});
    })();
  },[]);

  const getMerged=k=>{const base=industries.general?.accounts||[];if(k==="general")return base;return[...(industries[k]?.accounts||[]),...base];};

  const buildPrompt=()=>{
    const accts=getMerged(industry);const prof=industries[industry];
    const list=accts.map(a=>`${a.code}:${a.name}(${CATEGORY_LABELS[a.category]?.label})`).join("\n");
    return`あなたは日本の経理・簿記の専門家です。業種:${prof?.label||"汎用"}\n以下の勘定科目一覧から最適なものを選び仕訳を生成。\n【勘定科目一覧】\n${list}\n【ルール】1.日付・金額・取引先・摘要を正確に読取 2.借方・貸方を上記から選択 3.消費税区分判定 4.インボイス番号抽出 5.複合仕訳対応 6.日付不明なら${new Date().toISOString().slice(0,10)}\n必ず以下JSON形式のみで回答：\n{"entries":[{"date":"YYYY-MM-DD","debit_account":"科目名","debit_code":"コード","credit_account":"科目名","credit_code":"コード","amount":数値,"tax_rate":"10%"or"8%"or"非課税"or"不課税","tax_amount":数値,"vendor":"取引先","description":"摘要","invoice_number":"T番号ornull","confidence":"high"or"medium"or"low","reasoning":"理由"}]}`;
  };

  // ★ サーバー経由でAPI呼出し（APIキーはサーバー側で管理）
  const callAPI=async content=>{
    if(usageInfo.reached){
      setError(LIMIT_MSG_DETAIL);
      setStep(2);
      setSubMode(null);
      return;
    }
    setStep(3);setError(null);
    try{
      const body={system:buildPrompt(),messages:[{role:'user',content}]};
      if(session?.token)body.token=session.token;
      const res=await fetch('/api/chat',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(body),
      });
      const data=await res.json().catch(()=>({}));
      if(!res.ok){
        if(data.usage)setUsageData(data.usage);
        if(res.status===401){handleLogout();throw new Error(data.error||"再ログインしてください");}
        throw new Error(data.error||`Error ${res.status}`);
      }
      const text=data.content.filter(b=>b.type==='text').map(b=>b.text).join('');
      const parsed=JSON.parse(text.replace(/```json|```/g,'').trim());
      if(parsed.entries?.length)setEntries(prev=>[...prev,...parsed.entries.map((e,i)=>({...e,id:Date.now()+i}))]);
      if(data.usage)setUsageData(data.usage);
      else if(session?.token)await refreshUsage(session.token);
      setStep(4);
    }catch(err){setError(err.message);setStep(2);setSubMode(null);}
  };

  const handleImageSelected=(dataUrl,type)=>{setImageData(dataUrl);setImageType(type);setSubMode("confirm");};
  const handleImageConfirm=async()=>{const b64=imageData.split(",")[1];await callAPI([{type:"image",source:{type:"base64",media_type:imageType||"image/jpeg",data:b64}},{type:"text",text:"この領収書/レシートの内容を読み取り仕訳を生成してください。"}]);};
  const handleTextSubmit=async text=>{await callAPI([{type:"text",text:`以下の取引内容から仕訳を生成：\n${text}`}]);};

  const exportCSV=()=>{
    const filename=`仕訳帳_${new Date().toISOString().slice(0,10)}.csv`;
    shareOrSaveCSV(buildCSV(entries),filename,setCsvModal);
  };

  if(!session)return<LoginScreen onLogin={handleLogin}/>;

  return(
    <div style={{fontFamily:font,background:bg,minHeight:"100vh",padding:"20px 14px"}}>
      {showMaster&&<MasterPanel industries={industries} setIndustries={setIndustries} onClose={()=>setShowMaster(false)}/>}
      {csvModal&&<CsvExportModal csvText={csvModal.csvText} filename={csvModal.filename} onClose={()=>setCsvModal(null)}/>}
      {showAdmin&&session?.token&&<AdminPanel token={session.token} onClose={()=>setShowAdmin(false)}/>}
      <div style={{maxWidth:960,margin:"0 auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12,marginBottom:20}}>
          <div>
            <h1 style={{margin:0,fontSize:22,color:accent,fontWeight:800}}>📒 AI自動仕訳システム</h1>
            <p style={{margin:"4px 0 0",fontSize:12,color:"#999"}}>領収書を取り込むだけで、AIが自動で仕訳帳を作成します</p>
          </div>
          <div style={{fontSize:12,color:"#555",textAlign:"right",lineHeight:1.8}}>
            <div><strong>{user?.company}</strong> 様｜{getPlanLabel(user?.plan)}</div>
            <div>残り <strong style={{color:usageInfo.reached?"#c62828":accent}}>{usageInfo.remaining}</strong> 枚</div>
            <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:4}}>
              {user?.isAdmin&&<button onClick={()=>setShowAdmin(true)} style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${bdr}`,background:"#fff",fontSize:11,cursor:"pointer",fontFamily:font}}>📊 管理画面</button>}
              <button onClick={handleLogout} style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${bdr}`,background:"#fff",fontSize:11,cursor:"pointer",fontFamily:font,color:"#888"}}>ログアウト</button>
            </div>
          </div>
        </div>
        <StepBar current={step}/>
        {error&&<div style={{background:"#fce4ec",borderRadius:10,padding:14,marginBottom:16,color:"#c62828",fontSize:13,textAlign:"center",maxWidth:700,margin:"0 auto 16px"}}>⚠️ {error}{!error.includes("使い切り")&&error!=="再ログイン"&&<><br/><span style={{fontSize:12}}>もう一度お試しください</span></>}</div>}
        {step===1&&<Step1 industries={industries} industry={industry} setIndustry={setIndustry} onNext={()=>{setStep(2);setSubMode(null);}} onOpenMaster={()=>setShowMaster(true)}/>}
        {step===2&&!subMode&&<Step2Upload onImageSelected={handleImageSelected} onTextMode={()=>setSubMode("text")} onBack={()=>setStep(1)} limitReached={usageInfo.reached} usageInfo={usageInfo}/>}
        {step===2&&subMode==="text"&&<Step2Text onSubmit={handleTextSubmit} onBack={()=>setSubMode(null)} limitReached={usageInfo.reached} usageInfo={usageInfo}/>}
        {step===2&&subMode==="confirm"&&<Step2Confirm imageData={imageData} onConfirm={handleImageConfirm} onRetake={()=>{setSubMode(null);setImageData(null);}} limitReached={usageInfo.reached} usageInfo={usageInfo}/>}
        {step===3&&<Step3 industryLabel={industries[industry]?.label||"汎用"}/>}
        {step===4&&<Step4 entries={entries} allAccounts={getMerged(industry)} editingId={editingId} onEdit={id=>setEditingId(editingId===id?null:id)} onUpdate={(id,f,v)=>setEntries(prev=>prev.map(e=>e.id===id?{...e,[f]:v}:e))} onRemove={id=>setEntries(prev=>prev.filter(e=>e.id!==id))} onExport={exportCSV} onAddMore={()=>{setStep(2);setSubMode(null);setImageData(null);}} onReset={()=>{setStep(1);setEntries([]);setImageData(null);setSubMode(null);}} limitReached={usageInfo.reached}/>}
        <div style={{marginTop:20,fontSize:9,color:"#ccc",textAlign:"center"}}>※ AI仕訳は推定結果です。最終確認は経理担当者が行ってください</div>
      </div>
    </div>
  );
}
