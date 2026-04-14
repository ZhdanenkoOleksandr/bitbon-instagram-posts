// 📝 ИНСТРУКЦИЯ
//
// Способ 1: Как BOOKMARKLET (закладка в браузере)
// ================================================
// 1. Щёлкни на адресную строку браузера
// 2. Создай новую закладку (или отредактируй существующую)
// 3. В поле "URL" вставь весь код ниже (после javascript:)
// 4. Назови её "🎤 Диктовка"
// 5. Теперь нажимай на эту закладку перед тем, как писать сообщение
//
// javascript:(function()%7Bconst%20SpeechRecognition%20%3D%20window.SpeechRecognition%20%7C%7C%20window.webkitSpeechRecognition%3Bif%20(!SpeechRecognition)%20%7Balert('Web%20Speech%20API%20не%20поддерживается')%3Breturn%3B%7Dconst%20recognition%20%3D%20new%20SpeechRecognition()%3Brecognition.lang%20%3D%20'ru-RU'%3Brecognition.interimResults%20%3D%20true%3Brecognition.continuous%20%3D%20true%3Blet%20isSpaceHeld%20%3D%20false%3Blet%20finalTranscript%20%3D%20''%3Bconst%20indicator%20%3D%20document.createElement('div')%3Bindicator.style.cssText%20%3D%20'position%3Afixed%3Bbottom%3A20px%3Bright%3A20px%3Bpadding%3A15px%2020px%3Bbackground%3A%23667eea%3Bcolor%3Awhite%3Bborder-radius%3A50px%3Bfont-size%3A14px%3Bdisplay%3Anone%3Balign-items%3Acenter%3Bgap%3A10px%3Bz-index%3A999999'%3Bconst%20dot%20%3D%20document.createElement('span')%3Bdot.style.cssText%20%3D%20'width%3A10px%3Bheight%3A10px%3Bbackground%3Awhite%3Bborder-radius%3A50%25%3Banimation%3Apulse%201s%20infinite'%3Bconst%20style%20%3D%20document.createElement('style')%3Bstyle.textContent%20%3D%20'%40keyframes%20pulse%20%7B0%25%2C100%25%20%7Bopacity%3A1%3B%7D50%25%20%7Bopacity%3A0.4%3B%7D%7D'%3Bdocument.head.appendChild(style)%3Bindicator.appendChild(dot)%3Bindicator.appendChild(document.createTextNode('🎤%20Слушаю...'))%3Bdocument.body.appendChild(indicator)%3Brecognition.onstart%20%3D%20()%20%3D%3E%20%7Bindicator.style.display%20%3D%20'flex'%3BfinalTranscript%20%3D%20''%3B%7D%3Brecognition.onend%20%3D%20()%20%3D%3E%20%7Bindicator.style.display%20%3D%20'none'%3B%7D%3Brecognition.onresult%20%3D%20(event)%20%3D%3E%20%7Blet%20interimTranscript%20%3D%20''%3Bfor%20(let%20i%20%3D%20event.resultIndex%3Bi%20%3C%20event.results.length%3Bi%2B%2B)%20%7Bconst%20transcript%20%3D%20event.results%5Bi%5D%5B0%5D.transcript%3Bif%20(event.results%5Bi%5D.isFinal)%20%7BfinalTranscript%20%2B%3D%20transcript%7D%20else%20%7BinterimTranscript%20%2B%3D%20transcript%7D%7Dconst%20textarea%20%3D%20document.querySelector('textarea%5Baria-label%2C%20placeholder%5D')%20%7C%7C%20document.querySelector('textarea')%20%7C%7C%20document.querySelector('%5Bcontenteditable%3D%22true%22%5D')%3Bif%20(textarea)%20%7Bconst%20displayText%20%3D%20finalTranscript%20%2B%20interimTranscript%3Bif%20(displayText)%20%7Bif%20(textarea.tagName%20%3D%3D%3D%20'TEXTAREA')%20%7Btextarea.value%20%2B%3D%20displayText%3Btextarea.dispatchEvent(new%20Event('input'%2C%20%7Bbubbles%3Atrue%7D))%3B%7D%20else%20%7Bdocument.execCommand('insertText'%2Cfalse%2CdisplayText)%3B%7D%7D%7D%7D%3Brecognition.onerror%20%3D%20(e)%20%3D%3E%20%7Bconsole.error('Ошибка%3A'%2Ce.error)%3B%7D%3Bdocument.addEventListener('keydown'%2C(e)%20%3D%3E%20%7Bif%20(e.code%20%3D%3D%3D%20'Space'%20%26%26%20!isSpaceHeld)%20%7Be.preventDefault()%3BisSpaceHeld%20%3D%20true%3Brecognition.start()%3B%7D%7D)%3Bdocument.addEventListener('keyup'%2C(e)%20%3D%3E%20%7Bif%20(e.code%20%3D%3D%3D%20'Space')%20%7BisSpaceHeld%20%3D%20false%3Bif%20(recognition)%20%7Brecognition.stop()%3B%7D%7D%7D)%3Balert('✅%20Диктовка%20активирована!%5Cn%5CnНажимай%20ПРОБЕЛ%20и%20говори%20по-русски')%3B%7D)()
//
// КОПИРУЙ КОД НИЖЕ В КОНСОЛЬ БРАУЗЕРА:

(function() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert('❌ Web Speech API не поддерживается твоим браузером\n\nИспользуй Chrome, Edge или Safari');
        return;
    }

    const recognition = new SpeechRecognition();
    let isSpaceHeld = false;
    let finalTranscript = '';

    // Конфигурация
    recognition.lang = 'ru-RU';
    recognition.interimResults = true;
    recognition.continuous = true;

    // Индикатор
    const indicator = document.createElement('div');
    indicator.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 15px 20px;
        background: #667eea;
        color: white;
        border-radius: 50px;
        font-size: 14px;
        font-weight: 600;
        display: none;
        align-items: center;
        gap: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    const dot = document.createElement('span');
    dot.style.cssText = `
        width: 10px;
        height: 10px;
        background: white;
        border-radius: 50%;
        animation: pulse 1s infinite;
    `;

    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
        }
    `;
    document.head.appendChild(style);

    indicator.appendChild(dot);
    indicator.appendChild(document.createTextNode('🎤 Слушаю...'));
    document.body.appendChild(indicator);

    // События
    recognition.onstart = () => {
        indicator.style.display = 'flex';
        finalTranscript = '';
    };

    recognition.onend = () => {
        indicator.style.display = 'none';
    };

    recognition.onresult = (event) => {
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;

            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }

        // Ищем textarea в Claude Code
        const textarea = document.querySelector('textarea') ||
                        document.querySelector('[contenteditable="true"]');

        if (textarea) {
            const displayText = finalTranscript + interimTranscript;
            if (displayText) {
                if (textarea.tagName === 'TEXTAREA') {
                    // Для обычного textarea
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    const value = textarea.value;

                    const newValue = value.substring(0, start) + displayText + value.substring(end);
                    textarea.value = newValue;

                    const newPosition = start + displayText.length;
                    textarea.selectionStart = newPosition;
                    textarea.selectionEnd = newPosition;

                    textarea.dispatchEvent(new Event('input', { bubbles: true }));
                    textarea.dispatchEvent(new Event('change', { bubbles: true }));
                } else if (textarea.contentEditable === 'true') {
                    // Для contentEditable
                    document.execCommand('insertText', false, displayText);
                }
            }
        }
    };

    recognition.onerror = (event) => {
        console.error('🔊 Ошибка распознавания:', event.error);
        let message = 'Ошибка';

        if (event.error === 'no-speech') message = 'Не услышал речь';
        if (event.error === 'not-allowed') message = 'Нет доступа к микрофону';
        if (event.error === 'network') message = 'Ошибка сети';

        console.warn('⚠️ ' + message);
    };

    // Слушаем ПРОБЕЛ
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !isSpaceHeld) {
            const target = document.activeElement;

            // Проверяем, находимся ли в textarea или contenteditable
            const isTextarea = target.tagName === 'TEXTAREA';
            const isContentEditable = target.contentEditable === 'true';

            if ((isTextarea || isContentEditable) && !recognition.isRunning) {
                e.preventDefault();
                isSpaceHeld = true;
                finalTranscript = '';
                recognition.start();
            }
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.code === 'Space' && isSpaceHeld) {
            isSpaceHeld = false;
            recognition.stop();
        }
    });

    alert('✅ Диктовка активирована!\n\n' +
          '🎤 Нажимай ПРОБЕЛ в текстовом поле и говори по-русски\n\n' +
          '💡 Удерживай ПРОБЕЛ до конца фразы');
})();
