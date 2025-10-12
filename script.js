const demoSignals = [
    {entry:"1.0932", duration:60},
    {entry:"1.2720", duration:90},
    {entry:"145.60", duration:120},
    {entry:"0.7125", duration:75},
    {entry:"1.3350", duration:50}
];

let currentSignal = null;
let timerInterval = null;

const pairSelect = document.getElementById("pairSelect");
const tfSelect = document.getElementById("tfSelect");
const signalDisplay = document.getElementById("signalDisplay");
const getSignalBtn = document.getElementById("getSignalBtn");
const resetSignalBtn = document.getElementById("resetSignalBtn");

function startSignal(signal){
    currentSignal = signal;
    getSignalBtn.disabled = true;
    pairSelect.disabled = true;
    tfSelect.disabled = true;

    // Эффект загрузки
    signalDisplay.innerHTML = '<div class="loader"></div>';

    setTimeout(()=>{
        const pair = pairSelect.value;
        const tf = tfSelect.value;
        const endTime = Date.now() + signal.duration*1000;

        function updateTimer(){
            const remaining = Math.max(0, Math.ceil((endTime - Date.now())/1000));
            if(remaining <= 0){
                clearInterval(timerInterval);
                const results = ["+","-","↺"];
                const r = results[Math.floor(Math.random()*results.length)];
                let className = r==="+"?"signal-positive":r==="-"?"signal-negative":"signal-neutral";
                signalDisplay.innerHTML = `<p>Пара: ${pair} | TF: ${tf}</p>
                                           <p>Точка входа: ${signal.entry}</p>
                                           <p>Результат: <span class="${className}">${r}</span></p>`;
            } else {
                signalDisplay.innerHTML = `<p>Пара: ${pair} | TF: ${tf}</p>
                                           <p>Точка входа: ${signal.entry}</p>
                                           <p>Таймер: 00:${remaining<10?'0':''+remaining}</p>`;
            }
        }

        updateTimer();
        timerInterval = setInterval(updateTimer, 1000);
        loadTradingView();
    }, 1000); // задержка для загрузки
}

// Кнопки
getSignalBtn.addEventListener("click", ()=>{
    if(timerInterval) clearInterval(timerInterval);
    const randomSignal = demoSignals[Math.floor(Math.random()*demoSignals.length)];
    startSignal(randomSignal);
});

resetSignalBtn.addEventListener("click", ()=>{
    if(timerInterval) clearInterval(timerInterval);
    signalDisplay.innerHTML = "<p>Сигнал появится здесь</p>";
    currentSignal = null;
    getSignalBtn.disabled = false;
    pairSelect.disabled = false;
    tfSelect.disabled = false;
});

// TradingView
let tvWidget = null;
function loadTradingView(){
    const pair = pairSelect.value.replace("/","");
    const tf = tfSelect.value;
    if(tvWidget) tvWidget.remove();
    tvWidget = new TradingView.widget({
        "container_id": "tv_chart_container",
        "symbol": pair,
        "interval": tf,
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "locale": "ru",
        "toolbar_bg": "#1e293b",
        "enable_publishing": false,
        "hide_side_toolbar": false,
        "allow_symbol_change": true,
        "save_image": false
    });
}

// Обновление графика только если нет активного сигнала
pairSelect.addEventListener("change", ()=>{ if(!currentSignal) loadTradingView(); });
tfSelect.addEventListener("change", ()=>{ if(!currentSignal) loadTradingView(); });

loadTradingView();
