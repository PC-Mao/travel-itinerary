// Travel Planner Core Application Logic

let state = {
    trips: [],
    activeTripId: null,
    activeDayIndex: 0,
    activeCategoryFilter: 'all'
}

const DEMO_TRIPS = [
    {
        id: 'demo-kyoto',
        name: '京都楓葉古意五日遊',
        startDate: '2026-11-15',
        endDate: '2026-11-19',
        daysCount: 5,
        activities: [
            { id: 'act-1', dayIndex: 0, time: '08:30', title: '搭乘關西機場特急 Haruka 列車', category: 'flight', location: '關西國際機場 (KIX)', desc: '憑 JR Pass 兌換實體票，搭乘自由席前往京都車站，車程約 75 分鐘。' },
            { id: 'act-2', dayIndex: 0, time: '11:00', title: '京都車站宜必思尚品酒店 Check-in', category: 'hotel', location: '京都市南區東九條上殿田町47', desc: '寄存行李，順便在車站購買京都巴士一日券。' },
            { id: 'act-3', dayIndex: 0, time: '12:30', title: '拉麵小路午餐 - 本家第一旭', category: 'food', location: '京都車站伊勢丹百貨 10 樓', desc: '推薦醬油拉麵與特製叉燒，排隊大約需要 30 分鐘。' },
            { id: 'act-4', dayIndex: 0, time: '14:30', title: '清水寺與二年坂、三年坂散策', category: 'sightseeing', location: '京都市東山區清水1丁目294', desc: '拍攝秋季限定的清水舞台楓葉景緻。' },
            { id: 'act-5', dayIndex: 1, time: '09:00', title: '嵐山竹林小徑與渡月橋', category: 'sightseeing', location: '京都市右京區嵐山', desc: '清晨遊客較少，適合拍照。之後可去搭乘嵯峨野小火車賞楓。' },
            { id: 'act-6', dayIndex: 1, time: '13:00', title: '廣川鰻魚飯午餐', category: 'food', location: '京都市右京區嵯峨天龍寺北造路町44-1', desc: '嵐山超人氣米其林一星鰻魚飯，需要提前預約。' }
        ],
        photos: []
    }
]

// DOM refs
const tripListEl = document.getElementById('trip-list')
const dayChipsContainerEl = document.getElementById('day-chips-container')
const activeTripNameEl = document.getElementById('active-trip-name')
const activeTripDatesEl = document.getElementById('active-trip-dates')
const timelineContainerEl = document.getElementById('timeline-container')
const photoGridEl = document.getElementById('photo-grid')
const dropzoneEl = document.getElementById('dropzone')
const btnAddActivityEl = document.getElementById('btn-add-activity')
const btnTriggerUploadEl = document.getElementById('btn-trigger-upload')
const btnDeleteTripEl = document.getElementById('btn-delete-trip')
const photoUploadInput = document.getElementById('photo-upload-input')
const modalTrip = document.getElementById('modal-trip')
const modalActivity = document.getElementById('modal-activity')
const modalLightbox = document.getElementById('modal-lightbox')
const formNewTrip = document.getElementById('form-new-trip')
const formNewActivity = document.getElementById('form-new-activity')

function init() {
    loadState()
    setupEventListeners()
    renderAll()
}

function loadState() {
    const saved = localStorage.getItem('stellar_voyage_state')
    if (saved) {
        try { state = JSON.parse(saved) } catch { loadDemoData() }
    } else {
        loadDemoData()
    }
}

function loadDemoData() {
    state.trips = [...DEMO_TRIPS]
    state.activeTripId = DEMO_TRIPS[0].id
    state.activeDayIndex = 0
    saveState()
}

function saveState() {
    localStorage.setItem('stellar_voyage_state', JSON.stringify(state))
}

function renderAll() {
    renderTripList()
    const activeTrip = getActiveTrip()
    if (activeTrip) {
        activeTripNameEl.textContent = activeTrip.name
        activeTripDatesEl.textContent = formatDateRange(activeTrip.startDate, activeTrip.endDate)
        btnDeleteTripEl.style.display = 'inline-flex'
        btnAddActivityEl.removeAttribute('disabled')
        btnTriggerUploadEl.removeAttribute('disabled')
        dropzoneEl.classList.remove('disabled')
        renderDaySelector(activeTrip)
        renderItinerary(activeTrip)
        renderGallery(activeTrip)
    } else {
        activeTripNameEl.textContent = '尚未選擇旅程'
        activeTripDatesEl.textContent = '請先建立或選擇一個旅程'
        btnDeleteTripEl.style.display = 'none'
        btnAddActivityEl.setAttribute('disabled', 'true')
        btnTriggerUploadEl.setAttribute('disabled', 'true')
        dropzoneEl.classList.add('disabled')
        dayChipsContainerEl.innerHTML = ''
        timelineContainerEl.innerHTML = `<div class="empty-state"><i class="fa-solid fa-map-location-dot"></i><p>點擊左側「+」按鈕建立新旅程，開啟您的探索之旅！</p></div>`
        photoGridEl.innerHTML = ''
    }
}

function renderTripList() {
    tripListEl.innerHTML = ''
    state.trips.forEach(trip => {
        const item = document.createElement('li')
        item.className = `trip-item ${trip.id === state.activeTripId ? 'active' : ''}`
        item.addEventListener('click', () => {
            state.activeTripId = trip.id
            state.activeDayIndex = 0
            saveState()
            renderAll()
        })
        item.innerHTML = `
            <div class="trip-item-info">
                <span class="trip-item-title">${escapeHTML(trip.name)}</span>
                <span class="trip-item-dates">${formatDateRange(trip.startDate, trip.endDate)}</span>
            </div>
            <i class="fa-solid fa-chevron-right" style="color:var(--text-muted)"></i>
        `
        tripListEl.appendChild(item)
    })
}

function renderDaySelector(trip) {
    dayChipsContainerEl.innerHTML = ''
    for (let i = 0; i < trip.daysCount; i++) {
        const chip = document.createElement('button')
        chip.className = `day-chip ${i === state.activeDayIndex ? 'active' : ''}`
        chip.addEventListener('click', () => {
            state.activeDayIndex = i
            saveState()
            renderAll()
        })
        chip.innerHTML = `<i class="fa-solid fa-calendar-day"></i> Day ${i + 1}`
        dayChipsContainerEl.appendChild(chip)
    }
}

function renderItinerary(trip) {
    timelineContainerEl.innerHTML = ''
    let activities = trip.activities.filter(act => act.dayIndex === state.activeDayIndex)
    if (state.activeCategoryFilter !== 'all') {
        activities = activities.filter(act => act.category === state.activeCategoryFilter)
    }
    activities.sort((a, b) => a.time.localeCompare(b.time))

    if (activities.length === 0) {
        timelineContainerEl.innerHTML = `<div class="empty-state"><i class="fa-solid fa-calendar-xmark"></i><p>今天沒有排定此類型的行程項目。點擊右上角「新增行程」規劃日程吧！</p></div>`
        return
    }

    activities.forEach(act => {
        const item = document.createElement('article')
        item.className = 'timeline-item'
        const locHTML = act.location ? `<div class="timeline-location"><i class="fa-solid fa-location-dot"></i><span>${escapeHTML(act.location)}</span></div>` : ''
        const descHTML = act.desc ? `<p class="timeline-desc">${escapeHTML(act.desc).replace(/\n/g, '<br>')}</p>` : ''
        item.innerHTML = `
            <div class="timeline-bullet"></div>
            <span class="timeline-time-badge">${act.time}</span>
            <div class="timeline-title-row">
                <h4>${escapeHTML(act.title)}</h4>
                <span class="activity-badge badge-${act.category}">${getCategoryLabel(act.category)}</span>
            </div>
            ${locHTML}${descHTML}
            <div class="timeline-actions">
                <button class="btn-icon btn-delete-act" data-id="${act.id}" title="刪除行程">
                    <i class="fa-solid fa-trash-can" style="color:var(--danger)"></i>
                </button>
            </div>
        `
        item.querySelector('.btn-delete-act').addEventListener('click', e => {
            e.stopPropagation()
            if (confirm(`確定要刪除行程「${act.title}」嗎？`)) deleteActivity(trip.id, act.id)
        })
        timelineContainerEl.appendChild(item)
    })
}

function renderGallery(trip) {
    photoGridEl.innerHTML = ''
    const photos = trip.photos.filter(p => p.dayIndex === state.activeDayIndex)
    if (photos.length === 0) {
        photoGridEl.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><i class="fa-solid fa-camera"></i><p>Day ${state.activeDayIndex + 1} 尚無上傳照片，在此記錄精彩回憶！</p></div>`
        return
    }
    photos.forEach(photo => {
        const card = document.createElement('div')
        card.className = 'photo-card'
        card.innerHTML = `
            <img src="${photo.data}" alt="Travel memory">
            <div class="photo-overlay"><span class="photo-meta">Day ${photo.dayIndex + 1}</span></div>
            <button class="btn-delete-photo" data-id="${photo.id}"><i class="fa-solid fa-xmark"></i></button>
        `
        card.addEventListener('click', e => {
            if (e.target.closest('.btn-delete-photo')) return
            openLightbox(photo)
        })
        card.querySelector('.btn-delete-photo').addEventListener('click', e => {
            e.stopPropagation()
            if (confirm('確定要刪除這張照片嗎？')) deletePhoto(trip.id, photo.id)
        })
        photoGridEl.appendChild(card)
    })
}

function getActiveTrip() {
    return state.trips.find(t => t.id === state.activeTripId)
}

function calculateDays(startStr, endStr) {
    if (!startStr || !endStr) return 1
    const diff = Math.abs(new Date(endStr) - new Date(startStr))
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1
    return isNaN(days) ? 1 : days
}

function deleteActivity(tripId, actId) {
    const trip = state.trips.find(t => t.id === tripId)
    if (trip) { trip.activities = trip.activities.filter(a => a.id !== actId); saveState(); renderAll() }
}

function deletePhoto(tripId, photoId) {
    const trip = state.trips.find(t => t.id === tripId)
    if (trip) { trip.photos = trip.photos.filter(p => p.id !== photoId); saveState(); renderAll() }
}

function handleFiles(files) {
    const trip = getActiveTrip()
    if (!trip) return
    Array.from(files).forEach(file => {
        if (!file.type.startsWith('image/')) return
        const reader = new FileReader()
        reader.onload = e => {
            trip.photos.push({
                id: 'photo-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
                data: e.target.result,
                dayIndex: state.activeDayIndex,
                timestamp: new Date().toISOString()
            })
            saveState()
            renderAll()
        }
        reader.readAsDataURL(file)
    })
}

function openLightbox(photo) {
    document.getElementById('lightbox-img').src = photo.data
    document.getElementById('lightbox-caption').innerHTML = `<span>日程分類：Day ${photo.dayIndex + 1}</span>`
    modalLightbox.classList.add('open')
}

function setupEventListeners() {
    document.getElementById('btn-new-trip').addEventListener('click', () => modalTrip.classList.add('open'))
    document.getElementById('close-modal-trip').addEventListener('click', () => modalTrip.classList.remove('open'))
    document.getElementById('btn-cancel-trip').addEventListener('click', () => modalTrip.classList.remove('open'))

    formNewTrip.addEventListener('submit', e => {
        e.preventDefault()
        const name = document.getElementById('trip-name').value.trim()
        const startDate = document.getElementById('trip-start').value
        const endDate = document.getElementById('trip-end').value
        if (!name) return
        const newTrip = {
            id: 'trip-' + Date.now(),
            name,
            startDate: startDate || new Date().toISOString().split('T')[0],
            endDate: endDate || newDateWithOffset(startDate, 1),
            daysCount: calculateDays(startDate, endDate),
            activities: [],
            photos: []
        }
        state.trips.push(newTrip)
        state.activeTripId = newTrip.id
        state.activeDayIndex = 0
        saveState()
        modalTrip.classList.remove('open')
        formNewTrip.reset()
        renderAll()
    })

    btnDeleteTripEl.addEventListener('click', () => {
        const trip = getActiveTrip()
        if (trip && confirm(`確定要刪除整個旅程「${trip.name}」與所有相關行程、相簿嗎？`)) {
            state.trips = state.trips.filter(t => t.id !== trip.id)
            state.activeTripId = state.trips.length > 0 ? state.trips[0].id : null
            state.activeDayIndex = 0
            saveState()
            renderAll()
        }
    })

    btnAddActivityEl.addEventListener('click', () => modalActivity.classList.add('open'))
    document.getElementById('close-modal-activity').addEventListener('click', () => modalActivity.classList.remove('open'))
    document.getElementById('btn-cancel-activity').addEventListener('click', () => modalActivity.classList.remove('open'))

    formNewActivity.addEventListener('submit', e => {
        e.preventDefault()
        const title = document.getElementById('activity-title').value.trim()
        const time = document.getElementById('activity-time').value
        const category = document.getElementById('activity-category').value
        const location = document.getElementById('activity-location').value.trim()
        const desc = document.getElementById('activity-desc').value.trim()
        const trip = getActiveTrip()
        if (!trip || !title || !time) return
        trip.activities.push({ id: 'act-' + Date.now(), dayIndex: state.activeDayIndex, time, title, category, location, desc })
        saveState()
        modalActivity.classList.remove('open')
        formNewActivity.reset()
        document.getElementById('activity-time').value = '09:00'
        renderAll()
    })

    document.getElementById('btn-add-day').addEventListener('click', () => {
        const trip = getActiveTrip()
        if (trip) {
            trip.daysCount += 1
            const curEnd = new Date(trip.endDate)
            curEnd.setDate(curEnd.getDate() + 1)
            trip.endDate = curEnd.toISOString().split('T')[0]
            saveState()
            renderAll()
        }
    })

    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'))
            chip.classList.add('active')
            state.activeCategoryFilter = chip.dataset.category
            renderAll()
        })
    })

    btnTriggerUploadEl.addEventListener('click', () => photoUploadInput.click())
    photoUploadInput.addEventListener('change', e => handleFiles(e.target.files))

    document.getElementById('close-lightbox').addEventListener('click', () => modalLightbox.classList.remove('open'))
    modalLightbox.addEventListener('click', e => { if (e.target === modalLightbox) modalLightbox.classList.remove('open') })

    ;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(ev => {
        dropzoneEl.addEventListener(ev, e => { e.preventDefault(); e.stopPropagation() })
    })
    ;['dragenter', 'dragover'].forEach(ev => {
        dropzoneEl.addEventListener(ev, () => { if (getActiveTrip()) dropzoneEl.classList.add('dragover') })
    })
    ;['dragleave', 'drop'].forEach(ev => {
        dropzoneEl.addEventListener(ev, () => dropzoneEl.classList.remove('dragover'))
    })
    dropzoneEl.addEventListener('drop', e => {
        if (getActiveTrip()) handleFiles(e.dataTransfer.files)
    })
}

function escapeHTML(str) {
    if (!str) return ''
    return str.replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag))
}

function formatDateRange(start, end) {
    if (!start) return ''
    if (!end || start === end) return start
    return `${start} 至 ${end}`
}

function newDateWithOffset(dateStr, offsetDays) {
    const base = dateStr ? new Date(dateStr) : new Date()
    base.setDate(base.getDate() + offsetDays)
    return base.toISOString().split('T')[0]
}

function getCategoryLabel(cat) {
    return { flight: '交通', hotel: '住宿', sightseeing: '景點', food: '餐飲' }[cat] || '其他'
}

init()
