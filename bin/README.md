# convert2psql 

Is a script that converts the file `Artists.json` and `Artworks.json` to a
[PostgreSQL][postgresql] [psql][psql] script.

Besides copying the data into two tables there are a number of operations to
normalize the data.

Note: While the data is normalized no indexes are created at least for now.


## Usage

```
Usage:
    convert2psql [options]

Options:
    -o, --output=FILE                Write SQL to ouptut file
    -p, --password=PW                Use password for moma user
    -h, --help                       Print this message
```

### Create database by piping into `psql`

```bash
bin/convert2psql | psql -U postgres 

```

### Create SQL file to be used with `psql`

```bash
bin/convert2psql > moma.sql
```

```bash
bin/convert2psql -o moma.sql
```
### Override the default password for the `moma` user

```bash
bin/convert2psql -p 'Very-Confidential!' -o moma.sql
```

## Test Matrix

The script has been tested on:
* Ubuntu 16.04 against ruby: 2.5, 2.6, 2.7, jruby; postgresql: 10, 11, 12, 13
* Ubuntu 18.04 against ruby: 2.5, 2.6, 2.7, jruby; postgresql: 10, 11, 12, 13
* Ubuntu 20.04 against ruby: 2.5, 2.6, 2.7, jruby; postgresql: 10, 11, 12, 13

[postgresql]: https://postgresql.org
[psql]: https://www.postgresql.org/docs/current/app-psql.html
