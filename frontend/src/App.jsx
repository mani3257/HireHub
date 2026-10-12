import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, BriefcaseBusiness, Building2, CheckCircle2, ChevronDown, CircleUserRound, Clock3, FileText, Filter, LayoutDashboard, LogOut, MapPin, Plus, Search, ShieldCheck, Sparkles, Users, X } from 'lucide-react'
import api from './api'

const money = (n) => n == null ? '' : `₹${Number(n).toLocaleString('en-IN')}`
const typeLabel = (v) => ({ full_time: 'Full-time', part_time: 'Part-time', contract: 'Contract', internship: 'Internship' }[v] || v)
const statusLabel = (v) => ({ applied: 'Applied', shortlisted: 'Shortlisted', interview: 'Interview', selected: 'Selected', rejected: 'Rejected' }[v] || v)
const readUser = () => { try { return JSON.parse(localStorage.getItem('hirehub_user')) } catch { return null } }

function App() {
  const [user, setUser] = useState(readUser)
  const [toast, setToast] = useState('')
  const navigate = useNavigate()
  const notify = (message) => { setToast(message); window.setTimeout(() => setToast(''), 3500) }
  const logout = () => {
    localStorage.removeItem('hirehub_access'); localStorage.removeItem('hirehub_refresh'); localStorage.removeItem('hirehub_user')
    setUser(null); notify('You have been signed out.'); navigate('/')
  }
  const saveSession = async (tokens) => {
    localStorage.setItem('hirehub_access', tokens.access)
    localStorage.setItem('hirehub_refresh', tokens.refresh)
    const response = await api.get('/auth/me/')
    localStorage.setItem('hirehub_user', JSON.stringify(response.data)); setUser(response.data)
    return response.data
  }
  return <div className="app-shell">
    <header className="topbar">
      <Link className="brand" to="/"><span className="brand-mark"><BriefcaseBusiness size={20}/></span><span>hire<span className="brand-accent">hub</span><small>CAREERS, CONNECTED</small></span></Link>
      <nav className="desktop-nav">
        <NavLink to="/jobs">Find jobs</NavLink>
        {user && <NavLink to="/dashboard">Dashboard</NavLink>}
        {user?.role === 'recruiter' && <NavLink to="/jobs/new">Post a job</NavLink>}
      </nav>
      <div className="nav-actions">
        {user ? <><span className="user-pill"><span className="avatar">{user.username?.slice(0,1).toUpperCase()}</span><span>{user.username}<small>{user.role}</small></span></span><button className="icon-button" title="Sign out" onClick={logout}><LogOut size={17}/></button></> :
          <><Link className="button button-ghost button-small" to="/login">Log in</Link><Link className="button button-primary button-small" to="/register">Get started <ArrowRight size={15}/></Link></>}
      </div>
    </header>
    {toast && <div className="toast"><CheckCircle2 size={17}/>{toast}<button onClick={() => setToast('')}><X size={15}/></button></div>}
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/jobs" element={<Jobs user={user} notify={notify}/>}/>
      <Route path="/jobs/:id" element={<JobDetails user={user} notify={notify}/>}/>
      <Route path="/jobs/new" element={<JobForm user={user} notify={notify}/>}/>
      <Route path="/jobs/:id/edit" element={<JobForm user={user} notify={notify} edit/>}/>
      <Route path="/jobs/:id/applicants" element={<Applicants user={user} notify={notify}/>}/>
      <Route path="/login" element={<Auth mode="login" saveSession={saveSession} notify={notify}/>}/>
      <Route path="/register" element={<Auth mode="register" saveSession={saveSession} notify={notify}/>}/>
      <Route path="/dashboard" element={<Dashboard user={user} notify={notify}/>}/>
      <Route path="*" element={<NotFound/>}/>
    </Routes>
    <footer><Link className="brand footer-brand" to="/"><span className="brand-mark"><BriefcaseBusiness size={17}/></span><span>hire<span className="brand-accent">hub</span></span></Link><span>Make your next move count.</span><span>Built with Django + React</span></footer>
  </div>
}

function Home() {
  const [term, setTerm] = useState('')
  const [featured, setFeatured] = useState([])
  useEffect(() => { api.get('/jobs/?page_size=4').then(r => setFeatured((r.data.results || r.data).slice(0,4))).catch(() => {}) }, [])
  return <main>
    <section className="hero">
      <div className="hero-orb orb-one"/><div className="hero-orb orb-two"/>
      <div className="hero-content">
        <div className="eyebrow"><Sparkles size={14}/> YOUR NEXT CHAPTER STARTS HERE</div>
        <h1>Find work that<br/>moves you <span>forward.</span></h1>
        <p className="hero-copy">Meaningful opportunities. Teams worth joining. A career that feels like yours.</p>
        <form className="hero-search" onSubmit={e => { e.preventDefault(); window.location.href = `/jobs?search=${encodeURIComponent(term)}` }}>
          <Search size={20}/><input value={term} onChange={e => setTerm(e.target.value)} placeholder="Job title, skill, or company"/><button className="button button-primary">Explore jobs <ArrowRight size={16}/></button>
        </form>
        <div className="hero-proof"><span><CheckCircle2 size={15}/> Curated opportunities</span><span><ShieldCheck size={15}/> Candidate-first</span><span><Users size={15}/> Real teams, real roles</span></div>
      </div>
      <div className="hero-visual">
        <div className="visual-card card-main"><div className="visual-top"><span className="mini-logo"><Building2 size={18}/></span><span className="tag tag-green">Actively hiring</span></div><div className="visual-title">Your next opportunity</div><div className="visual-lines"><i/><i/><i/></div><div className="visual-bottom"><span className="avatar avatar-purple">H</span><span><b>Great teams</b><small>are looking for you</small></span><ArrowRight size={18}/></div></div>
        <div className="floating-note note-top"><span className="note-icon"><CheckCircle2 size={18}/></span><span><b>Application sent</b><small>You're on your way!</small></span></div>
        <div className="floating-note note-bottom"><span className="note-icon note-yellow"><Sparkles size={18}/></span><span><b>New possibilities</b><small>One search away</small></span></div>
        <div className="visual-dots">✳</div>
      </div>
    </section>
    <section className="stats-strip"><div><strong>Discover</strong><span>roles that fit your ambition</span></div><div><strong>Connect</strong><span>with teams building the future</span></div><div><strong>Grow</strong><span>one opportunity at a time</span></div></section>
    <section className="section featured-section">
      <div className="section-heading"><div><div className="eyebrow">A GOOD PLACE TO START</div><h2>Opportunities worth a look</h2><p>Explore a few roles that could be your next big step.</p></div><Link to="/jobs" className="text-link">View all jobs <ArrowRight size={16}/></Link></div>
      <div className="job-grid">{featured.length ? featured.map(j => <JobCard key={j.id} job={j}/>) : <div className="empty-state wide"><BriefcaseBusiness/><h3>Opportunities are on the way</h3><p>Start the backend and run the demo seed command to load sample roles.</p><Link className="button button-primary" to="/jobs">Browse jobs</Link></div>}</div>
    </section>
    <section className="cta-band"><div className="cta-icon"><BriefcaseBusiness size={24}/></div><div><h2>Ready to find your fit?</h2><p>Your next role might be closer than you think.</p></div><Link className="button button-light" to="/jobs">Explore opportunities <ArrowRight size={16}/></Link></section>
  </main>
}

function JobCard({ job }) {
  return <Link to={`/jobs/${job.id}`} className="job-card">
    <div className="job-card-top"><div className="company-logo">{job.company?.slice(0,1).toUpperCase()}</div><span className="tag">{typeLabel(job.employment_type)}</span></div>
    <h3>{job.title}</h3><div className="company-name">{job.company}</div>
    <div className="job-meta"><span><MapPin size={14}/>{job.location}</span><span><Clock3 size={14}/>{job.experience === 'entry' ? 'Entry level' : job.experience === 'mid' ? 'Mid level' : 'Senior level'}</span></div>
    <div className="job-card-bottom"><span className="salary">{job.salary_min ? `${money(job.salary_min)}${job.salary_max ? ` – ${money(job.salary_max)}` : '+'}` : 'Salary not listed'}</span><span className="round-arrow"><ArrowRight size={16}/></span></div>
  </Link>
}

function Jobs({ user, notify }) {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({search: new URLSearchParams(window.location.search).get('search') || '', location: '', employment_type: '', experience: ''})
  const [error, setError] = useState('')
  const load = () => {
    setLoading(true); setError('')
    const params = Object.fromEntries(Object.entries(filters).filter(([,v]) => v))
    api.get('/jobs/', {params}).then(r => setJobs(r.data.results || r.data)).catch(() => setError('Could not load jobs. Check that the Django backend is running on port 8003.')).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])
  return <main className="page-wrap">
    <div className="page-heading"><div className="eyebrow">THE NEXT STEP</div><h1>Find your <span>next role.</span></h1><p>Search openings from teams looking for people like you.</p></div>
    <form className="filter-bar" onSubmit={e => {e.preventDefault(); load()}}>
      <label className="search-field"><Search size={18}/><input placeholder="Role, company, keyword" value={filters.search} onChange={e => setFilters({...filters, search:e.target.value})}/></label>
      <label className="search-field"><MapPin size={17}/><input placeholder="Location" value={filters.location} onChange={e => setFilters({...filters, location:e.target.value})}/></label>
      <select value={filters.employment_type} onChange={e => setFilters({...filters, employment_type:e.target.value})}><option value="">All job types</option><option value="full_time">Full-time</option><option value="part_time">Part-time</option><option value="contract">Contract</option><option value="internship">Internship</option></select>
      <select value={filters.experience} onChange={e => setFilters({...filters, experience:e.target.value})}><option value="">All experience</option><option value="entry">Entry level</option><option value="mid">Mid level</option><option value="senior">Senior level</option></select>
      <button className="button button-primary"><Filter size={16}/> Search</button>
    </form>
    <div className="results-header"><span><b>{jobs.length}</b> opportunities shown</span>{user?.role === 'recruiter' && <Link className="button button-outline button-small" to="/jobs/new"><Plus size={16}/> Post a job</Link>}</div>
    {error && <div className="alert alert-error">{error}</div>}
    {loading ? <div className="loading-state">Finding your next opportunity…</div> : jobs.length ? <div className="job-grid">{jobs.map(j => <JobCard key={j.id} job={j}/>)}</div> : <div className="empty-state"><Search size={26}/><h3>No matching jobs yet</h3><p>Try a broader keyword or clear a filter to see more opportunities.</p><button className="button button-outline" onClick={() => {setFilters({search:'',location:'',employment_type:'',experience:''}); setTimeout(load,0)}}>Clear filters</button></div>}
  </main>
}

function JobDetails({ user, notify }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [alreadyApplied, setAlreadyApplied] = useState(false)
  const [cover, setCover] = useState('')
  const [resume, setResume] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    api.get(`/jobs/${id}/`).then(r => setJob(r.data)).catch(() => setError('This job could not be found.'))
    if (user?.role === 'candidate') api.get('/applications/mine/').then(r => {
      const items = r.data.results || r.data; setAlreadyApplied(items.some(a => String(a.job) === String(id)))
    }).catch(() => {})
  }, [id, user])
  const apply = async e => {
    e.preventDefault()
    if (!user) return navigate('/login')
    if (user.role !== 'candidate') return notify('Candidate accounts can apply to jobs.')
    const data = new FormData(); data.append('cover_letter', cover); if (resume) data.append('resume', resume)
    setBusy(true); setError('')
    try { await api.post(`/jobs/${id}/apply/`, data); setAlreadyApplied(true); notify('Application submitted successfully.') }
    catch (err) { setError(err.response?.data?.detail || JSON.stringify(err.response?.data || 'Application failed.')) }
    finally { setBusy(false) }
  }
  if (error && !job) return <main className="page-wrap"><div className="alert alert-error">{error}</div><Link to="/jobs" className="text-link">← Back to jobs</Link></main>
  if (!job) return <main className="page-wrap"><div className="loading-state">Loading job details…</div></main>
  const owner = user?.role === 'recruiter' && user.id === job.recruiter
  return <main className="page-wrap detail-layout">
    <div className="detail-main">
      <Link to="/jobs" className="back-link">← All opportunities</Link>
      <div className="detail-title-card"><div className="company-logo company-logo-large">{job.company?.slice(0,1).toUpperCase()}</div><div className="detail-title"><div className="eyebrow">{job.company}</div><h1>{job.title}</h1><div className="job-meta"><span><MapPin size={15}/>{job.location}</span><span><BriefcaseBusiness size={15}/>{typeLabel(job.employment_type)}</span><span><Clock3 size={15}/>{job.experience} level</span></div></div></div>
      <div className="content-card"><h2>About the role</h2><p className="long-copy">{job.description}</p><h2>What we're looking for</h2><p className="long-copy">{job.requirements || 'The team will discuss role requirements during the interview process.'}</p><div className="posted-line">Posted {new Date(job.created_at).toLocaleDateString()}</div></div>
    </div>
    <aside className="detail-sidebar">
      <div className="content-card apply-card"><div className="eyebrow">YOUR NEXT CHAPTER</div><h2>{job.salary_min ? `${money(job.salary_min)}${job.salary_max ? ` – ${money(job.salary_max)}` : '+'}` : 'Compensation discussed'}</h2><p className="muted">Annual compensation estimate</p><div className="sidebar-divider"/><div className="sidebar-info"><span>Employment</span><b>{typeLabel(job.employment_type)}</b></div><div className="sidebar-info"><span>Experience</span><b>{job.experience} level</b></div>
        {owner ? <><Link className="button button-primary button-full" to={`/jobs/${job.id}/edit`}>Edit job posting</Link><Link className="button button-outline button-full" to={`/jobs/${job.id}/applicants`}>View applicants ({job.application_count || 0})</Link></> :
          user?.role === 'recruiter' ? <p className="muted">Recruiter accounts can browse roles but cannot apply.</p> :
          alreadyApplied ? <div className="success-panel"><CheckCircle2 size={19}/><span><b>Application submitted</b><small>You can track progress from your dashboard.</small></span></div> :
          <form onSubmit={apply} className="apply-form"><label>Cover letter <span className="muted">(optional)</span><textarea rows="4" value={cover} onChange={e => setCover(e.target.value)} placeholder="Tell the team why you're interested…"/></label><label>Resume PDF <span className="muted">(optional, max 5 MB)</span><input type="file" accept="application/pdf,.pdf" onChange={e => setResume(e.target.files?.[0] || null)}/></label>{error && <div className="alert alert-error">{error}</div>}<button className="button button-primary button-full" disabled={busy}>{busy ? 'Submitting…' : user ? 'Apply for this role' : 'Log in to apply'} <ArrowRight size={16}/></button></form>}
      </div>
    </aside>
  </main>
}

function Auth({ mode, saveSession, notify }) {
  const register = mode === 'register'
  const [form, setForm] = useState({username:'',email:'',password:'',role:'candidate',company:'',headline:''})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const update = e => setForm({...form, [e.target.name]: e.target.value})
  const submit = async e => {
    e.preventDefault(); setBusy(true); setError('')
    try {
      if (register) await api.post('/auth/register/', form)
      const tokens = (await api.post('/auth/token/', {email:form.email,password:form.password})).data
      await saveSession(tokens); notify(register ? 'Welcome to HireHub!' : 'Welcome back!'); navigate('/dashboard')
    } catch (err) {
      const d = err.response?.data
      setError(d ? Object.entries(d).map(([k,v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : typeof v === 'object' ? JSON.stringify(v) : v}`).join(' · ') : 'Could not connect. Check the backend at port 8003.')
    } finally { setBusy(false) }
  }
  return <main className="auth-wrap"><div className="auth-art"><div className="auth-art-inner"><div className="eyebrow"><Sparkles size={14}/> MAKE YOUR NEXT MOVE</div><h2>Good work<br/>changes <span>everything.</span></h2><p>Find a role that fits your skills, your values, and where you want to go next.</p><div className="auth-art-stat"><div className="stat-bubble"><BriefcaseBusiness/></div><span><b>Your next chapter awaits</b><small>One profile. New possibilities.</small></span></div></div></div>
    <div className="auth-panel"><div className="auth-form-wrap"><div className="eyebrow">{register ? 'JOIN THE COMMUNITY' : 'WELCOME BACK'}</div><h1>{register ? 'Create your account' : 'Sign in to HireHub'}</h1><p>{register ? 'Set up your profile and start moving forward.' : 'Your next opportunity is waiting.'}</p>
      <form onSubmit={submit} className="stack-form">
        {register && <label>Username<input name="username" value={form.username} onChange={update} required minLength="3" placeholder="e.g. mani_reddy"/></label>}
        <label>Email address<input name="email" type="email" value={form.email} onChange={update} required placeholder="you@example.com"/></label>
        <label>Password<input name="password" type="password" value={form.password} onChange={update} required minLength="8" placeholder="At least 8 characters"/></label>
        {register && <><label>I am joining as<select name="role" value={form.role} onChange={update}><option value="candidate">Candidate — looking for a role</option><option value="recruiter">Recruiter — hiring talent</option></select></label>{form.role === 'recruiter' && <label>Company name<input name="company" value={form.company} onChange={update} required placeholder="Your company"/></label>}{form.role === 'candidate' && <label>Professional headline <span className="muted">(optional)</span><input name="headline" value={form.headline} onChange={update} placeholder="e.g. Junior Python Developer"/></label>}</>}
        {error && <div className="alert alert-error">{error}</div>}<button className="button button-primary button-full" disabled={busy}>{busy ? 'Please wait…' : register ? 'Create account' : 'Log in'} <ArrowRight size={16}/></button>
      </form>
      <div className="auth-switch">{register ? 'Already have an account?' : "Don't have an account?"} <Link to={register ? '/login' : '/register'}>{register ? 'Log in' : 'Create one'}</Link></div>
      <div className="demo-box"><b>Trying the demo?</b><small>Run <code>python manage.py seed_demo</code> in the backend first.</small><small>Recruiter: recruiter@hirehub.demo · Candidate: candidate@hirehub.demo</small><small>Password for both: HireHubDemo123!</small></div>
    </div></div>
  </main>
}

function Dashboard({ user, notify }) {
  const [stats, setStats] = useState(null)
  const [jobs, setJobs] = useState([])
  const [applications, setApplications] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const load = async () => {
    setLoading(true); setError('')
    try {
      const s = await api.get('/dashboard/'); setStats(s.data)
      if (user?.role === 'candidate') {
        const a = await api.get('/applications/mine/'); setApplications(a.data.results || a.data)
      } else {
        const j = await api.get('/jobs/'); const all = j.data.results || j.data; setJobs(all.filter(x => x.recruiter === user?.id))
      }
    } catch { setError('Please log in again to load your dashboard.') } finally { setLoading(false) }
  }
  useEffect(() => { if (user) load(); else setLoading(false) }, [user])
  if (!user) return <main className="page-wrap"><div className="empty-state"><CircleUserRound size={30}/><h2>Your dashboard is waiting</h2><p>Log in to see your applications and activity.</p><Link to="/login" className="button button-primary">Log in</Link></div></main>
  if (loading) return <main className="page-wrap"><div className="loading-state">Preparing your dashboard…</div></main>
  const metrics = user.role === 'recruiter' ? [
    ['Total jobs', stats?.total_jobs || 0, BriefcaseBusiness], ['Active listings', stats?.active_jobs || 0, CheckCircle2], ['Applications', stats?.total_applications || 0, Users], ['Interviews', stats?.interviews || 0, Clock3]
  ] : [
    ['Applications', stats?.applications || 0, FileText], ['Interviews', stats?.interviews || 0, Clock3], ['Selected', stats?.selected || 0, CheckCircle2], ['Not selected', stats?.rejected || 0, X]
  ]
  return <main className="page-wrap dashboard-wrap"><div className="dashboard-heading"><div><div className="eyebrow">YOUR HIREHUB SPACE</div><h1>Good to see you, <span>{user.username}.</span></h1><p>{user.role === 'recruiter' ? 'Manage your listings and find the right people.' : 'Keep track of your progress and next steps.'}</p></div>{user.role === 'recruiter' && <Link className="button button-primary" to="/jobs/new"><Plus size={17}/> Post a job</Link>}</div>
    {error && <div className="alert alert-error">{error}</div>}
    <div className="metric-grid">{metrics.map(([label,value,Icon]) => <div className="metric-card" key={label}><div className="metric-icon"><Icon size={19}/></div><span>{label}</span><strong>{value}</strong></div>)}</div>
    <section className="dashboard-section"><div className="section-heading compact"><div><h2>{user.role === 'recruiter' ? 'Your job listings' : 'Your applications'}</h2><p>{user.role === 'recruiter' ? 'Review activity on your open roles.' : 'Every application is a step forward.'}</p></div>{user.role === 'candidate' && <Link className="text-link" to="/jobs">Find more jobs <ArrowRight size={15}/></Link>}</div>
      {user.role === 'recruiter' ? jobs.length ? <div className="table-wrap"><table><thead><tr><th>Role</th><th>Location</th><th>Status</th><th>Applicants</th><th></th></tr></thead><tbody>{jobs.map(j => <tr key={j.id}><td><b>{j.title}</b><small>{j.company}</small></td><td>{j.location}</td><td><span className={`status ${j.is_active ? 'status-active' : 'status-muted'}`}>{j.is_active ? 'Active' : 'Closed'}</span></td><td>{j.application_count || 0}</td><td><Link className="table-link" to={`/jobs/${j.id}/applicants`}>Applicants <ArrowRight size={13}/></Link></td></tr>)}</tbody></table></div> : <div className="empty-inline">You haven't posted any jobs yet. <Link to="/jobs/new">Post your first role</Link>.</div> :
      applications.length ? <div className="application-list">{applications.map(a => <div className="application-row" key={a.id}><div className="company-logo">{a.company?.slice(0,1).toUpperCase()}</div><div className="application-info"><b>{a.job_title}</b><span>{a.company} · Applied {new Date(a.applied_at).toLocaleDateString()}</span></div><span className={`status status-${a.status}`}>{statusLabel(a.status)}</span><Link className="round-arrow" to={`/jobs/${a.job}`}><ArrowRight size={16}/></Link></div>)}</div> : <div className="empty-inline">No applications yet. <Link to="/jobs">Explore open roles</Link>.</div>}
    </section>
  </main>
}

function JobForm({ user, notify, edit = false }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({title:'',company:user?.company || '',location:'',employment_type:'full_time',experience:'entry',salary_min:'',salary_max:'',description:'',requirements:'',is_active:true})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    if (edit && id) api.get(`/jobs/${id}/`).then(r => {
      if (r.data.recruiter !== user?.id) { setError('You can only edit your own job postings.'); return }
      const j = r.data; setForm({...j, salary_min:j.salary_min ?? '', salary_max:j.salary_max ?? ''})
    }).catch(() => setError('Could not load this job.'))
  }, [edit, id, user])
  if (!user) return <main className="page-wrap"><div className="empty-state"><h2>Log in to continue</h2><Link className="button button-primary" to="/login">Log in</Link></div></main>
  if (user.role !== 'recruiter') return <main className="page-wrap"><div className="alert alert-error">Only recruiter accounts can post jobs.</div></main>
  const update = e => setForm({...form, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value})
  const submit = async e => {
    e.preventDefault(); setBusy(true); setError('')
    const payload = {...form, salary_min:form.salary_min === '' ? null : Number(form.salary_min), salary_max:form.salary_max === '' ? null : Number(form.salary_max)}
    try {
      const r = edit ? await api.patch(`/jobs/${id}/`, payload) : await api.post('/jobs/', payload)
      notify(edit ? 'Job posting updated.' : 'Job published successfully.'); navigate(`/jobs/${r.data.id}`)
    } catch (err) { setError(JSON.stringify(err.response?.data || 'Could not save job.')) }
    finally { setBusy(false) }
  }
  return <main className="page-wrap form-page"><Link to="/dashboard" className="back-link">← Dashboard</Link><div className="page-heading left-heading"><div className="eyebrow">RECRUITER WORKSPACE</div><h1>{edit ? 'Edit your listing' : 'Post a new role'}</h1><p>Clear details help the right people find your opportunity.</p></div>
    <form className="content-card job-form" onSubmit={submit}>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="form-section-title"><span>01</span><div><h3>Role details</h3><p>Start with the essentials.</p></div></div>
      <div className="form-grid"><label>Job title *<input name="title" value={form.title} onChange={update} required placeholder="e.g. Python Backend Developer"/></label><label>Company *<input name="company" value={form.company} onChange={update} required placeholder="Company name"/></label><label>Location *<input name="location" value={form.location} onChange={update} required placeholder="Hyderabad / Remote"/></label><label>Employment type<select name="employment_type" value={form.employment_type} onChange={update}><option value="full_time">Full-time</option><option value="part_time">Part-time</option><option value="contract">Contract</option><option value="internship">Internship</option></select></label><label>Experience level<select name="experience" value={form.experience} onChange={update}><option value="entry">Entry level</option><option value="mid">Mid level</option><option value="senior">Senior level</option></select></label></div>
      <div className="form-section-title"><span>02</span><div><h3>Compensation</h3><p>Share a salary range when possible (annual INR).</p></div></div>
      <div className="form-grid"><label>Minimum salary<input type="number" min="0" name="salary_min" value={form.salary_min} onChange={update} placeholder="e.g. 400000"/></label><label>Maximum salary<input type="number" min="0" name="salary_max" value={form.salary_max} onChange={update} placeholder="e.g. 700000"/></label></div>
      <div className="form-section-title"><span>03</span><div><h3>About the opportunity</h3><p>Explain what the person will do and what they'll bring.</p></div></div>
      <label>Job description *<textarea name="description" rows="6" value={form.description} onChange={update} required placeholder="Describe the role, responsibilities, and team…"/></label><label>Requirements<textarea name="requirements" rows="5" value={form.requirements} onChange={update} placeholder="Skills, experience, education, and nice-to-haves…"/></label>
      {edit && <label className="checkbox-label"><input type="checkbox" name="is_active" checked={form.is_active} onChange={update}/> This listing is active and accepting applications</label>}
      <div className="form-actions"><Link to="/dashboard" className="button button-ghost">Cancel</Link><button className="button button-primary" disabled={busy}>{busy ? 'Saving…' : edit ? 'Save changes' : 'Publish job'} <ArrowRight size={16}/></button></div>
    </form>
  </main>
}

function Applicants({ user, notify }) {
  const { id } = useParams()
  const [job, setJob] = useState(null)
  const [apps, setApps] = useState([])
  const [error, setError] = useState('')
  const load = () => Promise.all([api.get(`/jobs/${id}/`), api.get(`/jobs/${id}/applicants/`)]).then(([j,a]) => {setJob(j.data);setApps(a.data.results || a.data)}).catch(err => setError(err.response?.data?.detail || 'Could not load applicants. Confirm this is your job posting.'))
  useEffect(() => { if (user?.role === 'recruiter') load() }, [id,user])
  const updateStatus = async (appId, status) => {
    try { await api.patch(`/applications/${appId}/status/`, {status}); notify('Application status updated.'); load() }
    catch (e) { notify(e.response?.data?.detail || 'Could not update status.') }
  }
  if (!user) return <main className="page-wrap"><div className="empty-state"><h2>Log in to continue</h2><Link to="/login" className="button button-primary">Log in</Link></div></main>
  if (user.role !== 'recruiter') return <main className="page-wrap"><div className="alert alert-error">Only recruiters can view applicants.</div></main>
  return <main className="page-wrap"><Link className="back-link" to="/dashboard">← Dashboard</Link><div className="page-heading left-heading"><div className="eyebrow">RECRUITER WORKSPACE</div><h1>Applicants<span>.</span></h1><p>{job?.title || 'Review candidate applications and move great people forward.'}</p></div>
    {error && <div className="alert alert-error">{error}</div>}
    <div className="content-card"><div className="table-wrap"><table><thead><tr><th>Candidate</th><th>Applied</th><th>Cover letter</th><th>Resume</th><th>Update status</th></tr></thead><tbody>{apps.map(a => <tr key={a.id}><td><b>{a.candidate_name}</b><small>{a.candidate_email}</small></td><td>{new Date(a.applied_at).toLocaleDateString()}</td><td className="cover-cell">{a.cover_letter || '—'}</td><td>{a.resume_url ? <a className="table-link" href={a.resume_url} target="_blank" rel="noreferrer">View PDF <ArrowRight size={13}/></a> : '—'}</td><td><select className="status-select" value={a.status} onChange={e => updateStatus(a.id,e.target.value)}><option value="applied">Applied</option><option value="shortlisted">Shortlisted</option><option value="interview">Interview</option><option value="selected">Selected</option><option value="rejected">Rejected</option></select></td></tr>)}</tbody></table></div>{!apps.length && <div className="empty-inline">No applications yet. Share your listing to reach candidates.</div>}</div>
  </main>
}

function NotFound() { return <main className="page-wrap"><div className="empty-state"><h1>Page not found</h1><p>This page may have moved.</p><Link to="/" className="button button-primary">Back home</Link></div></main> }

export default App
