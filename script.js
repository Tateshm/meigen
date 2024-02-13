let message = '';
let doneStream = false;
const quoteBox = document.querySelector('.quote-box').querySelector('p');

async function* streamChatCompletion() {
    const completion = await fetch(
        "http://127.0.0.1:5500/",
        {
            headers: {
                "Content-Type": "application/json",
            },
            method: "POST",
            body: '{"query": "名前は出さずに多様なテーマの短い名言を1つ「」で囲って出力してください。それ以外の出力は不要です。"}'
        }
    );

    const reader = completion.body?.getReader();

    if (completion.status !== 200 || !reader) {
        console.log(completion.status)
        //throw new Error("Request failed");
    }

    const decoder = new TextDecoder("utf-8");
    let done = false;
    while (!done) {
        const { done: readDone, value } = await reader.read();
        if (readDone) {
            done = readDone;
            reader.releaseLock();
        } else {
            const token = decoder.decode(value, { stream: true });
            yield token;
        }
    }
}


const hankoAnim = document.querySelector(".my-stamp").animate([
    {
        visibility: 'visible',
        opacity: 0,
        transform: 'rotate(-30deg) scale(2.5)',
    },
    {
        visibility: 'visible',
        opacity: 0.8,
        transform: 'rotate(5deg) scale(1)',
    },
    {
        visibility: 'visible',
        opacity: 1.0,
        transform: 'rotate(5deg)',
    }
], {
    duration: 2000, // アニメーションの時間（ミリ秒）
    easing: 'ease-out', // イージング関数
    fill: 'both'
});


function updateQuote() {
    quoteBox.innerText += message.charAt(0);
    message = message.slice(1);
}

function updateTwitterLink() {
    const twitterLink = document.getElementById("twitter-share");
    const quoteText = encodeURIComponent(`ぱっちぃ${quoteBox.innerText}だっちぃ`);
    twitterLink.setAttribute('href', `https://twitter.com/intent/tweet?url=${''}&text=${quoteText}`);
}

async function displayQuote() {
    const generator = streamChatCompletion();
    quoteBox.innerText = "";
    message = '';

    console.log({'displayQuote()':{'message':message}})

    const fps = setInterval(() => {
        if (message) updateQuote();
        if (!message && doneStream) {
            clearInterval(fps);
            hankoAnim.play();
            updateTwitterLink();
            document.getElementById('mountain-wrap').classList.add('slide-up');
            document.getElementById('sunrise-container').classList.add('sunrise');
            doneStream = false;
        }
    }, 100);

    for await (const token of generator) {
        if (token !== '') {
            message += token;
        }
    }
    doneStream = true;
}

function restartAnimation() {
    hankoAnim.cancel();
    hankoAnim.pause();

    
    document.getElementById('mountain-wrap').classList.remove('slide-up');
    document.getElementById('sunrise-container').classList.remove('sunrise');

    // 各画像のopacityを0に設定
    document.querySelector('.image1').style.opacity = '0';
    document.querySelector('.image2').style.opacity = '0';
    document.querySelector('.image3').style.opacity = '0';
    document.querySelector('.quote-container').style.opacity = '0';

    // アニメーションを最初の状態にリセット
    document.querySelector('.image1').style.animation = 'none';
    document.querySelector('.image2').style.animation = 'none';
    document.querySelector('.image3').style.animation = 'none';
    document.querySelector('.quote-container').style.animation = 'none';

    // アニメーションの再生をトリガー
    setTimeout(() => {
        document.querySelector('.image1').style.animation = 'moveAndFade1 3s linear forwards';
        document.querySelector('.image2').style.animation = 'moveAndFade2 3s linear forwards';
        document.querySelector('.image3').style.animation = 'moveAndFade3 3s linear forwards';
        document.querySelector('.quote-container').style.animation = 'displayQuote 3s linear forwards';
    }, 100);

    setTimeout(() => {
        displayQuote();
    }, 3000);
}

hankoAnim.cancel()