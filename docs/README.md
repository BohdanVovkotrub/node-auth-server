# NODE-AUTH-SERVER
### Bohdan Vovkotrub
ver.1.0.0 - 2023.05
<hr>

<div style="padding-top: 20px; padding-bottom: 50px;">

## <span id="soderzhanie">Contents</span> 

[<h3>1. Description</h3>](#description)  
[<h3>2. Requirements</h3>](#requirements)  
[<h3>3. Database Installation and Setup</h3>](#installation_database)  
[<h3>3.1. Installation on MacOS</h3>](#installation_database_1)  
[<h3>3.1.1. Install Homebrew</h3>](#installation_database_1_1)  
[<h3>3.1.2. Install PostgreSQL 15</h3>](#installation_database_1_2)  
[<h3>3.1.3. Install PgAdmin4 (optional)</h3>](#installation_database_1_3)  
[<h3>3.1.4. How to Remove Database</h3>](#installation_database_1_4)  
[<h3>4. Installation</h3>](#installation)  

<hr>
</div>

# <span id="description">1. Description</span> 
### [<h6>↑ Back to Contents ↑</h6>](#soderzhanie) <br>

We will refer to our <b>NODE-AUTH-SERVER</b> simply as <b>service</b> or <b>server</b> or <b>application</b>.
<br><br>
This is an API server for user authentication and authorization.

The main modules around which our service is written are <b>express</b> and <b>jsonwebtoken</b>.

The following authentication strategies are used:
- <b>password</b> - this is a local strategy where the user is required to provide their login or email and password. All user data is stored in the service's database.
- <b>no-password</b> - the user is only required to provide their login or email.
- <b>email-verification-code</b> - the user is only required to provide their login or email. Then, a random code is sent to the user's email. The user must enter this code to complete the authentication.
- <b>ldap</b> - the user is required to provide their login or email and domain password. Only the login and email are stored in the service's database. If such a login is registered in our service, the service contacts the LDAP domain with the user's login and entered password. The LDAP domain responds whether the authentication was successful.

In case of failure, the server responds with an error status to the user's HTTP request, for example, '400 Bad request'.
If everything is successful, the user receives a success status '200 OK'. Additionally, the user will receive their data `(userData)`, actions they can perform `(accessActions)`, and JWT tokens `(tokenData)` - `accessToken` and `refreshToken` respectively. The `accessToken` also stores `userData` and `accessActions`. The client must take care of where to store the `accessToken` - usually this is LocalStorage or Cookie. The `refreshToken` stores minimal user information, enough to confirm the `accessToken`. Upon response, the server saves the `refreshToken` in the user's cookie.

PostgreSQL is used as the database. The `Sequelize` ORM module is used in NodeJS to simplify working with it.

When launched, the service synchronizes with the database and creates default records if not yet created. For example, it creates an administrator user on the first run.
During synchronization, all necessary tables in the database will be created automatically. You only need to create an empty database.

<br>

# <span id="requirements">2. Requirements</span>
### [<h6>↑ Back to Contents ↑</h6>](#soderzhanie) <br>

- PostgreSQL Database [<h4>See how to install PostgreSQL Database</h4>](#installation_database)
- Node.JS


# <br><span id="installation_database">3. Database Installation and Setup</span>
### [<h6>↑ Back to Contents ↑</h6>](#soderzhanie) <br>

The database is PostgreSQL 15.<br>

## <br><span id="installation_database_1">3.1. Installing the Database on MacOS

### <br><span id="installation_database_1_1">3.1.1. Install Homebrew

1.  Visit the [official Homebrew website](https://brew.sh/) and copy-paste the installation command into the Terminal.
    Currently, the command looks like this:
    ```
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    ```
    This will install Homebrew on your system.
    <br>
2.  After installing Homebrew, you need to add brew to $PATH by running these two commands:
    ```
    (echo; echo 'eval "$(/usr/local/bin/brew shellenv)"') >> /Users/user/.zprofile
    eval "$(/usr/local/bin/brew shellenv)"
    ```
3.  Run the following command to ensure everything is fine:
    ```
    brew doctor
    ```
    If everything is fine, you'll get the message `Your system is ready to brew.`


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
4. Connect to PostgreSQL using the PSQL tool in the Terminal:
    ```
    psql postgres
    ```
5. Create a new Database 'my_database' with owner user 'owner_username' and password 'your_password':
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

<br>To manage the database with a GUI, you can install the `PgAdmin4` utility.<br><br>

1.  Go to https://www.pgadmin.org/download/pgadmin-4-macos/ and download the latest version (currently `pgadmin4-6.21.dmg`).

2.  Run the downloaded `pgadmin4-6.21.dmg` and drag the app to the Application folder link - this will copy pgadmin4 to Applications.

3.  Run PgAdmin 4 from Launchpad.

4.  PgAdmin4 will initially ask you to create a password. Create it.

5.  Right-click on Servers and register a new server.
    In General, input the name, for example 'postgres'.
    In Connection, input 
    address - localhost (IP address of the database server)
    port - 5432
    maintenance database - postgres
    username - postgres (or maybe your local machine user, for example 'user')

## <br><span id="installation_database_1_4">3.1.4. How to Remove Database
<br>

1.  Connect to PostgreSQL using the PSQL tool in the Terminal:
    ```
    psql postgres
    ```

2.  Remove the database using the PSQL tool in the Terminal:
    ```
    DROP DATABASE IF EXISTS my_database;
    ```


# <br><span id="installation">4. Installation</span>
### [<h6>↑ Back to Contents ↑</h6>](#soderzhanie) <br>

1. Download this from GitHub and navigate to the folder.
    ```
    git clone <repository-url>
    cd NODE-AUTH-SERVER
    ```
2. Create a `.env` file and fill in the data as per the `.env-example`.

3. Navigate to `./src/v1/db/default-values/` and fill in the default data that should be in the database. For example, the user 'USER', set a password for them and a group 'USERS'. To add the user USER to the group USERS, add a record to `./src/v1/db/default-values/junctions/default-usergroup_users.json`:

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

    When the server starts, the data in the files from the `./src/v1/db/default-values/` folder will be synchronized with the database.

4. After configuring the `.env` file and setting the default data in `./src/v1/db/default-values/`, we can now start the server. But first, we need to install all necessary Node.JS packages:

    Install all necessary Node.JS packages:

    ```
    npm install
    ```

    Start the server:

    ```
    npm run start
    ```
    or 
    ```
    node start
    ```
