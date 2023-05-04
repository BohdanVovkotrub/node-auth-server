# NODE-AUTH-SERVER
### Bohdan Vovkotrub
ver.1.0.0 - 2023.05
<hr>

<div style="padding-top: 20px; padding-bottom: 50px;">

## <span id="soderzhanie">Содержание</span> 

[<h3>1. Описание</h3>](#opisanie)
[<h3>2. Требования</h3>](#trebovaniya)
[<h3>3. Установка и настройка Базы данных</h3>](#installation_database)
[<h3>3.1. Установка на MacOS</h3>](#installation_database_1)
[<h3>3.1.1. Install Homebrew</h3>](#installation_database_1_1)
[<h3>3.1.2. Install PostgreSQL 15</h3>](#installation_database_1_2)
[<h3>3.1.3. Install PgAdmin4 (optional)</h3>](#installation_database_1_3)
[<h3>3.1.4. How to remove Database</h3>](#installation_database_1_4)
[<h3>4. Установка</h3>](#installation)

<hr>
</div>

# <span id="opisanie">1. Описание</span> 
### [<h6>↑ Вернуться к содержанию ↑</h6>](#soderzhanie) <br>

Будем называть наш <b>NODE-AUTH-SERVER</b> просто как <b>сервис</b> или <b>сервер</b> или <b>приложение</b>.
<br><br>
Это API сервер для аутентификации и авторизации пользователей.

Главные модули, вокруг которых написан наш сервис - <b>express</b> и <b>jsonwebtoken</b>.

Используются такие стратегии аутентификации:
- <b>password</b> - это локальная стратегия, где требуется от пользователя его логин или email и пароль. Все данные пользователя хранятся в базе данных сервиса.
- <b>no-password</b> - от пользователя требуется только его логин или email.
- <b>email-verification-code</b> - от пользователя требуется только его логин или email. Далее ему на email приходит сообщение с рандомным кодом. Пользователь должен ввести этот код для завершения аутентификации.
- <b>ldap</b> - от пользователя требуется его логин или email и доменный пароль. В базе данных сервиса хранится только логин и email. Далее, если такой логин зарегистрирован в нашем сервисе, то сервис обращается к LDAP-домену с логином пользователя и введенным паролем. Далее LDAP-домен отвечает успешно ли прошла аутентификация.

В случае не успеха - сервер отвечает со статусом ошибки на HTTP запрос пользователя, например '400 Bad request'.
Если всё прошло успешно, то пользователь получает статус успеха '200 OK'. Также в ответе пользователь получит данные о себе `(userData)`, действия, которые он может выполнять `(accessActions)` и JWT-токены `(tokenData)` - `accessToken` и `refreshToken` соответственно. В `accessToken` также хранится `userData` и `accessActions`. Где хранить `accessToken` - клиент должен позаботиться сам - обычно это LocalStorage или Cookie. `RefreshToken` хранит минимальную информацию о пользователе, достаточную чтобы подтвержить `accessToken`. При ответе сервер сохраняет `refreshToken` в cookie пользователя.

В качестве базы данных используеттся PostgreSQL. Для облегчения работы с ней в NodeJS используется ORM модуль `Sequelize`.

При запуске сервис синхронизируется с базой данных и, если еще не создано, создаёт записи по-умолчанию. Например, при первом запуске создает пользователя администратора.
При синхронизации все необходимые таблицы в Базе Данных создадутся сами. От вас требуется только создать пустую БД.

<br>

# <span id="trebovaniya">2. Требования</span>
### [<h6>↑ Вернуться к содержанию ↑</h6>](#soderzhanie) <br>

- База данных PostgreSQL [<h4>See how to install DB PostgreSQL</h4>](#installation_database)
- Node.JS


# <br><span id="installation_database">3. Установка и настройка Базы данных</span>
### [<h6>↑ Вернуться к содержанию ↑</h6>](#soderzhanie) <br>

The database is a PostgreSQL 15.<br>

## <br><span id="installation_database_1">3.1. Установка Базы данных на MacOS

### <br><span id="installation_database_1_1">3.1.1. Install Homebrew

1.  Visit an [official website of Homebrew](https://brew.sh/) and copy-paste in a Terminal installing command.
    Now this command looks like this:
    ```
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    ```
    It was installed homebrew to your system.
    <br>
2.  After installing homebrew you need to add a brew to $PATH by two commands:
    ```
    (echo; echo 'eval "$(/usr/local/bin/brew shellenv)"') >> /Users/user/.zprofile
    eval "$(/usr/local/bin/brew shellenv)"
    ```
3.  Run following command to make sure everythig is fine:
    ```
    brew doctor
    ```
    If thats fine you'll get a message `Your system is ready to brew.`


### <br><span id="installation_database_1_2">3.1.2. Install PostgreSQL 15
<br>

1.  Install PostgreSQL 15 using Homebrew:
    ```
    brew install postgresql@15
    ```
2.  Add PostgreSQL's apps to $PATH:
    ```
    echo 'export PATH="/usr/local/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc

    export LDFLAGS="-L/usr/local/opt/postgresql@15/lib"
    export CPPFLAGS="-I/usr/local/opt/postgresql@15/include"

    brew link postgresql@15 --force
    ```
3. Start PostgreSQL:
    ```
    brew services start postgresql@15
    ```
4. Connect to PostgreSQL using PSQL tool in Terminal:
    ```
    psql postgres
    ```
5. Create new Database 'my_database' with owner user 'owner_username' and password 'your_password':
    ```
    CREATE USER owner_username WITH ENCRYPTED PASSWORD 'your_password';
    CREATE DATABASE my_database
        WITH
        OWNER = owner_username
        ENCODING = 'UTF8'
        LC_COLLATE = 'en_US.UTF-8'
        LC_CTYPE = 'en_US.UTF-8'
        TABLESPACE = pg_default
        CONNECTION LIMIT = -1
        IS_TEMPLATE = False;

    GRANT TEMPORARY, CONNECT ON DATABASE my_database TO PUBLIC;

    GRANT ALL ON DATABASE my_database TO owner_username;
    ```

### <br><span id="installation_database_1_3">3.1.3. Install PgAdmin4 _(optional)_ 

<br>For managing database with GUI you can install a `PgAdmin4` utility.<br><br>


1.  Go to https://www.pgadmin.org/download/pgadmin-4-macos/ and download the last version (now is `pgadmin4-6.21.dmg`).

2.  Run downloaded `pgadmin4-6.21.dmg` and drag app to an Application folder link - it will copy pgadmin4 to Applications.

3.  Run PgAdmin 4 from lauchpad

4.  Firstly PgAdmin4 will ask to create a password. Create it.

5.  Right-click to Servers and register new server.
    In General input name, for example 'postgres'.
    In Connection input 
    address - localhost (IP address of database server)
    port - 5432
    maintenance database - postgres
    username - postgres (or maybe your localmachine user, for example 'user')

## <br><span id="installation_database_1_4">3.1.4. How to remove Database
<br>

1.  Connect to PostgreSQL using PSQL tool in Terminal:
    ```
    psql postgres
    ```

2.  Remove database using PSQL tool in Terminal:
    ```
    DROP DATABASE IF EXISTS my_database;
    ```


# <br><span id="installation">4. Установка</span>
### [<h6>↑ Вернуться к содержанию ↑</h6>](#soderzhanie) <br>

1. Скачать это с GitHub и перейти в папку.
    ```
    git clone <адрес-этого-приложения-на-гитхабе>
    cd NODE-AUTH-SERVER
    ```
2. Создайте файл `.env` и заполните его данные по примеру как в `.env-example`

3. Перейдите в `./src/v1/db/default-values/` и заполните данные, которые должны быть в базе данных по-умолчанию. Например пользователь 'USER', задайте ему пароль и например группа 'USERS'. Чтобы пользователь USER поместить в группу USERS нужно в `./src/v1/db/default-values/junctions/default-usergroup_users.json` добавить запись:

    ```
    [
        ...
        {
            "usergroupName": "Users",
            "userLogin": "User"
        }
        ...
    ]
    ```

    И тогда, при запуске сервера, данные, которые будут в файлах из папки `./src/v1/db/default-values/` будут синхронизированы с базой данных.

4. После того, как внесли конфигурацию в `.env` и внесли дефолтные данные в `./src/v1/db/default-values/`, теперь мы можем запустить сервер. Но сначала нужно загрузить все дополнительные пакеты Node.JS:

    Загружаем все дополнительные пакеты Node.JS:

    ```
    npm install
    ```

    Запускаем сервер:

    ```
    npm run start
    ```
    или 
    ```
    node start
    ```