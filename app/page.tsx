'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

type View = 'home' | 'setup' | 'session' | 'reflect' | 'journal' | 'learn' | 'practitioner' | 'guide'
const positions = ['Crown','Eyes & temples','Throat','Heart','Upper abdomen','Lower abdomen','Hips','Knees','Feet']

export default function Home() {
  const supabase = useMemo(() => createClient(), [])
  const [view,setView]=useState<View>('home')
  const [duration,setDuration]=useState(20)
  const [intention,setIntention]=useState('grounding')
  const [remaining,setRemaining]=useState(20*60)
  const [running,setRunning]=useState(false)
  const [position,setPosition]=useState(0)
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [userEmail,setUserEmail]=useState<string|null>(null)
  const [journal,setJournal]=useState('')
  const [guideInput,setGuideInput]=useState('')
  const [guideReply,setGuideReply]=useState('Tell me what you need from today’s practice.')
  const [sessions,setSessions]=useState(0)

  useEffect(()=>{ supabase?.auth.getUser().then(({data})=>setUserEmail(data.user?.email??null)); const local=Number(localStorage.getItem('stillpointSessions')||0); setSessions(local) },[supabase])
  useEffect(()=>{ if(!running)return; const t=setInterval(()=>setRemaining(v=>v<=1?(setRunning(false),0):v-1),1000); return()=>clearInterval(t)},[running])
  useEffect(()=>{if(running&&remaining>0){const elapsed=duration*60-remaining; const each=(duration*60)/positions.length; setPosition(Math.min(positions.length-1,Math.floor(elapsed/each))) }},[remaining,running,duration])

  const time=`${String(Math.floor(remaining/60)).padStart(2,'0')}:${String(remaining%60).padStart(2,'0')}`
  async function auth(mode:'in'|'up'){if(!supabase)return alert('Supabase environment variables are not configured yet.'); const result=mode==='up'?await supabase.auth.signUp({email,password}):await supabase.auth.signInWithPassword({email,password}); if(result.error)return alert(result.error.message); setUserEmail(result.data.user?.email??email)}
  async function signOut(){await supabase?.auth.signOut();setUserEmail(null)}
  function start(){setRemaining(duration*60);setPosition(0);setRunning(true);setView('session')}
  async function complete(){setRunning(false);const next=sessions+1;setSessions(next);localStorage.setItem('stillpointSessions',String(next));if(supabase&&userEmail){await supabase.from('reiki_sessions').insert({duration_minutes:duration,intention,completed_at:new Date().toISOString()})}setView('reflect')}
  async function saveJournal(){localStorage.setItem('stillpointJournal',journal); if(supabase&&userEmail) await supabase.from('journal_entries').insert({body:journal}); setJournal('')}
  async function askGuide(){const r=await fetch('/api/reiki-guide',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:guideInput,duration})});const d=await r.json();setGuideReply(d.reply)}

  return <main className="shell">
    <header className="topbar"><div className="brand"><div className="mark">OCG</div><div><strong>Stillpoint Reiki</strong><br/><small>An OCG Labs wellness experience</small></div></div><div className="authbar">{userEmail?<><span className="muted">{userEmail}</span><button className="ghost" onClick={signOut}>Sign out</button></>:<button className="ghost" onClick={()=>document.getElementById('signin')?.scrollIntoView({behavior:'smooth'})}>Account</button>}</div></header>

    {view==='home'&&<>
      <section className="hero"><div><div className="eyebrow">A quiet place to return to</div><h1>Return to stillness.</h1><p>Move through a gentle Reiki practice with less noise, less pressure, and more room to notice what your body and mind are telling you.</p><div className="actions"><button className="primary" onClick={()=>setView('setup')}>Begin a guided practice</button><button className="secondary" onClick={()=>setView('guide')}>Ask the Reiki Guide</button></div></div><div className="orbwrap"><div className="orb" aria-hidden="true"/></div></section>
      <section className="grid"><button className="card" onClick={()=>setView('journal')}><strong>Reflect</strong><span className="muted">Journal after a practice or quiet moment.</span></button><button className="card" onClick={()=>setView('learn')}><strong>Learn</strong><span className="muted">Simple Reiki foundations and ethical practice.</span></button><button className="card" onClick={()=>setView('practitioner')}><strong>Practitioner</strong><span className="muted">Client and appointment workspace foundation.</span></button></section>
      <section className="section"><div className="panel"><div className="eyebrow">Your practice</div><div className="stat">{sessions} completed session{sessions===1?'':'s'}</div><p className="notice">Practice history is saved locally immediately and syncs to your private account when the production database schema is enabled.</p></div></section>
      {!userEmail&&<section id="signin" className="section"><div className="panel"><div className="eyebrow">Private account</div><h2>Carry your practice with you.</h2><p className="muted">Create an account to sync sessions and reflections securely across devices.</p><div className="authbox"><input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/><input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)}/><div className="actions"><button className="primary" onClick={()=>auth('up')}>Create account</button><button className="secondary" onClick={()=>auth('in')}>Sign in</button></div></div></div></section>}
    </>}

    {view==='setup'&&<section className="section"><button className="ghost" onClick={()=>setView('home')}>← Home</button><div className="panel" style={{marginTop:16}}><div className="eyebrow">Arrive</div><h2>What would feel supportive right now?</h2><div className="setup"><div className="field"><label>Time available</label><div className="durations">{[5,10,20,30,60].map(n=><button key={n} className={`chip ${duration===n?'active':''}`} onClick={()=>setDuration(n)}>{n} min</button>)}</div></div><div className="field"><label>Intention</label><select value={intention} onChange={e=>setIntention(e.target.value)}><option>grounding</option><option>rest</option><option>focus</option><option>sleep</option><option>ease</option><option>reflection</option></select></div></div><div className="actions" style={{marginTop:22}}><button className="primary" onClick={start}>Begin {duration}-minute practice</button></div></div></section>}

    {view==='session'&&<section className="section"><div className="session"><div className="panel breath"><div className="breathorb" aria-hidden="true"/></div><div className="panel"><div className="eyebrow">Guided practice · {intention}</div><div className="timer">{time}</div><div className="handpos">{positions[position]}</div><p className="muted">Place your hands comfortably. Let your breathing settle naturally. There is nothing you need to force or achieve.</p><div className="actions"><button className="primary" onClick={()=>setRunning(v=>!v)}>{running?'Pause':'Resume'}</button><button className="secondary" onClick={()=>setPosition(p=>Math.min(positions.length-1,p+1))}>Next position</button><button className="ghost" onClick={complete}>Complete practice</button></div></div></div></section>}

    {view==='reflect'&&<section className="section"><div className="panel"><div className="eyebrow">Notice</div><h2>What changed?</h2><p className="muted">No interpretation is required. Notice warmth, tension, calm, emotion, restlessness, or nothing at all.</p><textarea rows={6} value={journal} onChange={e=>setJournal(e.target.value)} placeholder="A few words about what you noticed…"/><div className="actions" style={{marginTop:12}}><button className="primary" onClick={async()=>{await saveJournal();setView('home')}}>Save reflection</button><button className="secondary" onClick={()=>setView('home')}>Finish without note</button></div></div></section>}

    {view==='journal'&&<section className="section"><button className="ghost" onClick={()=>setView('home')}>← Home</button><div className="panel" style={{marginTop:16}}><div className="eyebrow">Reflection</div><h2>Journal</h2><textarea rows={10} value={journal} onChange={e=>setJournal(e.target.value)} placeholder="Write without editing yourself…"/><div className="actions" style={{marginTop:12}}><button className="primary" onClick={saveJournal}>Save</button></div></div></section>}

    {view==='guide'&&<section className="section"><button className="ghost" onClick={()=>setView('home')}>← Home</button><div className="panel" style={{marginTop:16}}><div className="eyebrow">Personalized practice</div><h2>AI Reiki Guide</h2><p className="muted">Tell the guide what you want from the practice. It will keep recommendations inside wellness, reflection, and relaxation—not medical diagnosis or treatment.</p><div className="panel" style={{margin:'18px 0'}}>{guideReply}</div><textarea rows={5} value={guideInput} onChange={e=>setGuideInput(e.target.value)} placeholder="I feel scattered and want a short grounding practice before work…"/><div className="actions" style={{marginTop:12}}><button className="primary" onClick={askGuide}>Create recommendation</button><button className="secondary" onClick={()=>setView('setup')}>Use a guided session</button></div></div></section>}

    {view==='learn'&&<section className="section"><button className="ghost" onClick={()=>setView('home')}>← Home</button><div className="panel" style={{marginTop:16}}><div className="eyebrow">Foundations</div><h2>Reiki, without the clutter.</h2><div className="grid"><div className="card"><strong>Self-practice</strong><span className="muted">Choose a quiet place, set a simple intention, and move through comfortable hand positions.</span></div><div className="card"><strong>Principles</strong><span className="muted">Use the traditional principles as prompts for gratitude, kindness, integrity, and releasing worry or anger.</span></div><div className="card"><strong>Boundary</strong><span className="muted">Stillpoint supports personal wellness and reflection. It does not diagnose, treat, or replace professional care.</span></div></div></div></section>}

    {view==='practitioner'&&<section className="section"><button className="ghost" onClick={()=>setView('home')}>← Home</button><div className="panel" style={{marginTop:16}}><div className="eyebrow">Practitioner workspace</div><h2>Keep the person, not the paperwork, at the center.</h2><p className="muted">The secure client/appointment schema is prepared for Supabase. This screen stays intentionally limited until the project grants database administration access and the RLS policies are applied.</p><div className="grid"><div className="card"><strong>Clients</strong><span className="muted">Private practitioner-owned client records.</span></div><div className="card"><strong>Appointments</strong><span className="muted">In-person, distance, consultation, and follow-up sessions.</span></div><div className="card"><strong>Session notes</strong><span className="muted">Structured notes separated from the client’s personal journal.</span></div></div></div></section>}
    <footer className="footer">Stillpoint Reiki by OCG Labs · For wellness, relaxation, reflection, and spiritual practice. Not medical care.</footer>
  </main>
}
