// Скрипт распознавания речи с вводом текста в любое поле
// Использование: добавь <script src="speech-input.js"></script> перед закрывающим </body>

(function() {
    // Проверка поддержки Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        console.warn('Web Speech API не поддерживается этим браузером');
        return;
    }

    const recognition = new SpeechRecognition();
    let isListening = false;
    let activeElement = null;
    let isSpaceHeld = false;

    // Конфигурация
    recognition.lang = 'ru-RU';
    recognition.interimResults = true;
    recognition.continuous = true;

    let finalTranscript = '';
    let interimTranscript = '';

    // Создаём визуальный индикатор
    const indicator = document.createElement('div');
    indicator.id = 'speech-indicator';
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
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    const dot = document.createElement('span');
    dot.style.cssText = `
        width: 10px;
        height: 10px;
        background: #fff;
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

    // События распознавания
    recognition.onstart = () => {
        isListening = true;
        indicator.style.display = 'flex';
        finalTranscript = '';
        interimTranscript = '';
    };

    recognition.onend = () => {
        isListening = false;
        indicator.style.display = 'none';
    };

    recognition.onresult = (event) => {
        interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;

            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }

        // Вставляем текст в поле в реальном времени
        const displayText = finalTranscript + interimTranscript;
        if (activeElement && displayText) {
            insertTextAtCursor(activeElement, displayText);
        }
    };

    recognition.onerror = (event) => {
        let errorMessage = 'Ошибка';

        switch (event.error) {
            case 'no-speech':
                errorMessage = 'Не услышал речь';
                break;
            case 'audio-capture':
                errorMessage = 'Микрофон не найден';
                break;
            case 'not-allowed':
                errorMessage = 'Нет доступа к микрофону';
                break;
            case 'network':
                errorMessage = 'Ошибка сети';
                break;
        }

        console.error('Ошибка распознавания:', errorMessage);
    };

    // Функция для вставки текста в позицию курсора
    function insertTextAtCursor(element, text) {
        if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
            const start = element.selectionStart;
            const end = element.selectionEnd;
            const value = element.value;

            // Заменяем выделенный текст или вставляем в позицию курсора
            const newValue = value.substring(0, start) + text + value.substring(end);
            element.value = newValue;

            // Перемещаем курсор в конец вставленного текста
            const newPosition = start + text.length;
            element.selectionStart = newPosition;
            element.selectionEnd = newPosition;

            // Триггерим events для реактивности фреймворков
            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new Event('change', { bubbles: true }));

        } else if (element.contentEditable === 'true') {
            // Для contentEditable элементов
            document.execCommand('insertText', false, text);
        }
    }

    // Слушаем нажатия клавиш
    document.addEventListener('keydown', (e) => {
        // Проверяем, что пробел нажат в текстовом поле
        if (e.code === 'Space' && !isSpaceHeld) {
            const target = document.activeElement;

            // Проверяем, что это текстовое поле
            const isTextInput = target.tagName === 'TEXTAREA' ||
                               (target.tagName === 'INPUT' &&
                                (target.type === 'text' || target.type === '' || target.type === 'search'));
            const isContentEditable = target.contentEditable === 'true';

            if ((isTextInput || isContentEditable) && !isListening) {
                e.preventDefault();
                isSpaceHeld = true;
                activeElement = target;
                finalTranscript = '';
                interimTranscript = '';
                recognition.start();
            }
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.code === 'Space' && isSpaceHeld) {
            isSpaceHeld = false;
            if (isListening) {
                recognition.stop();
                // Вставляем финальный текст
                if (activeElement && finalTranscript.trim()) {
                    insertTextAtCursor(activeElement, finalTranscript.trim() + ' ');
                }
                finalTranscript = '';
                interimTranscript = '';
            }
        }
    });

    // Отслеживаем активный элемент
    document.addEventListener('focus', (e) => {
        if (e.target.tagName === 'TEXTAREA' ||
            (e.target.tagName === 'INPUT' &&
             (e.target.type === 'text' || e.target.type === '' || e.target.type === 'search')) ||
            e.target.contentEditable === 'true') {
            activeElement = e.target;
        }
    }, true);

    console.log('✅ Speech-to-text активирован. Нажми ПРОБЕЛ в текстовом поле и говори по-русски!');
})();
