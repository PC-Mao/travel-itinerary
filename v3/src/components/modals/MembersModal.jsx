import { useState, useMemo } from 'react'

// Calculate who owes whom based on all trip expenses
function calcSettlement(members, allExpenses) {
  if (!members || members.length === 0) return { total: 0, average: 0, balances: [], plans: [] }

  let total = 0
  const spent = {}
  const owed = {}
  members.forEach(m => { spent[m.id] = 0; owed[m.id] = 0 })

  allExpenses.forEach(ex => {
    total += ex.amount
    if (spent[ex.payerId] !== undefined) spent[ex.payerId] += ex.amount
    const sharedIds = ex.sharedMemberIds?.length > 0 ? ex.sharedMemberIds : members.map(m => m.id)
    const share = ex.amount / sharedIds.length
    sharedIds.forEach(id => { if (owed[id] !== undefined) owed[id] += share })
  })

  const balances = members.map(m => ({
    id: m.id, name: m.name,
    spent: spent[m.id],
    owed: Math.round(owed[m.id]),
    balance: spent[m.id] - Math.round(owed[m.id]),
  }))

  // Greedy split plan
  const debtors = balances.filter(b => b.balance < 0).map(b => ({ ...b, balance: Math.abs(b.balance) }))
  const creditors = balances.filter(b => b.balance > 0).map(b => ({ ...b }))
  debtors.sort((a, b) => b.balance - a.balance)
  creditors.sort((a, b) => b.balance - a.balance)

  const plans = []
  let i = 0, j = 0
  while (i < debtors.length && j < creditors.length) {
    const amt = Math.min(debtors[i].balance, creditors[j].balance)
    if (amt > 0.5) plans.push({ from: debtors[i].name, to: creditors[j].name, amount: Math.round(amt) })
    debtors[i].balance -= amt
    creditors[j].balance -= amt
    if (Math.round(debtors[i].balance) <= 0) i++
    if (Math.round(creditors[j].balance) <= 0) j++
  }

  return { total, average: members.length > 0 ? Math.round(total / members.length) : 0, balances, plans }
}

export default function MembersModal({ members, onAddMember, onDeleteMember, onClose, allExpenses = [] }) {
  const [name, setName] = useState('')
  const [tab, setTab] = useState('members')

  const settlement = useMemo(() => calcSettlement(members, allExpenses), [members, allExpenses])

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    onAddMember(name.trim())
    setName('')
  }

  return (
    <div className="modal open" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-content glass" style={{ maxWidth: '560px' }}>
        <div className="modal-header">
          <h2><i className="fa-solid fa-users-gear" /> 成員管理與記帳分帳</h2>
          <span className="close-btn" onClick={onClose}>&times;</span>
        </div>

        {/* Tab switcher */}
        <div className="segmented-control" style={{ marginBottom: '20px' }}>
          <button className={`tab-btn ${tab === 'members' ? 'active' : ''}`} onClick={() => setTab('members')}>
            <i className="fa-solid fa-user-plus" /> 成員暱稱設定
          </button>
          <button className={`tab-btn ${tab === 'settlement' ? 'active' : ''}`} onClick={() => setTab('settlement')}>
            <i className="fa-solid fa-scale-balanced" /> 旅程費用結算
          </button>
        </div>

        {/* Tab: 成員暱稱設定 */}
        {tab === 'members' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                <label htmlFor="member-nickname">新增成員暱稱</label>
                <input type="text" id="member-nickname" required placeholder="例如：小明、佳佳、阿華"
                  value={name} onChange={e => setName(e.target.value)} style={{ padding: '10px 14px' }} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ padding: '11px 20px' }}>
                <i className="fa-solid fa-plus" /> 新增
              </button>
            </form>

            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>當前旅程成員</h4>
            {members.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>
                目前無成員。在上方欄位輸入以新增旅伴！
              </p>
            ) : (
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto', padding: '2px' }}>
                {members.map(m => (
                  <li key={m.id} className="member-item">
                    <div className="member-name-group">
                      <div className="member-avatar">{m.name.charAt(0)}</div>
                      <span>{m.name}</span>
                    </div>
                    <button className="btn-icon" style={{ width: 28, height: 28 }}
                      onClick={() => { if (confirm(`確定要移除成員「${m.name}」嗎？`)) onDeleteMember(m.id) }}>
                      <i className="fa-solid fa-user-minus" style={{ fontSize: '0.8rem', color: 'var(--danger)' }} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Tab: 旅程費用結算 */}
        {tab === 'settlement' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Total & average */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { label: '全體總花費', value: `$${settlement.total.toLocaleString()}`, color: 'var(--accent-cyan)' },
                { label: '每人平均花費', value: `$${settlement.average.toLocaleString()}`, color: 'var(--accent-indigo)' },
              ].map(c => (
                <div key={c.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '12px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.label}</span>
                  <div style={{ fontSize: '1.4rem', color: c.color, fontWeight: 700, marginTop: '4px' }}>{c.value}</div>
                </div>
              ))}
            </div>

            {/* Member balances */}
            <div>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>各成員支出明細</h4>
              {settlement.balances.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '12px' }}>目前無成員資料</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '140px', overflowY: 'auto', padding: '2px' }}>
                  {settlement.balances.map(b => (
                    <div key={b.id} className="settlement-member-row">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="member-avatar">{b.name.charAt(0)}</div>
                        <span style={{ fontWeight: 600 }}>{b.name}</span>
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '0.8rem' }}>
                        <div>支付: ${b.spent} | 應付: ${b.owed}</div>
                        <div style={{ fontWeight: 700, color: b.balance > 0 ? 'var(--accent-cyan)' : b.balance < 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
                          {b.balance > 0 ? `+ $${b.balance} (應收)` : b.balance < 0 ? `- $${Math.abs(b.balance)} (應付)` : '收支平衡'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Split plan */}
            <div>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>分帳建議方案</h4>
              {settlement.plans.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '12px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <i className="fa-solid fa-circle-check" style={{ color: 'var(--accent-cyan)', fontSize: '1.2rem', display: 'block', marginBottom: '6px' }} />
                  目前收支完全平衡，不需進行任何分帳交易！
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '140px', overflowY: 'auto', padding: '2px' }}>
                  {settlement.plans.map((p, i) => (
                    <div key={i} className="settlement-plan-card">
                      <i className="fa-solid fa-money-bill-transfer" style={{ color: 'var(--accent-cyan)', fontSize: '1.1rem' }} />
                      <div style={{ flex: 1 }}>
                        <span style={{ fontWeight: 700, color: 'var(--danger)' }}>{p.from}</span>
                        <span className="settlement-plan-arrow"> 支付 ${p.amount} 給 </span>
                        <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{p.to}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="modal-footer" style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>關閉</button>
        </div>
      </div>
    </div>
  )
}
