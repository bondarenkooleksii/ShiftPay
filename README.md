# ShiftPay

ShiftPay — сучасний веб-додаток для обліку робочих змін та розрахунку виплат для закладів індустрії гостинності (кав'ярні, бари, ресторани). Додаток підтримує рольову модель (Власник бізнесу, Адміністратор, Працівник/Бариста), подання змін персоналом на модерацію та підтвердження виплат.

## 🚀 Запуск проєкту локально

Проєкт складається з двох незалежних частин:

- `frontend/` — веб-клієнт (React + Vite)
- `backend/` — REST API (Node.js + Express)

1. **Встановлення залежностей** (корінь, фронтенд і бекенд):

   ```bash
   npm run install:all
   ```

2. **Налаштування змінних середовища**:

   ```bash
   cp frontend/.env.example frontend/.env
   cp backend/.env.example backend/.env
   ```

3. **Запуск бекенду (Express API)**:

   ```bash
   cd backend
   npm run dev
   ```

   API буде доступне за адресою `http://localhost:4000/api`.

4. **Запуск фронтенду**:

   ```bash
   cd frontend
   npm run dev
   ```

   Додаток буде доступний за адресою [http://localhost:5173/](http://localhost:5173/). Якщо у `frontend/.env` не вказано `VITE_API_URL`, працює вбудований мок-сервер MSW.

5. **Збірка фронтенду для продакшну**:

   ```bash
   cd frontend
   npm run build
   npm run preview
   ```

6. **Компонентні тести з покриттям коду (Cypress)**:

   ```bash
   cd frontend
   npm run test:component
   ```

   Тести лежать у `frontend/cypress/component/`, звіт покриття — у `frontend/coverage/index.html`.
   Інтерактивний режим: `npm run test:component:open`, повна таблиця покриття: `npm run coverage:table`.

З кореня проєкту ці ж команди можна запускати як `npm run backend` і `npm run frontend`.

---

> [!NOTE]
> **Примітка для користувачів Windows PowerShell:**
> Якщо при виконанні команди `npm run dev` у PowerShell виникає помилка безпеки політики виконання скриптів (`PSSecurityException` щодо `npm.ps1`), виконайте один раз команду:
>
> ```powershell
> Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
> ```
>
> Або запускайте через:
>
> ```powershell
> npm.cmd run dev
> ```

---

## 🛠 Стек технологій

- **React 19**
- **Vite 8**
- **Tailwind CSS v4** (`@tailwindcss/vite`)
- **TypeScript**
- **Node.js + Express 5** (REST API, JWT-авторизація, bcrypt)

## 📱 Ролі та функціонал

- **Працівник (Employee)**: Перегляд поточного балансу та відпрацьованих годин, подання робочої зміни (`+ Подати зміну`), архів квитанцій та виплат, підтвердження отримання коштів.
- **Адміністратор (Admin)**: Журнал робочих змін, внесення змін працівників, коригування та підтвердження заявок (модерація).
- **Власник бізнесу (Owner)**: Управління закладами (`+ Додати заклад`), пошук закладів, перегляд аналітики, швидке перемикання між ролями.
- **Режим Figma Canvas**: Можливість у будь-який момент перемкнути перегляд на вихідний дизайн артбордів Figma через кнопку `📐 Figma Canvas` у правому нижньому куті.

---

ShiftPay — A lightweight React-based shift tracking &amp; payroll management web application for small hospitality venues (cafes, bars). Features role-based salary isolation (RBAC), employee self-reporting, and two-way payment confirmation via bank receipts.

https://www.figma.com/make/Ryf0I7MP32AdBDehOHwy09/ShiftPay-Login-Screen-Design?t=FzsQdptaLTl1t2vD-1
