const GS_URL = "https://script.google.com/macros/s/AKfycbzFt4iRTwDzKemtooTlB6Mm7ZuOOBSwMibbgXZodzDnG-6FjD2UT4KBzhxet8UBUTzCvw/exec"; // GANTI URL /exec LO
let bag = [];
let currentOrder = {};

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadGallery();
});

async function loadProducts() {
    const mList = document.getElementById('membership-list');
    const cList = document.getElementById('coaching-list');
    try {
        const res = await fetch(`${GS_URL}?action=getProducts`);
        const data = await res.json();
        mList.innerHTML = ""; cList.innerHTML = "";
        data.forEach(item => {
            const card = `<div class="forge-card">
                <div class="card-img-wrap"><img src="${item.gambarurl}" class="card-img"></div>
                <h3 style="font-family:Oswald;">${item.nama}</h3>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:15px;">
                    <span style="font-family:Bebas Neue; font-size:1.8rem;">Rp ${parseInt(item.harga).toLocaleString()}</span>
                    <button class="btn-add" onclick="addToBag('${item.nama}', ${item.harga})">ADD</button>
                </div>
            </div>`;
            if (item.kategori.toLowerCase().includes('access')) mList.insertAdjacentHTML('beforeend', card);
            else cList.insertAdjacentHTML('beforeend', card);
        });
    } catch (e) { console.error(e); }
}

async function loadGallery() {
    const gList = document.getElementById('gallery-list');
    const gInfo = document.getElementById('gallery-info');
    try {
        const res = await fetch(`${GS_URL}?action=getGallery`);
        const data = await res.json();
        let rows = data.length > 20 ? 3 : (data.length > 10 ? 2 : 1);
        gList.style.gridTemplateRows = `repeat(${rows}, 320px)`;
        gInfo.innerText = `${data.length} MOMENTS // ${rows} LEVELS`;
        gList.innerHTML = data.map(i => `<div class="gallery-item"><img src="${i.gambarurl}"></div>`).join('');
    } catch (e) { console.error(e); }
}

function toggleBag(open) {
    const side = document.getElementById('side-bag');
    const over = document.getElementById('bag-overlay');
    if(open) { side.classList.add('active'); over.style.display = 'block'; renderBag(); }
    else { side.classList.remove('active'); over.style.display = 'none'; }
}

function addToBag(name, price) {
    bag.push({ name, price });
    document.getElementById('bag-count').innerText = bag.length;
    toggleBag(true);
}

function removeFromBag(index) {
    bag.splice(index, 1);
    document.getElementById('bag-count').innerText = bag.length;
    renderBag();
}

function renderBag() {
    const list = document.getElementById('bag-items-list');
    let total = 0;
    document.getElementById('bag-item-qty').innerText = `${bag.length} ITEMS`;
    if (bag.length === 0) {
        list.innerHTML = `<p style="color:#333; text-align:center; margin-top:50px;">EMPTY SELECTION</p>`;
        document.getElementById('bag-total-price').innerText = "Rp 0";
        return;
    }
    list.innerHTML = bag.map((item, index) => {
        total += item.price;
        return `<div class="bag-item-row">
            <div><h4 style="font-family:Oswald; font-size:0.8rem;">${item.name}</h4><p style="color:var(--accent); font-size:0.7rem;">Rp ${item.price.toLocaleString()}</p></div>
            <button class="remove-btn" onclick="removeFromBag(${index})">REMOVE</button>
        </div>`;
    }).join('');
    document.getElementById('bag-total-price').innerText = `Rp ${total.toLocaleString()}`;
}

async function checkout() {
    if (bag.length === 0) return;
    const nama = prompt("FULL NAME:");
    const wa = prompt("WHATSAPP:");
    if (!nama || !wa) return;
    const total = bag.reduce((s, i) => s + i.price, 0);
    const details = bag.map(i => i.name).join(", ");
    currentOrder = { nama, wa, details, total };
    
    document.getElementById('final-amount').innerText = `Rp ${total.toLocaleString()}`;
    document.getElementById('payment-modal').style.display = 'flex';

    try {
        fetch(GS_URL, { method: "POST", body: JSON.stringify({ action: "addOrder", nama, wa, item: details, total }) });
        bag = []; document.getElementById('bag-count').innerText = "0"; toggleBag(false);
    } catch (e) { console.error(e); }
}

function copyToClipboard() {
    const num = document.getElementById('acc-number').innerText;
    const status = document.getElementById('copy-status');
    navigator.clipboard.writeText(num).then(() => {
        status.style.opacity = '1';
        setTimeout(() => { status.style.opacity = '0'; }, 2000);
    });
}

function sendConfirmation(type) {
    const { nama, details, total } = currentOrder;
    const msg = `FORGE CONFIRMATION\nName: ${nama}\nOrder: ${details}\nTotal: Rp ${total.toLocaleString()}`;
    window.open(`https://wa.me/628123456789?text=${encodeURIComponent(msg)}`);
}

function closePayment() { document.getElementById('payment-modal').style.display = 'none'; }