# Работа со стейтом (через `import { state } from '../../utils/index.js'`)

## 1. Импорт

```js
import { state } from '../../utils/index.js';
```

## 2. Получение состояния чата

```js
const chat = state.getState(chatId);
```

Комментарий: всегда возвращает объект; если стейта нет — создаётся структура по умолчанию.

## 3. Установка значения поля

```js
state.setState(chatId, 'temp_question', 'Текст вопроса');
```

Комментарий: обновляет любое поле в state.

## 4. Работа с временными вопросами

```js
state.setState(chatId, 'temp_question', 'Как списать товар?');
const temp = state.getState(chatId).temp_question;
```

## 5. Работа с service messages

Добавить:

```js
state.addServiceMessage(chatId, messageId);
```

Получить:

```js
const msgs = state.getServiceMessages(chatId);
```

Удалить конкретное:

```js
state.removeServiceMessage(chatId, messageId);
```

## 6. Работа со списком вопросов

Добавить:

```js
state.addQuestion(chatId, { id: 1, text: 'Первый вопрос' });
```

Удалить:

```js
state.removeQuestion(chatId, 1);
```

## 7. Полная очистка стейта чата

```js
state.clearChatState(chatId);
```

Комментарий: сбрасывает все данные в `_defaultState()`.

## 8. Содержание state (кратко)

* `questions` — список набранных вопросов
* `temp_question` — временный вопрос
* `serviceMsgId` — служебные сообщения для удаления
* `questionsMsgId` — id сообщения со списком
* `lastUserMessageId`, `lastBotMessageId` — последние сообщения
* `welcomeMsgId` — стартовые сообщения
