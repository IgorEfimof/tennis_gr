document.addEventListener("DOMContentLoaded", () => {
    const gameCount = 3;
    const gamesContainer = document.getElementById("games");
    const predictBtn = document.getElementById("predictBtn");
    const resultDiv = document.getElementById("result");
    const avgASpan = document.getElementById("avgA");
    const avgBSpan = document.getElementById("avgB");
    const winnerSpan = document.getElementById("winner");

    const customKeyboard = document.getElementById("custom-keyboard");
    const keyboardButtons = customKeyboard.querySelectorAll("button");

    let activeInput = null; // Переменная для отслеживания активного поля ввода

    // Создаем поля ввода для каждого гейма
    for (let i = 1; i <= gameCount; i++) {
        const div = document.createElement("div");
        div.className = "game-input";
        div.innerHTML = `
            <p><strong>Гейм ${i}</strong></p>
            <input type="text" inputmode="none" placeholder="Коэффициент A" data-player="a" data-id="${i}" maxlength="5" readonly>
            <input type="text" inputmode="none" placeholder="Коэффициент B" data-player="b" data-id="${i}" maxlength="5" readonly>
        `;
        gamesContainer.appendChild(div);
    }

    const inputs = document.querySelectorAll("input[type='text']");

    // Обработчики для полей ввода (появление/скрытие клавиатуры)
    inputs.forEach((input) => {
        // Устанавливаем inputmode="none" и readonly, чтобы предотвратить появление системной клавиатуры
        input.setAttribute('inputmode', 'none');
        input.setAttribute('readonly', 'readonly');

        input.addEventListener("focus", () => {
            activeInput = input;
            customKeyboard.classList.add("visible");
            document.body.classList.add("keyboard-active"); // Добавляем класс для сдвига контента
            input.select(); // Выделяем текст при фокусе
        });

        // При потере фокуса скрываем клавиатуру, если это не последнее поле
        input.addEventListener("blur", () => {
             // Проверяем, если focus ушел на другой элемент, не являющийся кнопкой клавиатуры
            setTimeout(() => {
                if (!document.activeElement || !customKeyboard.contains(document.activeElement)) {
                    customKeyboard.classList.remove("visible");
                    document.body.classList.remove("keyboard-active");
                }
            }, 0); // Небольшая задержка, чтобы дать клику по кнопке клавиатуры сработать
        });
    });

    // Обработчик для кнопок кастомной клавиатуры
    keyboardButtons.forEach(button => {
        button.addEventListener("click", () => {
            if (!activeInput) return; // Если нет активного поля, ничего не делаем

            const key = button.dataset.key;
            let currentValue = activeInput.value;

            if (key === "delete") {
                // Удаляем последний символ
                activeInput.value = currentValue.slice(0, -1);
            } else if (key === ".") {
                // Обрабатываем ввод десятичной точки/запятой
                if (!currentValue.includes(',')) { // Если запятой еще нет
                    if (currentValue.length === 0) {
                        currentValue = "0,"; // Если поле пустое, начинаем с "0,"
                    } else {
                        currentValue += ","; // Добавляем запятую
                    }
                }
                activeInput.value = currentValue;
            } else {
                // Вводим цифры
                // Добавляем символ, если длина не превышает maxlength
                if (currentValue.length < activeInput.maxLength) {
                    currentValue += key;
                    activeInput.value = currentValue;
                }
            }

            // Дополнительная логика форматирования и перехода к следующему полю, как у вас было
            let value = activeInput.value;
            value = value.replace(/[^0-9,]/g, ""); // Убираем всё, кроме цифр и запятой

            // Если нет запятой, но есть хотя бы одна цифра — ставим запятую после первой цифры
            if (!value.includes(",") && value.length >= 1) {
                if (value.length > 1 && value.length < activeInput.maxLength) { // Учитываем maxlength
                    value = value[0] + ",";
                } else if (value.length === 1) {
                    value = value + ",";
                }
            }

            if (value.includes(",")) {
                const parts = value.split(",");
                const before = parts[0];
                let after = parts[1] || ""; // Учитываем, что after может быть пустым

                // Разрешаем вводить максимум две цифры после запятой
                if (after.length > 2) {
                    after = after.slice(0, 2);
                }
                value = `${before},${after}`;
            }

            // Ограничиваем общую длину до maxlength
            if (value.length > activeInput.maxLength) {
                value = value.slice(0, activeInput.maxLength);
            }

            activeInput.value = value;

            // Переход к следующему полю при завершении формата X,XX
            // Или если это последнее поле и оно заполнено до максимальной длины
            if (value.includes(",") && value.split(",")[1].length === 2) {
                const currentIndex = Array.from(inputs).indexOf(activeInput);
                const nextInput = inputs[currentIndex + 1];
                if (nextInput) {
                    nextInput.focus();
                } else {
                    activeInput.blur(); // Скрываем клавиатуру, если это последнее поле
                    customKeyboard.classList.remove("visible");
                    document.body.classList.remove("keyboard-active");
                }
            }
        });
    });


    predictBtn.addEventListener("click", () => {
        const inputs = document.querySelectorAll("input[type='text']");
        let totalA = 0;
        let totalB = 0;
        let count = 0;

        inputs.forEach((input) => {
            const valueStr = input.value.replace(/,/g, ".");
            const value = parseFloat(valueStr);
            if (!isNaN(value)) {
                if (input.dataset.player === "a") {
                    totalA += value;
                } else {
                    totalB += value;
                }
                count++;
            }
        });

        if (count === 0) {
            alert("Введите хотя бы один коэффициент.");
            return;
        }

        const avgA = (totalA / count).toFixed(2);
        const avgB = (totalB / count).toFixed(2);

        let winner = "Ничья";
        if (avgA < avgB) {
            winner = "Игрок A";
        } else if (avgB < avgA) {
            winner = "Игрок B";
        }

        avgASpan.textContent = avgA;
        avgBSpan.textContent = avgB;
        winnerSpan.textContent = winner;

        resultDiv.classList.remove("hidden");
        // Скрываем клавиатуру после расчета
        customKeyboard.classList.remove("visible");
        document.body.classList.remove("keyboard-active");
    });
});
